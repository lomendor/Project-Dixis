import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
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
