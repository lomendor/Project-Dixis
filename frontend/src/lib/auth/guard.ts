import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Admin Guard Helpers
 *
 * Protect admin routes and API endpoints from unauthorized access.
 * Uses session cookie authentication with admin phone number validation.
 */

const ADMIN_PHONES = (process.env.ADMIN_PHONES || '').split(',').map(p => p.trim()).filter(Boolean);

/**
 * Check if the current request has a valid admin session
 *
 * @param req - Next.js request object (for middleware)
 * @returns true if user is authenticated as admin
 */
export async function hasAdminSession(req?: NextRequest): Promise<boolean> {
  try {
    let sessionCookie: string | undefined;

    if (req) {
      // Middleware context - get cookie from request
      sessionCookie = req.cookies.get('dixis_session')?.value;
    } else {
      // Server component context - use cookies() API
      const cookieStore = await cookies();
      sessionCookie = cookieStore.get('dixis_session')?.value;
    }

    if (!sessionCookie) {
      return false;
    }

    // In a real app, you would validate the session token against the database
    // For now, we check if the session exists and belongs to an admin phone
    // This is a simplified check - production should verify session signature/expiry

    // Extract phone from session cookie (format: phone:timestamp:signature)
    const parts = sessionCookie.split(':');
    if (parts.length < 3) {
      return false;
    }

    const phone = parts[0];
    return ADMIN_PHONES.includes(phone);
  } catch (e) {
    console.warn('[guard] hasAdminSession failed:', (e as Error).message);
    return false;
  }
}

/**
 * Require admin session or return 401 response
 *
 * Use this in API route handlers to protect admin endpoints
 *
 * @param req - Next.js request object
 * @returns NextResponse with 401 if not admin, null if authorized
 *
 * @example
 * export async function GET(req: NextRequest) {
 *   const unauthorized = await requireAdminOr401(req);
 *   if (unauthorized) return unauthorized;
 *   // ... admin logic
 * }
 */
export async function requireAdminOr401(req: NextRequest): Promise<NextResponse | null> {
  const isAdmin = await hasAdminSession(req);

  if (!isAdmin) {
    return NextResponse.json(
      { ok: false, message: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }

  return null;
}

/**
 * Require admin session or return 403 JSON response
 *
 * Alternative to 401 for server components that need to show error UI
 *
 * @returns { authorized: boolean, error?: object }
 */
export async function requireAdminOr403(): Promise<{ authorized: boolean; error?: { status: number; message: string } }> {
  const isAdmin = await hasAdminSession();

  if (!isAdmin) {
    return {
      authorized: false,
      error: {
        status: 403,
        message: 'Forbidden - Admin access required'
      }
    };
  }

  return { authorized: true };
}
