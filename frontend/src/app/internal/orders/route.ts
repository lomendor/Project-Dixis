import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { memOrders } from '../../../lib/orderStore';
import { rateLimit } from '../../../lib/rateLimit';
import { orderNumber } from '../../../lib/orderNumber';

export const dynamic = 'force-dynamic';

function originFromReq(req: Request): string {
  try {
    const o = (req as any).headers?.get?.('origin');
    if (o) return o;
  } catch {}
  // Use NEXT_PUBLIC_SITE_URL for production, never localhost
  return process.env.APP_ORIGIN || process.env.NEXT_PUBLIC_SITE_URL || 'https://dixis.gr';
}

// GET /api/orders - List orders (from Prisma/Neon)
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Map Prisma orders to API format
    const mapped = orders.map(order => {
      const items = order.items.map(item => ({
        id: item.id,
        product_id: item.productId || 0,
        quantity: item.qty,
        price: item.priceSnap?.toString() || '0',
        unit_price: item.priceSnap?.toString() || '0',
        total_price: ((item.priceSnap || 0) * item.qty).toString(),
        product_name: item.titleSnap || '',
        product_unit: 'kg',
        product: null as any,
      }));

      return {
        id: order.id,
        user_id: 0, // Prisma orders don't have user_id currently
        subtotal: order.subtotal?.toString() || '0',
        tax_amount: order.vat?.toString() || '0',
        shipping_amount: order.shipping?.toString() || '0',
        total_amount: order.total?.toString() || '0',
        payment_status: order.status || 'pending', // Use status field
        payment_method: 'COD',
        status: order.status || 'pending',
        shipping_method: 'COURIER',
        shipping_address: order.address,
        postal_code: order.zip,
        city: order.city,
        created_at: order.createdAt?.toISOString() || new Date().toISOString(),
        items,
        order_items: items, // duplicate for compatibility, typed correctly
      };
    });

    return NextResponse.json({ orders: mapped });
  } catch (error) {
    console.error('GET /internal/orders error:', error);
    // Return empty array with 200 instead of 500 to prevent breaking UI
    return NextResponse.json({ orders: [] });
  }
}

export async function POST(req: Request) {
  // Rate-limit: 60 req/min (prod-only)
  if (!(await rateLimit('orders-create', 60))) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return new NextResponse('bad json', { status: 400 });
  }

  // Allow either {summary} or raw fields
  const summary = body && (body.summary || body);

  const data = {
    postalCode: String(summary?.address?.postalCode || summary?.postalCode || ''),
    method: String(summary?.method || ''),
    weightGrams: Number(summary?.weight ?? summary?.items?.[0]?.weightGrams ?? 0),
    subtotal: Number(summary?.subtotal ?? 0),
    shippingCost: Number(
      summary?.quote?.shippingCost ?? summary?.shippingCost ?? 0
    ),
    codFee: summary?.quote?.codFee ?? summary?.codFee ?? null,
    total: Number(summary?.total ?? 0),
    email: summary?.email ?? null,
    paymentRef: summary?.paymentSessionId ?? null,
  };

  if (!data.postalCode || !data.method || !data.total) {
    return new NextResponse('missing fields', { status: 400 });
  }

  try {
    const created = await prisma.checkoutOrder.create({
      data: {
        postalCode: data.postalCode,
        method: data.method,
        weightGrams: data.weightGrams,
        subtotal: data.subtotal,
        shippingCost: data.shippingCost,
        codFee: data.codFee,
        total: data.total,
        email: data.email,
        paymentRef: data.paymentRef,
        paymentStatus: 'PAID',
      },
    });
    try {
      if (process.env.SMTP_DEV_MAILBOX === '1') {
        const origin = originFromReq(req);
        const to = String(
          summary?.email || process.env.DEVMAIL_DEFAULT_TO || 'test@dixis.dev'
        );
        const ordNo = orderNumber(created.id, created.createdAt as any);
        const subject = `Dixis Order ${ordNo} — Total: €${(
          data.total ?? 0
        ).toFixed(2)}`;
        const link = `${origin}/admin/orders/${created.id}`;
        const cust = `${origin}/orders/lookup?ordNo=${ordNo}`;
        const body = `Order ${ordNo}\nΣύνολο: €${(data.total ?? 0).toFixed(
          2
        )}\nΤ.Κ.: ${data.postalCode}\n\nAdmin: ${link}\nCustomer: ${cust}`;
        await fetch(`${origin}/api/ci/devmail/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to, subject, body }),
        }).catch(() => {});
      }
    } catch {}
    const ordNo = orderNumber(created.id, created.createdAt as any);
    return NextResponse.json(
      { ok: true, id: created.id, orderNumber: ordNo },
      { status: 201 }
    );
  } catch (e) {
    // Fallback to memory if DB fails
    const created = memOrders.create(data);
    try {
      if (process.env.SMTP_DEV_MAILBOX === '1') {
        const origin = originFromReq(req);
        const to = String(
          summary?.email || process.env.DEVMAIL_DEFAULT_TO || 'test@dixis.dev'
        );
        const ordNo = orderNumber(created.id, created.createdAt as any);
        const subject = `Dixis Order ${ordNo} — Total: €${(
          data.total ?? 0
        ).toFixed(2)}`;
        const link = `${origin}/admin/orders/${created.id}`;
        const cust = `${origin}/orders/lookup?ordNo=${ordNo}`;
        const body = `Order ${ordNo}\nΣύνολο: €${(data.total ?? 0).toFixed(
          2
        )}\nΤ.Κ.: ${data.postalCode}\n\nAdmin: ${link}\nCustomer: ${cust}`;
        await fetch(`${origin}/api/ci/devmail/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to, subject, body }),
        }).catch(() => {});
      }
    } catch {}
    const ordNo = orderNumber(created.id, created.createdAt as any);
    return NextResponse.json(
      { ok: true, id: created.id, orderNumber: ordNo, mem: true },
      { status: 201 }
    );
  }
}
