import { cookies } from 'next/headers';

export type SessionData = { phone: string; role: string } | null;

export async function getSession(): Promise<SessionData>{
  const c = await cookies();
  const id = c.get('dixis_session')?.value;
  if(!id) return null;
  // Lazy import prisma to avoid edge issues
  const { prisma } = await import('@/lib/db/client');
  const s = await prisma.session.findUnique({ where:{ id }});
  if(!s || s.expiresAt < new Date()) return null;
  return { phone: s.phone, role: s.role };
}

export async function getSessionPhone(): Promise<string|null>{
  const sess = await getSession();
  return sess?.phone || null;
}

export async function requireRole(allowedRoles: string[]): Promise<SessionData>{
  const sess = await getSession();
  if(!sess) throw new Error('Απαιτείται σύνδεση.');
  if(!allowedRoles.includes(sess.role)) throw new Error('Δεν έχετε δικαίωμα πρόσβασης.');
  return sess;
}
