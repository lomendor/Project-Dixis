import { prisma } from '@/lib/db/client';
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

  // Find producer by phone (phone is the unique identifier in Producer model)
  const producer = await prisma.producer.findFirst({
    where: { phone, isActive: true },
    select: { id: true, phone: true, name: true }
  });

  if (!producer) {
    throw new Response(
      JSON.stringify({ error: 'Δεν έχετε ολοκληρώσει το προφίλ παραγωγού' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return producer;
}
