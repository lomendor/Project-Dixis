import { prisma } from '@/lib/db/client';
import type { PrismaClient } from '@prisma/client';

export class StockError extends Error {
  code: 'INSUFFICIENT_STOCK';
  pid: string;
  need: number;
  have: number;

  constructor(pid: string, need: number, have: number) {
    super('INSUFFICIENT_STOCK');
    this.code = 'INSUFFICIENT_STOCK';
    this.pid = pid;
    this.need = need;
    this.have = have;
  }
}

export async function decrementStockAtomic(items: { productId: string; qty: number }[], tx: any = prisma) {
  const lowThreshold = Number(process.env.LOW_STOCK_THRESHOLD ?? 3);
  const decremented: { productId: string; after: number }[] = [];

  for (const it of items) {
    const p = await tx.product.findUnique({
      where: { id: it.productId },
      select: { stock: true, id: true, title: true }
    });
    const have = Number(p?.stock ?? 0);
    const need = Number(it.qty || 0);

    if (need <= 0) continue;
    if (!p || have < need) throw new StockError(it.productId, need, have);

    await tx.product.update({
      where: { id: it.productId },
      data: { stock: { decrement: need } }
    });

    const after = have - need;
    decremented.push({ productId: it.productId, after });

    if (after < lowThreshold) {
      console.warn(`[inventory] low stock: ${p?.title || it.productId} → ${after}`);
      try {
        const { sendMailSafe } = await import('@/lib/mail/mailer');
        const to = process.env.DEV_MAIL_TO || '';
        if (to) {
          await sendMailSafe({
            to,
            subject: `Low stock: ${p?.title || it.productId}`,
            text: `Απόθεμα σε ${after}`
          });
        }
      } catch {}
    }
  }

  return decremented;
}

export async function restockFromOrder(orderId: string, tx: any = prisma) {
  const items = await tx.orderItem.findMany({
    where: { orderId },
    select: { productId: true, qty: true }
  });

  for (const it of items) {
    if (!it.productId || !it.qty) continue;
    await tx.product.update({
      where: { id: it.productId },
      data: { stock: { increment: Number(it.qty) } }
    });
  }
}
