import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

/**
 * Public order tracking endpoint (tokenized, no PII exposure)
 * GET /api/orders/track/[token]
 * Returns: status, shippingMethod, computedShipping, items (no phone/email/address)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token?.trim();
    if (!token) {
      return NextResponse.json({ error: 'Μη έγκυρο token' }, { status: 400 });
    }

    // Lookup order by publicToken (not id)
    const order = await prisma.order.findUnique({
      where: { publicToken: token },
      select: {
        id: true,
        status: true,
        total: true,
        createdAt: true,
        updatedAt: true,
        items: {
          select: {
            id: true,
            qty: true,
            price: true,
            titleSnap: true,
            priceSnap: true,
            status: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Η παραγγελία δεν βρέθηκε' }, { status: 404 });
    }

    // Return public-safe data (no PII)
    return NextResponse.json({
      id: order.id,
      status: order.status,
      total: Number(order.total || 0),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.items.map(item => ({
        id: item.id,
        title: item.titleSnap ?? '',
        qty: Number(item.qty || 0),
        price: Number(item.priceSnap ?? item.price ?? 0),
        status: item.status
      }))
    }, { status: 200 });
  } catch (error) {
    console.error('[track] error:', error);
    return NextResponse.json({ error: 'Σφάλμα ανάκτησης παραγγελίας' }, { status: 500 });
  }
}
