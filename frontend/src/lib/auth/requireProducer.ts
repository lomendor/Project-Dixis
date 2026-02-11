import { prisma } from '@/lib/db/client';
import { getLaravelInternalUrl } from '@/env';
import { getSessionPhone } from './session';

export type ProducerSession = {
  id: string;
  phone: string;
  name: string;
};

/**
 * Require authenticated producer session
 * Returns producer record or throws Response with appropriate error
 *
 * Phase 5.3: Checks Prisma first, then falls back to Laravel.
 * This ensures producers that exist only in Laravel (e.g. seeded via
 * GreekProductSeeder) can still authenticate for the dashboard.
 *
 * Usage in API routes:
 *   const producer = await requireProducer();
 *   // Now use producer.id to scope queries
 */
export async function requireProducer(): Promise<ProducerSession> {
  const phone = await getSessionPhone();

  if (!phone) {
    throw new Response(
      JSON.stringify({ error: 'Απαιτείται είσοδος' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 1. Try Prisma first (fast, local)
  try {
    const producer = await prisma.producer.findFirst({
      where: { phone, isActive: true },
      select: { id: true, phone: true, name: true }
    });

    if (producer) {
      return producer;
    }
  } catch {
    // Prisma may fail if table is removed in future — fall through to Laravel
  }

  // 2. Fallback: Check Laravel backend
  try {
    const laravelBase = getLaravelInternalUrl();
    const url = new URL(`${laravelBase}/public/producers`);
    url.searchParams.set('per_page', '100');

    const res = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    });

    if (res.ok) {
      const json = await res.json();
      const producers = json?.data ?? [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const match = producers.find((p: any) => p.phone === phone && p.is_active !== false);

      if (match) {
        return {
          id: String(match.id),
          phone: match.phone || phone,
          name: match.name,
        };
      }
    }
  } catch (err) {
    console.error('[requireProducer] Laravel fallback failed:', err);
  }

  throw new Response(
    JSON.stringify({ error: 'Δεν έχετε ολοκληρώσει το προφίλ παραγωγού' }),
    { status: 403, headers: { 'Content-Type': 'application/json' } }
  );
}
