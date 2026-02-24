import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { requireAdmin, AdminError } from '@/lib/auth/admin';
import { getAdminToken } from '@/lib/admin/laravelProxy';
import { getLaravelInternalUrl } from '@/env';
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

    // Laravel orders use "A-123" format — proxy status change to Laravel
    if (id.startsWith('A-')) {
      const laravelId = id.slice(2);
      const token = await getAdminToken();
      if (!token) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
      }

      // Map Next.js status names to Laravel equivalents
      const statusMap: Record<string, string> = {
        PACKING: 'processing',
        PAID: 'confirmed',
      };
      const laravelStatus = statusMap[String(newStatus).toUpperCase()]
        || String(newStatus).toLowerCase();

      const laravelBase = getLaravelInternalUrl();
      const laravelRes = await fetch(
        `${laravelBase}/admin/orders/${laravelId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: laravelStatus }),
        }
      );

      if (!laravelRes.ok) {
        const errData = await laravelRes.json().catch(() => ({}));
        console.error(`[admin/orders/${id}/status] Laravel proxy error:`, laravelRes.status, errData);
        return NextResponse.json(
          { error: (errData as Record<string, unknown>).error || 'status_change_failed' },
          { status: laravelRes.status }
        );
      }

      console.log(`[order] ${id} (Laravel ${laravelId}) status → ${newStatus}`);
      return NextResponse.json({ ok: true, orderId: id, status: String(newStatus).toUpperCase() });
    }

    // Prisma orders (cuid IDs) — use local DB
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

    // T2-04: Restore stock when order is cancelled
    if (to === 'CANCELLED') {
      const items = await prisma.orderItem.findMany({
        where: { orderId: id },
        select: { productId: true, qty: true }
      });
      for (const item of items) {
        if (item.productId) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.qty } }
          });
          console.log(`[cancel] Restored ${item.qty} stock for product ${item.productId}`);
        }
      }
    }

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
