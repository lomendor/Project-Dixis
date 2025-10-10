import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/client';

export type Props = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Props) {
  const { id } = params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!order) {
      return NextResponse.json({ ok: false, message: 'Not found' }, { status: 404 });
    }

    // Subtotal: calculate from items or use stored total
    const subtotal = order.items.reduce(
      (sum, item) => sum + Number(item.priceSnap || 0) * Number(item.qty || 0),
      0
    );

    // Shipping method (fallback to COURIER)
    const method = 'COURIER'; // TODO: Read from order.shippingMethod when added to schema

    // Computed shipping (for now, hardcoded - will integrate with shipping API)
    const computedShipping = 0; // TODO: Call shipping cost calculation

    // Computed total
    const computedTotal = Number(order.total || 0) || subtotal + computedShipping;

    const status = order.status || 'PENDING';

    return NextResponse.json({
      id: order.id,
      status,
      subtotal: Number(subtotal.toFixed(2)),
      computedShipping: Number(computedShipping.toFixed(2)),
      computedTotal: Number(computedTotal.toFixed(2))
    });
  } catch (e: any) {
    console.warn('[GET /api/orders/[id]] failed', e?.message);
    return NextResponse.json({ ok: false, message: 'Internal error' }, { status: 500 });
  }
}
