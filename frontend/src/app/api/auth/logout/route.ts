import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * GET /api/auth/logout
 * Clears the session cookie and redirects to home
 *
 * Pass FIX-AUTH-TIMEOUT: OTP-based session logout
 */
export async function GET() {
  const cookieStore = await cookies();

  // Clear session cookie
  cookieStore.delete('session');

  // Redirect to home page
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_API_BASE_URL || 'https://dixis.gr'));
}

export async function POST() {
  const cookieStore = await cookies();

  // Clear session cookie
  cookieStore.delete('session');

  return NextResponse.json({ success: true, message: 'Logged out successfully' });
}
