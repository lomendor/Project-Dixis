import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Strategic Fix 2B: Server-side auth middleware for protected routes.
 *
 * Previously only /ops/* was protected. Producer, admin, and account pages
 * relied on client-side AuthGuard which:
 * 1. Flashes page content before redirecting
 * 2. Can be bypassed by disabling JS
 * 3. Shows a loading spinner instead of a proper redirect
 *
 * This middleware checks for auth cookies (set by Sanctum SPA auth)
 * and redirects to login if missing. Does NOT verify token validity
 * (that's the backend's job) — just checks presence for fast redirect.
 *
 * NOTE: Sentry autoInstrumentMiddleware is disabled in next.config.ts
 * because its Rollup-based wrapping loader silently swallows middleware
 * logic in standalone builds. We keep Sentry error reporting via the
 * try/catch + Sentry.captureException pattern instead.
 */

const PROTECTED_PREFIXES = ['/producer', '/admin', '/account']
const LOGIN_PATH = '/auth/login'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only intercept protected paths
  const needsAuth = PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix))
  if (!needsAuth) return NextResponse.next()

  // Check for session cookie (Sanctum SPA auth) or mock session (E2E tests)
  const hasSession = request.cookies.has('dixis_session') || request.cookies.has('mock_session')

  if (!hasSession) {
    const loginUrl = new URL(LOGIN_PATH, request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/ops/:path*', '/producer/:path*', '/admin/:path*', '/account/:path*'],
}
