import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AdminError } from '@/lib/auth/admin';
import { SESSION_COOKIE_NAME } from '@/lib/auth/cookies';

/**
 * Shared helpers for admin API routes that proxy to Laravel.
 *
 * getAdminToken()    — reads the JWT from the session cookie
 * handleAdminError() — maps AdminError codes to proper HTTP status codes
 *
 * Created: 2026-02-24 — Fix admin dashboard auth (replaces auth_token references)
 */

/**
 * Read the admin JWT token from the session cookie.
 * Falls back to Authorization header for API clients.
 */
export async function getAdminToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return (
    cookieStore.get(SESSION_COOKIE_NAME)?.value ||
    null
  );
}

/**
 * Convert AdminError (from requireAdmin()) into a proper NextResponse.
 *
 * - NOT_AUTHENTICATED → 401 (session expired / not logged in)
 * - NOT_ADMIN         → 403 (logged in but not admin)
 * - ADMIN_INACTIVE    → 403 (admin account deactivated)
 * - Unknown error     → 500
 */
export function handleAdminError(error: unknown): NextResponse {
  if (error instanceof AdminError) {
    const status = error.code === 'NOT_AUTHENTICATED' ? 401 : 403;
    return NextResponse.json({ error: error.message, code: error.code }, { status });
  }

  console.error('[admin] Unexpected auth error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 },
  );
}
