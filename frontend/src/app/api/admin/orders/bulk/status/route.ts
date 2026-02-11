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

const VALID_STATUSES = ['PACKING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

/**
 * POST /api/admin/orders/bulk/status
 * Bulk update order statuses with transition validation, audit logging, and email.
 */
export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const { orderIds, status } = await req.json();

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: 'missing orderIds' }, { status: 400 });
    }
    const to = String(status || '').toUpperCase();
    if (!VALID_STATUSES.includes(to)) {
      return NextResponse.json({ error: `invalid status: ${to}` }, { status: 400 });
    }
    if (orderIds.length > 50) {
      return NextResponse.json({ error: 'max 50 orders per batch' }, { status: 400 });
    }

    const results: { id: string; ok: boolean; error?: string }[] = [];

    for (const orderId of orderIds) {
      try {
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) {
          results.push({ id: orderId, ok: false, error: 'not_found' });
          continue;
        }

        const from = String(order.status || 'PENDING').toUpperCase();
        if (!canTransition(from, to)) {
          results.push({ id: orderId, ok: false, error: `invalid_transition ${from}→${to}` });
          continue;
        }

        const updated = await prisma.order.update({
          where: { id: orderId },
          data: { status: to }
        });

        // Audit log
        try {
          await logAdminAction({
            admin,
            action: 'ORDER_STATUS_CHANGE',
            entityType: 'order',
            entityId: orderId,
            ...createOrderStatusContext(from, to)
          });
        } catch (auditErr) {
          console.error('[Admin] Bulk audit log failed:', auditErr);
        }

        // Send status email
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
              await sendOrderStatusUpdate({
                data: { orderId, customerName, newStatus: emailStatus, total: fresh.total ?? 0, trackUrl },
                toEmail: customerEmail,
              });
            }
          }
        } catch (emailErr) {
          console.warn(`[admin bulk] email skipped for ${orderId}:`, (emailErr as Error).message);
        }

        results.push({ id: orderId, ok: true });
        console.log(`[order bulk] ${orderId} status ${from}→${to}`);
      } catch (err) {
        results.push({ id: orderId, ok: false, error: (err as Error).message });
      }
    }

    const updated = results.filter(r => r.ok).length;
    const failed = results.filter(r => !r.ok);

    return NextResponse.json({ ok: true, updated, failed });

  } catch (error: unknown) {
    if (error instanceof AdminError) {
      if (error.code === 'NOT_AUTHENTICATED') {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
      }
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
    return NextResponse.json(
      { error: (error as Error)?.message || 'bulk_status_fail' },
      { status: 500 }
    );
  }
}
