import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Rate limiting configuration
const WINDOW_MS = Number(process.env.RL_WINDOW_MS ?? '60000'); // 60s
const MAX = Number(process.env.RL_MAX ?? '60');                // 60 req/60s
const BURST = Number(process.env.RL_BURST ?? '30');            // +30 burst

type Bucket = { tokens: number; last: number };
const buckets = new Map<string, Bucket>(); // in-memory, per-process

const API_GROUPS: { rx: RegExp; cost: number }[] = [
  { rx: /^\/api\/checkout$/, cost: 5 },         // πιο ακριβή
  { rx: /^\/api\/orders\/lookup$/, cost: 2 },
  { rx: /^\/api\/orders\/track$/, cost: 2 },    // public tracking
  { rx: /^\/api\/cart(\/.*)?$/, cost: 1 },
];

function matchGroup(pathname: string) {
  return API_GROUPS.find(g => g.rx.test(pathname));
}

function applyRateLimit(req: NextRequest): NextResponse | null {
  const { pathname } = new URL(req.url);
  const group = matchGroup(pathname);
  if (!group) return null;

  // bypass με ops token (operational scripts)
  if (req.headers.get('x-ops-token')) return null;

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  const key = `${ip}:${group.rx.source}`;
  const now = Date.now();
  const refillRate = MAX / WINDOW_MS; // tokens per ms

  const bucket = buckets.get(key) ?? { tokens: MAX + BURST, last: now };
  const elapsed = now - bucket.last;
  bucket.tokens = Math.min(MAX + BURST, bucket.tokens + elapsed * refillRate);
  bucket.last = now;

  const cost = group.cost;
  if (bucket.tokens < cost) {
    const retryMs = Math.ceil((cost - bucket.tokens) / refillRate);
    const res = NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
    res.headers.set('Retry-After', String(Math.max(1, Math.ceil(retryMs / 1000))));
    res.headers.set('X-RateLimit-Limit', String(MAX));
    res.headers.set('X-RateLimit-Remaining', String(Math.max(0, Math.floor(bucket.tokens))));
    return res;
  }

  bucket.tokens -= cost;
  buckets.set(key, bucket);
  return null;
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Apply rate limiting first
  const rateLimitResponse = applyRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  const res = NextResponse.next();

  // Security headers (lightweight, συμβατά)
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('X-Frame-Options', 'DENY');

  // Admin guard μόνο σε production: απαιτεί BASIC_AUTH=1
  if (
    process.env.NODE_ENV === 'production' &&
    url.pathname.startsWith('/admin')
  ) {
    if (process.env.BASIC_AUTH !== '1') {
      return new NextResponse('Not Found', { status: 404 });
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
