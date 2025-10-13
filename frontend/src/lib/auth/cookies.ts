import type { NextResponse } from 'next/server';

/**
 * Ορίζει το session cookie με ασφαλή attributes:
 * - HttpOnly: Προστασία από XSS
 * - SameSite=lax: Προστασία από CSRF
 * - Secure: HTTPS-only σε production
 * - MaxAge: 7 days
 * - Path: /
 */
export function setSessionCookie(res: NextResponse, token: string): void {
  const isProd =
    process.env.DIXIS_ENV === 'production' ||
    process.env.NODE_ENV === 'production';

  res.cookies.set('dixis_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: isProd,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Διαγράφει το session cookie με ασφαλή τρόπο
 */
export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set('dixis_session', '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

/**
 * Επιστρέφει το session token από cookies
 */
export function getSessionToken(req: Request): string | undefined {
  const cookieHeader = req.headers.get('cookie');
  if (!cookieHeader) return undefined;

  const cookies = cookieHeader.split(';').map(c => c.trim());
  const sessionCookie = cookies.find(c => c.startsWith('dixis_session='));

  if (!sessionCookie) return undefined;

  return sessionCookie.split('=')[1];
}
