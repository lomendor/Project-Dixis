import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { sendMailSafe } from '@/lib/mail/mailer';
import { restockFromOrder } from '@/lib/inventory/stock';
import * as OrderStatus from '@/lib/mail/templates/orderStatus';

// Admin check helper
async function checkAdmin(req: Request): Promise<boolean> {
  try {
    const { requireAdmin } = await import('@/lib/auth/admin');
    await requireAdmin();
    return true;
  } catch {
    return false;
  }
}

function canTransition(from: string, to: string): boolean {
  const flow: Record<string, string[]> = {
    PENDING: ['PACKING', 'CANCELLED'],
    PAID: ['PACKING', 'CANCELLED'],
    PACKING: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED'],
    DELIVERED: [],
    CANCELLED: []
  };
  
  const F = (from || 'PENDING').toUpperCase();
  const T = (to || '').toUpperCase();
  return (flow[F] || []).includes(T);
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const isAdmin = await checkAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    const id = params.id;
    const { status: newStatus } = await req.json();
    
    if (!newStatus) {
      return NextResponse.json({ error: 'missing status' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    const from = String(order.status || 'PENDING').toUpperCase();
    const to = String(newStatus).toUpperCase();
    
    if (!canTransition(from, to)) {
      return NextResponse.json(
        { error: `invalid_transition ${from}→${to}` },
        { status: 400 }
      );
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: to }
    });

    // RESTOCK on CANCELLED (only if status became CANCELLED and wasn't already)
    try {
      const was = String(order.status || 'PENDING').toUpperCase();
      const now = String(updated.status || 'PENDING').toUpperCase();
      if (now === 'CANCELLED' && was !== 'CANCELLED') {
        await prisma.$transaction(async (tx) => {
          await restockFromOrder(updated.id, tx);
        });
        console.log('[order] restocked items for', updated.id);
      }
    } catch (e: any) {
      console.warn('[order] restock failed:', e?.message);
    }

    // EMAIL: customer status update (optional - only if customer has email)
    try {
      const fullOrder = await prisma.order.findUnique({
        where: { id: updated.id }
      });
      if (fullOrder) {
        const customerEmail = (fullOrder as any).customerEmail?.trim?.();
        if (customerEmail) {
          await sendMailSafe({
            to: customerEmail,
            subject: OrderStatus.subject(fullOrder.id, String(fullOrder.status || 'PENDING')),
            html: OrderStatus.html({
              id: fullOrder.id,
              status: String(fullOrder.status || 'PENDING')
            })
          });
          console.log(`[admin] Status ${from}→${to}, email sent to ${customerEmail}`);
        }
      }
    } catch (e) {
      console.warn('[admin status email] skipped:', (e as Error).message);
    }

    console.log(`[order] ${id} status ${from}→${to}`);
    
    return NextResponse.json({
      ok: true,
      orderId: id,
      status: to
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'status_fail' },
      { status: 500 }
    );
  }
}
