import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth/cookies';

/**
 * POST /api/auth/admin-logout
 *
 * Clears the dixis_session cookie. No auth check needed — clearing
 * a cookie is always safe, and an unauthenticated user calling this
 * is a no-op.
 */
export async function POST() {
  const response = NextResponse.json({ success: true });
  clearSessionCookie(response);
  return response;
}
