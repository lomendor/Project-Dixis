import { getSessionPhone } from './session';

export async function requireAdmin() {
  const phone = await getSessionPhone();

  if (!phone) {
    throw new Error('Admin access required - not authenticated');
  }

  // For now, accept any authenticated user as admin
  // In production, check user.role === 'admin' or similar

  return { id: phone, phone };
}
