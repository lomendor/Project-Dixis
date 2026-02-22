import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

/**
 * Lazy getter for JWT_SECRET — avoids throwing at module evaluation
 * (which breaks `next build` page data collection).
 * Throws at request time if missing in production.
 */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }
  return '';
}

interface JwtPayload {
  phone: string;
  type: 'admin' | 'user';
  iat: number;
  exp: number;
  iss: string;
  sub: string;
}

/**
 * Extract phone number from JWT session cookie
 *
 * Session token format: JWT (cryptographically signed)
 * Payload: { phone, type, iat, exp, iss, sub }
 *
 * @returns Phone number or null if JWT is invalid/expired
 */
export async function getSessionPhone(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get('dixis_session');
  if (!session?.value) return null;

  try {
    const decoded = jwt.verify(session.value, getJwtSecret(), {
      algorithms: ['HS256'],
      issuer: 'dixis-auth',
    }) as JwtPayload;

    if (!decoded.phone || decoded.phone.length < 6) {
      console.warn('[Session] Invalid phone in JWT');
      return null;
    }
    return decoded.phone;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.warn('[Session] JWT expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.warn('[Session] JWT verification failed:', error.message);
    }
    return null;
  }
}

/**
 * Get session type (admin or user) from JWT
 */
export async function getSessionType(): Promise<'admin' | 'user' | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get('dixis_session');
  if (!session?.value) return null;

  try {
    const decoded = jwt.verify(session.value, getJwtSecret(), {
      algorithms: ['HS256'],
      issuer: 'dixis-auth',
    }) as JwtPayload;

    return (decoded.type === 'admin' || decoded.type === 'user') ? decoded.type : null;
  } catch {
    return null;
  }
}
