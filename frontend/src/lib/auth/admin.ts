import { headers } from 'next/headers';
import { getSessionPhone, getSessionType } from './session';
import { prisma } from '@/lib/db/client';

// ============================================
// Types
// ============================================

export type AdminSession = {
  id: string;
  phone: string;
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

// ============================================
// Main function
// ============================================

/**
 * Require authenticated admin session with database-backed role verification.
 *
 * Checks:
 * 1. User is authenticated (has valid session)
 * 2. Session type is 'admin'
 * 3. Phone exists in AdminUser table
 * 4. Admin account is active
 *
 * @throws AdminError with code 'NOT_AUTHENTICATED' if not logged in
 * @throws AdminError with code 'NOT_ADMIN' if not an admin
 * @throws AdminError with code 'ADMIN_INACTIVE' if admin account is deactivated
 */
export async function requireAdmin(): Promise<AdminContext> {
  // 1. Check authentication
  const phone = await getSessionPhone();
  if (!phone) {
    throw new AdminError('Admin access required - not authenticated', 'NOT_AUTHENTICATED');
  }

  // 2. Check session type
  const sessionType = await getSessionType();
  if (sessionType !== 'admin') {
    throw new AdminError('Admin access required - not an admin session', 'NOT_ADMIN');
  }

  // 3. Verify admin exists in database whitelist
  const adminUser = await prisma.adminUser.findUnique({
    where: { phone },
    select: { id: true, phone: true, role: true, isActive: true }
  });

  if (!adminUser) {
    throw new AdminError('Admin access required - not in admin whitelist', 'NOT_ADMIN');
  }

  // 4. Check if admin account is active
  if (!adminUser.isActive) {
    throw new AdminError('Admin access denied - account deactivated', 'ADMIN_INACTIVE');
  }

  // Get context for audit logging
  const ipAddress = await getClientIp();
  const userAgent = await getUserAgent();

  return {
    id: adminUser.id,
    phone: adminUser.phone,
    role: adminUser.role as 'admin' | 'super_admin',
    ipAddress,
    userAgent
  };
}
