'use server';

import { prisma } from '@/lib/db/client';
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
    // Get current status
    const item = await prisma.orderItem.findUnique({
      where: { id },
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

    // Update status
    await prisma.orderItem.update({
      where: { id },
      data: { status: next.toLowerCase() }
    });

    revalidatePath('/my/orders');
    return { ok: true };
  } catch (error) {
    console.error('Status update error:', error);
    return { ok: false, error: 'Σφάλμα κατά την ενημέρωση της κατάστασης.' };
  }
}
