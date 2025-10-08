import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { sendMailSafe } from '@/lib/mail/mailer';
import * as OrderStatusTpl from '@/lib/mail/templates/orderStatus';

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

    // EMAIL: customer status update (best-effort, tokenized link)
    // Note: Order schema doesn't store email yet. When buyerEmail field is added to Order,
    // status emails will be sent automatically. For now, this prepares the infrastructure.
    try {
      const email = (updated as any).buyerEmail || null;
      if (email) {
        const ord = await prisma.order.findUnique({
          where: { id: updated.id },
          select: { trackingCode: true }
        });
        await sendMailSafe({
          to: String(email),
          subject: OrderStatusTpl.subject(updated.id, String(updated.status || '')),
          html: OrderStatusTpl.html({
            id: updated.id,
            status: String(updated.status || ''),
            trackingCode: ord?.trackingCode
          })
        });
        console.log(`[mail] Status email sent to ${email}`);
      } else {
        console.log(`[mail] No email in Order - status notification skipped (add buyerEmail to Order schema)`);
      }
    } catch (e: any) {
      console.warn('[mail] status email failed:', e?.message);
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
