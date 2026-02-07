import { prisma } from '@/lib/db/client';
import { getSessionPhone } from './session';

export type ProducerSession = {
  id: string;
  phone: string;
  name: string;
  approvalStatus: string;
};

export type ProducerError = {
  code: 'NOT_AUTHENTICATED' | 'NOT_PRODUCER' | 'PENDING_APPROVAL' | 'REJECTED';
  message: string;
};

/**
 * Require authenticated producer session
 * Returns producer record or throws Response with appropriate error
 *
 * Pass AUTH-UNIFICATION-01: Support multiple lookup strategies:
 * 1. Direct phone match on Producer.phone
 * 2. Via Consumer relation (Producer.consumer.phone)
 *
 * Usage in API routes:
 *   const producer = await requireProducer();
 *   // Now use producer.id to scope queries
 */
export async function requireProducer(): Promise<ProducerSession> {
  const phone = await getSessionPhone();

  if (!phone) {
    throw new Response(
      JSON.stringify({ error: 'Απαιτείται είσοδος', code: 'NOT_AUTHENTICATED' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Pass AUTH-UNIFICATION-01: Try multiple lookup strategies
  // 1. Direct phone match
  // 2. Via Consumer relation
  const producer = await prisma.producer.findFirst({
    where: {
      OR: [
        { phone },
        { consumer: { phone } }
      ],
      isActive: true
    },
    select: { id: true, phone: true, name: true, approvalStatus: true }
  });

  if (!producer) {
    throw new Response(
      JSON.stringify({
        error: 'Δεν έχετε εγγραφεί ως παραγωγός',
        code: 'NOT_PRODUCER',
        action: 'register', // Hint for UI to show "Become a Producer" button
        registerUrl: '/producers/join'
      }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Check approval status
  if (producer.approvalStatus === 'pending') {
    throw new Response(
      JSON.stringify({
        error: 'Η αίτησή σας βρίσκεται υπό έγκριση',
        code: 'PENDING_APPROVAL',
        producerId: producer.id
      }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (producer.approvalStatus === 'rejected') {
    throw new Response(
      JSON.stringify({
        error: 'Η αίτησή σας απορρίφθηκε. Επικοινωνήστε μαζί μας για περισσότερες πληροφορίες.',
        code: 'REJECTED',
        producerId: producer.id
      }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return {
    id: producer.id,
    phone: phone,
    name: producer.name,
    approvalStatus: producer.approvalStatus
  };
}

/**
 * Check if user is a producer without throwing
 * Returns producer or null
 */
export async function getProducerSession(): Promise<ProducerSession | null> {
  try {
    return await requireProducer();
  } catch {
    return null;
  }
}

/**
 * Check if user has a producer application (any status)
 * Useful for showing different UI based on application status
 */
export async function getProducerApplication(phone: string) {
  return prisma.producer.findFirst({
    where: {
      OR: [
        { phone },
        { consumer: { phone } }
      ]
    },
    select: {
      id: true,
      name: true,
      approvalStatus: true,
      rejectionReason: true,
      createdAt: true
    }
  });
}
