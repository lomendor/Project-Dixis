'use server';

import { prisma } from '@/lib/db/client';
import { requireProducer } from '@/lib/auth/requireProducer';
import { revalidatePath } from 'next/cache';

// Allowed status transitions
const ALLOWED: Record<string, string[]> = {
  PENDING: ['ACCEPTED', 'REJECTED'],
  ACCEPTED: ['FULFILLED', 'REJECTED'],
  REJECTED: [],
  FULFILLED: []
};

export async function setOrderItemStatus(
  id: string,
  next: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'FULFILLED'
) {
  try {
    // Require producer authentication
    const producer = await requireProducer();

    // Get current status and verify item belongs to producer
    const item = await prisma.orderItem.findFirst({
      where: {
        id,
        producerId: producer.id // Critical: ensure item belongs to producer
      },
      select: { status: true }
    });

    if (!item) {
      return { ok: false, error: 'Δεν βρέθηκε η γραμμή παραγγελίας.' };
    }

    const currentStatus = item.status.toUpperCase();

    // Validate transition
    if (!ALLOWED[currentStatus]?.includes(next)) {
      return { ok: false, error: 'Μη επιτρεπτή μετάβαση κατάστασης.' };
    }

    // Update status (use updateMany for additional safety check)
    const result = await prisma.orderItem.updateMany({
      where: {
        id,
        producerId: producer.id // Double-check ownership
      },
      data: { status: next.toLowerCase() }
    });

    if (result.count === 0) {
      return { ok: false, error: 'Δεν βρέθηκε η γραμμή παραγγελίας.' };
    }

    // Fetch updated record for event emission
    const updated = await prisma.orderItem.findUnique({
      where: { id },
      select: { id: true, orderId: true, titleSnap: true, order: { select: { buyerPhone: true } } }
    });

    // Emit event + notification
    await (await import('@/lib/events/bus')).emitEvent('orderItem.status.changed', {
      orderId: updated.orderId,
      itemId: updated.id,
      titleSnap: updated.titleSnap,
      status: next,
      buyerPhone: updated.order?.buyerPhone || ''
    });

    revalidatePath('/my/orders');
    return { ok: true };
  } catch {
    return { ok: false, error: 'Σφάλμα κατά την ενημέρωση της κατάστασης.' };
  }
}
