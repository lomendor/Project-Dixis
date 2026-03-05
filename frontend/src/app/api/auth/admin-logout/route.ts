import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth/cookies';

/**
 * POST /api/auth/admin-logout
 *
 * FIX-ADMIN-AUTH-01: Clears the admin JWT cookie (dixis_jwt) AND any stale
 * Laravel session cookies to prevent cross-session interference.
 * No auth check needed — clearing a cookie is always safe.
 */
export async function POST() {
  const response = NextResponse.json({ success: true });

  // Clear admin JWT cookie
  clearSessionCookie(response);

  // FIX-ADMIN-AUTH-01: Also clear Laravel session cookies to prevent stale
  // Sanctum sessions from interfering with subsequent logins.
  // These are set by Laravel when a consumer logs in via Sanctum SPA auth.
  response.cookies.set('dixis_session', '', { path: '/', maxAge: 0, domain: '.dixis.gr' });
  response.cookies.set('XSRF-TOKEN', '', { path: '/', maxAge: 0, domain: '.dixis.gr' });

  return response;
}
