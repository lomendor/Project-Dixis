import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { SESSION_COOKIE_NAME } from './cookies';

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
 * Quick structural check: a valid JWT has exactly 3 base64url segments separated by dots.
 * Returns false for empty strings, truncated tokens, or non-JWT values.
 */
function isJwtFormat(value: string): boolean {
  return value.split('.').length === 3;
}

/**
 * Log diagnostic info for a malformed cookie value (no PII — JWT header is not sensitive).
 */
function logMalformedCookie(source: string, value: string): void {
  const dots = value.split('.').length - 1;
  const preview = value.substring(0, 20);
  console.warn(
    `[Session] ${source}: not JWT format | len=${value.length} dots=${dots} preview="${preview}…"`
  );
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
  const session = cookieStore.get(SESSION_COOKIE_NAME);
  if (!session?.value) return null;

  // Pre-validate JWT structure to avoid cryptic "jwt malformed" errors
  if (!isJwtFormat(session.value)) {
    logMalformedCookie('getSessionPhone', session.value);
    return null;
  }

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
      console.warn(`[Session] JWT verification failed: ${error.message} | len=${session.value.length}`);
    }
    return null;
  }
}

/**
 * Get session type (admin or user) from JWT
 */
export async function getSessionType(): Promise<'admin' | 'user' | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);
  if (!session?.value) return null;

  if (!isJwtFormat(session.value)) {
    logMalformedCookie('getSessionType', session.value);
    return null;
  }

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
