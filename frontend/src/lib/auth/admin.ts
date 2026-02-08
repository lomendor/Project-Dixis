import { cookies, headers } from 'next/headers';

// ============================================
// Types
// ============================================

export type AdminSession = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
};

export type AdminContext = AdminSession & {
  ipAddress: string | null;
  userAgent: string | null;
};

// ============================================
// Error codes for typed error handling
// ============================================

export type AdminErrorCode = 'NOT_AUTHENTICATED' | 'NOT_ADMIN' | 'ADMIN_INACTIVE';

export class AdminError extends Error {
  code: AdminErrorCode;

  constructor(message: string, code: AdminErrorCode) {
    super(message);
    this.code = code;
    this.name = 'AdminError';
  }
}

// ============================================
// Helpers
// ============================================

/**
 * Extract client IP from request headers
 */
async function getClientIp(): Promise<string | null> {
  const headersList = await headers();
  return (
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headersList.get('x-real-ip') ||
    null
  );
}

/**
 * Extract user agent from request headers
 */
async function getUserAgent(): Promise<string | null> {
  const headersList = await headers();
  return headersList.get('user-agent');
}

/**
 * Get Laravel session from httpOnly cookie
 * Pass AUTH-UNIFY-02: Laravel-based admin auth
 */
async function getLaravelSession(): Promise<{ user: { id: number; name: string; email: string; role: string } } | null> {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('laravel_user');
    const tokenCookie = cookieStore.get('laravel_token');

    if (!userCookie?.value || !tokenCookie?.value) {
      return null;
    }

    const user = JSON.parse(userCookie.value);
    return { user };
  } catch (error) {
    console.error('[Admin] Failed to parse Laravel session:', error);
    return null;
  }
}

// ============================================
// Main function
// ============================================

/**
 * Require authenticated admin session with Laravel role verification.
 *
 * Pass AUTH-UNIFY-02: Unified auth - admins use same login as consumers/producers
 *
 * Checks:
 * 1. User is authenticated (has valid Laravel session cookie)
 * 2. User role is 'admin'
 *
 * @throws AdminError with code 'NOT_AUTHENTICATED' if not logged in
 * @throws AdminError with code 'NOT_ADMIN' if not an admin
 */
export async function requireAdmin(): Promise<AdminContext> {
  // 1. Check Laravel session (httpOnly cookie)
  const session = await getLaravelSession();

  if (!session || !session.user) {
    // Fallback: Check OTP-based session (for backwards compatibility during transition)
    const { getSessionPhone, getSessionType } = await import('./session');
    const phone = await getSessionPhone();
    const sessionType = await getSessionType();

    if (phone && sessionType === 'admin') {
      console.log('[Admin] Using legacy OTP session for:', phone);
      const ipAddress = await getClientIp();
      const userAgent = await getUserAgent();
      return {
        id: `otp-admin-${phone}`,
        email: '',
        name: phone,
        role: 'admin' as const,
        ipAddress,
        userAgent
      };
    }

    throw new AdminError('Admin access required - not authenticated', 'NOT_AUTHENTICATED');
  }

  // 2. Check if user has admin role
  if (session.user.role !== 'admin') {
    throw new AdminError('Admin access required - insufficient permissions', 'NOT_ADMIN');
  }

  // Get context for audit logging
  const ipAddress = await getClientIp();
  const userAgent = await getUserAgent();

  return {
    id: String(session.user.id),
    email: session.user.email,
    name: session.user.name,
    role: 'admin' as const,
    ipAddress,
    userAgent
  };
}
