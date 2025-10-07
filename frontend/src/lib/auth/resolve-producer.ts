import { prisma } from '@/lib/db/client';

type SessionUser = { id?: string; phone?: string; role?: string };

export async function currentUser(): Promise<SessionUser | null> {
  try {
    const mod: any = await import('@/lib/auth/session');
    if (typeof mod.currentUser === 'function') return await mod.currentUser();
    if (typeof mod.requireSessionUser === 'function') return await mod.requireSessionUser();
  } catch {}
  return null;
}

/**
 * Προσπάθησε διαφορετικούς ασφαλείς τρόπους αντιστοίχισης χωρίς schema αλλαγές:
 * 1) producer.userId == user.id (αν υπάρχει)
 * 2) producer.phone == user.phone (αν υπάρχει τέτοια στήλη)
 * Αν δεν βρεθεί τίποτα → επέστρεψε null (UI θα δείξει οδηγίες).
 */
export async function resolveProducerIdStrict(): Promise<string | null> {
  const u = await currentUser();
  if (!u) return null;

  // 1) by userId
  try {
    // @ts-ignore -- schema optionality
    const byUser = await prisma.producer.findFirst({ where: { userId: u.id as any }, select: { id: true } });
    if (byUser?.id) return byUser.id;
  } catch {}

  // 2) by phone
  try {
    if (u.phone) {
      // @ts-ignore -- schema optionality
      const byPhone = await prisma.producer.findFirst({ where: { phone: u.phone as any }, select: { id: true } });
      if (byPhone?.id) return byPhone.id;
    }
  } catch {}

  return null;
}
