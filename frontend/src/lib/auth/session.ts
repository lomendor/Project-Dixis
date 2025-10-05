import { cookies } from 'next/headers';
export async function getSessionPhone(): Promise<string|null>{
  const c = await cookies();
  const id = c.get('dixis_session')?.value;
  if(!id) return null;
  // Lazy import prisma to avoid edge issues
  const { prisma } = await import('@/lib/db/client');
  const s = await prisma.session.findUnique({ where:{ id }});
  if(!s || s.expiresAt < new Date()) return null;
  return s.phone;
}
