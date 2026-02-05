import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { requireAdmin, AdminError } from '@/lib/auth/admin';
import { logAdminAction, createOrderStatusContext } from '@/lib/audit/logger';

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
    // Get admin context for audit logging
    const admin = await requireAdmin();

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

    // Audit log for order status change
    await logAdminAction({
      admin,
      action: 'ORDER_STATUS_CHANGE',
      entityType: 'order',
      entityId: id,
      ...createOrderStatusContext(from, to)
    });

    // Send status update email to customer via Resend
    try {
      const fresh = await prisma.order.findUnique({
        where: { id: updated.id },
        select: { email: true, name: true, buyerName: true, publicToken: true, total: true }
      });

      const customerEmail = fresh?.email;
      if (customerEmail) {
        const { sendOrderStatusUpdate, normalizeOrderStatus } = await import('@/lib/email');
        const emailStatus = normalizeOrderStatus(to);

        if (emailStatus) {
          const customerName = fresh.name || fresh.buyerName || 'Πελάτη';
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dixis.gr';
          const trackUrl = fresh.publicToken
            ? `${siteUrl.replace(/\/$/, '')}/track/${fresh.publicToken}`
            : undefined;

          const result = await sendOrderStatusUpdate({
            data: { orderId: id, customerName, newStatus: emailStatus, total: fresh.total ?? 0, trackUrl },
            toEmail: customerEmail,
          });

          if (result.ok) {
            console.log(`[admin] Status email sent to ${customerEmail} (dryRun=${result.dryRun ?? false})`);
          } else {
            console.warn(`[admin] Status email failed: ${result.error}`);
          }
        }
      } else {
        console.log(`[admin] No customer email on order ${id}, skipping notification`);
      }
    } catch (e) {
      console.warn('[admin status mail] skipped:', (e as Error).message);
    }

    console.log(`[order] ${id} status ${from}→${to}`);

    return NextResponse.json({
      ok: true,
      orderId: id,
      status: to
    });

  } catch (error: unknown) {
    // Handle AdminError
    if (error instanceof AdminError) {
      if (error.code === 'NOT_AUTHENTICATED') {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
      }
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    return NextResponse.json(
      { error: (error as Error)?.message || 'status_fail' },
      { status: 500 }
    );
  }
}
