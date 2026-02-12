import * as Sentry from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || '').trim().toLowerCase();
    const orderId = String(body?.orderId || body?.order || '').trim();
    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    // Build where clause - if email provided, require it; otherwise allow public lookup
    const where: any = { id: orderId };
    if (email) {
      where.email = email;
    }

    const order = await prisma.order.findFirst({
      where,
      include: { items: true },
    });
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({
      id: order.id,
      createdAt: order.createdAt,
      email: order.email,
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),
      total: Number(order.total),
      currency: order.currency,
      items: order.items.map(it => ({
        id: it.id, slug: it.slug, qty: it.qty, price: Number(it.price), currency: it.currency
      })),
    });
  } catch (e) {
    try {
      Sentry.captureException(e);
    } catch {}
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// προαιρετικά απορρίπτουμε GET
export function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
