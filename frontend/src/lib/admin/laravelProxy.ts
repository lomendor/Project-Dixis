import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AdminError } from '@/lib/auth/admin';

/**
 * Shared helpers for admin API routes that proxy to Laravel.
 *
 * getAdminToken()    — reads the dixis_session JWT (NOT the deleted auth_token)
 * handleAdminError() — maps AdminError codes to proper HTTP status codes
 *
 * Created: 2026-02-24 — Fix admin dashboard auth (replaces auth_token references)
 */

/**
 * Read the admin JWT token from the dixis_session cookie.
 * Falls back to Authorization header for API clients.
 *
 * NOTE: auth_token cookie was removed in PR #3146.
 * All admin routes MUST use dixis_session instead.
 */
export async function getAdminToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return (
    cookieStore.get('dixis_session')?.value ||
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
