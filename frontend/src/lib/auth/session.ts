import { cookies } from 'next/headers';

export async function getSessionPhone(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get('dixis_session');
  if (!session) return null;

  // TODO: Implement proper session validation
  // For now, return a placeholder
  return '+306912345678';
}

export type SessionUser = { id: string; phone: string };

export async function requireSessionUser(): Promise<SessionUser> {
  const phone = await getSessionPhone();

  if (!phone) {
    throw new Error('Απαιτείται είσοδος');
  }

  // Return user object with phone as id (since we use phone-based auth)
  return { id: phone, phone };
}
