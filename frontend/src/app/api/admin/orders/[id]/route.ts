import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { calcTotals } from '@/lib/cart/totals';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  // Simple session check - presence of dixis_session cookie
  const cookie = req.headers.get('cookie') || '';
  if (!cookie.includes('dixis_session=')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          select: {
            id: true,
            titleSnap: true,
            qty: true,
            price: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Calculate totals using single source of truth
    const totals = calcTotals({
      items: order.items.map(i => ({
        price: Number(i.price || 0),
        qty: Number(i.qty || 0)
      })),
      shippingMethod: 'COURIER', // Default - we don't store this in order yet
      baseShipping: 3.5, // Default courier cost
      codFee: 0, // Default - we don't store payment method
      taxRate: Number(process.env.DIXIS_TAX_RATE || 0)
    });

    return NextResponse.json({
      id: order.id,
      createdAt: order.createdAt,
      status: order.status,
      total: order.total,
      buyerName: order.buyerName,
      buyerPhone: order.buyerPhone,
      shippingLine1: order.shippingLine1,
      shippingCity: order.shippingCity,
      shippingPostal: order.shippingPostal,
      items: order.items.map(i => ({
        title: i.titleSnap,
        qty: i.qty,
        price: i.price
      })),
      totals
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to fetch order' }, { status: 500 });
  }
}
