import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/client';
import { getSessionPhone } from './session';

export type ProducerSession = {
  id: string;
  phone: string;
  name: string;
  slug: string;
};

export async function requireProducer(): Promise<ProducerSession> {
  const phone = await getSessionPhone();
  
  if (!phone) {
    throw new Response(
      JSON.stringify({ error: 'Απαιτείται είσοδος' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  const producer = await prisma.producer.findFirst({
    where: { phone, isActive: true },
    select: { id: true, phone: true, name: true, slug: true }
  });
  
  if (!producer) {
    // No producer found, redirect to onboarding
    redirect('/producer/onboarding');
  }
  
  return producer;
}
