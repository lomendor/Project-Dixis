import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Unified Next.js middleware — single file at project root.
 *
 * Handles three concerns in priority order:
 * 1. Canonical host redirect: www.dixis.gr → dixis.gr
 * 2. Auth guard for protected pages (Strategic Fix 2B)
 * 3. Dev/CI endpoint hiding in production
 *
 * NOTE: Next.js ignores src/middleware.ts when middleware.ts exists
 * at the project root. All middleware logic MUST live here.
 */

const LOGIN_PATH = '/auth/login'

// Public routes that START with /producer but are NOT protected
const PUBLIC_PRODUCER_PATHS = ['/producers']

/**
 * Check if a path requires authentication.
 * Uses exact segment matching to avoid false positives:
 * - /producer/dashboard → protected ✅
 * - /producers (public listing) → NOT protected ✅
 * - /producers/join → NOT protected ✅
 */
function requiresAuth(pathname: string): boolean {
  // Public paths that would otherwise match
  if (PUBLIC_PRODUCER_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return false
  }
  // Protected prefixes — must match exact segment boundary
  if (pathname === '/producer' || pathname.startsWith('/producer/')) return true
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return true
  if (pathname === '/account' || pathname.startsWith('/account/')) return true
  if (pathname === '/ops' || pathname.startsWith('/ops/')) return true
  return false
}

export const config = {
  matcher: [
    // Canonical redirect + auth guard applies to all non-static paths
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
    // Protected API endpoints hidden in production
    '/api/ci/:path*',
    '/api/dev/:path*',
    '/api/ops/test-error',
    '/api/ops/status',
  ],
};

export default function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';
  const url = req.nextUrl.clone();

  // 1. Canonical host redirect: www → apex (fixes cart localStorage bug)
  if (host === 'www.dixis.gr') {
    url.protocol = 'https:';
    url.hostname = 'dixis.gr';
    url.port = '';
    return NextResponse.redirect(url, 301);
  }

  const pathname = req.nextUrl.pathname;

  // 2. Strategic Fix 2B: Server-side auth for protected pages
  //    Checks for session cookie (Sanctum SPA) or mock cookie (E2E tests).
  //    Does NOT verify token validity — just checks presence for fast redirect.
  if (requiresAuth(pathname)) {
    const hasSession = req.cookies.has('dixis_session') || req.cookies.has('mock_session')
    if (!hasSession) {
      const loginUrl = new URL(LOGIN_PATH, req.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // 3. Protected dev/CI endpoints — hide in production
  const isProtectedEndpoint =
    pathname.startsWith('/api/ci/') ||
    pathname.startsWith('/api/dev/') ||
    pathname === '/api/ops/test-error' ||
    pathname === '/api/ops/status';

  if (isProtectedEndpoint && process.env.NODE_ENV === 'production') {
    const token = req.headers.get('x-ops-token');
    if (process.env.OPS_TOKEN && token === process.env.OPS_TOKEN) {
      return NextResponse.next();
    }
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  return NextResponse.next();
}
