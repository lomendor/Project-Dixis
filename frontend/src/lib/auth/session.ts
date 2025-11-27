import { cookies } from 'next/headers';

/**
 * Extract phone number from session cookie
 *
 * Session token format: {type}_{phone}_{timestamp}
 * Examples:
 *   - admin_+306912345678_1701234567890
 *   - user_+306987654321_1701234567890
 *
 * @returns Phone number or null if session is invalid/expired
 */
export async function getSessionPhone(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get('dixis_session');

  if (!session?.value) {
    return null;
  }

  const token = session.value;

  // Parse token: {type}_{phone}_{timestamp}
  const parts = token.split('_');

  // Minimum: type + phone + timestamp = 3 parts
  // But phone might contain underscores in international format
  if (parts.length < 3) {
    console.warn('[Session] Invalid token format');
    return null;
  }

  const type = parts[0]; // 'admin' or 'user'
  const timestamp = parseInt(parts[parts.length - 1], 10);

  // Phone is everything between type and timestamp
  // E.g., for "admin_+30_691_234_5678_1701234567890" -> "+30_691_234_5678"
  const phone = parts.slice(1, -1).join('_');

  // Validate type
  if (type !== 'admin' && type !== 'user') {
    console.warn('[Session] Unknown session type:', type);
    return null;
  }

  // Validate timestamp (not expired - 7 days)
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
  const now = Date.now();

  if (isNaN(timestamp) || now - timestamp > maxAge) {
    console.warn('[Session] Session expired or invalid timestamp');
    return null;
  }

  // Validate phone format (basic check)
  if (!phone || phone.length < 6) {
    console.warn('[Session] Invalid phone in token');
    return null;
  }

  return phone;
}

/**
 * Get session type (admin or user)
 */
export async function getSessionType(): Promise<'admin' | 'user' | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get('dixis_session');

  if (!session?.value) {
    return null;
  }

  const type = session.value.split('_')[0];

  if (type === 'admin' || type === 'user') {
    return type;
  }

  return null;
}
