import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    // Canonical redirect applies to all paths
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
    // Original matchers for protected endpoints
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
  // Always redirect www.dixis.gr → dixis.gr for consistent localStorage origin
  if (host === 'www.dixis.gr') {
    url.host = 'dixis.gr';
    return NextResponse.redirect(url, 301); // Permanent redirect
  }

  // 2. Protected endpoints (original logic)
  const path = req.nextUrl.pathname;
  const isProtectedEndpoint =
    path.startsWith('/api/ci/') ||
    path.startsWith('/api/dev/') ||
    path === '/api/ops/test-error' ||
    path === '/api/ops/status';

  if (isProtectedEndpoint && process.env.NODE_ENV === 'production') {
    // Προαιρετικό bypass με token
    const token = req.headers.get('x-ops-token');
    if (process.env.OPS_TOKEN && token === process.env.OPS_TOKEN) {
      return NextResponse.next();
    }
    // Απόκρυψη endpoints στην παραγωγή
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  return NextResponse.next();
}
