import { NextRequest, NextResponse } from 'next/server';
import { hasAdminSession } from '@/lib/auth/guard';

/**
 * Next.js Middleware - Route Protection
 *
 * Protects admin routes from unauthorized access.
 * Runs before every request to /admin/* pages.
 */

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /admin/* routes
  if (pathname.startsWith('/admin')) {
    const isAdmin = await hasAdminSession(req);

    if (!isAdmin) {
      // Redirect to login page with return URL
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
