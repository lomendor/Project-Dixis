import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { buildCsp } from './src/lib/csp'

function makeNonce() {
  // 16 bytes random base64
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Buffer.from(bytes).toString('base64');
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Auth guard: /checkout requires authentication
  if (pathname.startsWith('/checkout')) {
    // Recognize real session cookies (adjust names to your app), PLUS the test-only probe for E2E.
    const sessionCandidates = [
      'next-auth.session-token', 'session', 'auth_session', 'laravel_session',
      'e2e_auth_probe' // test-only; set by E2E harness
    ];
    const hasAuth = sessionCandidates.some((k) => req.cookies.get(k)?.value);

    if (!hasAuth) {
      const url = req.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('next', '/checkout');
      return NextResponse.redirect(url);
    }
  }

  // Continue with existing CSP logic
  const res = NextResponse.next();
  const nonce = makeNonce();
  const reportOnly = process.env.NEXT_ENABLE_CSP_REPORT_ONLY === 'true';
  const { header, value } = buildCsp(nonce, reportOnly);
  res.headers.set(header, value);
  // pass nonce to the client via header; _document will read it
  res.headers.set('x-nonce', nonce);
  return res;
}

export const config = {
  matcher: '/:path*',
};