import { cookies } from 'next/headers';

export async function getSessionPhone(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get('dixis_session');
  if (!session) return null;
  
  // TODO: Implement proper session validation
  // For now, return a placeholder
  return '+306912345678';
}
