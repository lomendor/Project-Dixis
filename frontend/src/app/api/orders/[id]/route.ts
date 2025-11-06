import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        total: true,
        buyerName: true,
        buyerPhone: true,
        shippingLine1: true,
        shippingLine2: true,
        shippingCity: true,
        shippingPostal: true,
        createdAt: true,
        updatedAt: true,
        items: {
          select: {
            id: true,
            titleSnap: true,
            priceSnap: true,
            qty: true,
            status: true,
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Η παραγγελία δεν βρέθηκε' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: order.id,
      status: order.status,
      total: Number(order.total || 0),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      shipping: {
        name: order.buyerName,
        line1: order.shippingLine1,
        line2: order.shippingLine2 || '',
        city: order.shippingCity,
        postal: order.shippingPostal,
        phone: order.buyerPhone,
      },
      items: order.items.map((item: any) => ({
        id: item.id,
        name: item.titleSnap,
        price: Number(item.priceSnap || 0),
        quantity: item.qty,
      }))
    });
  } catch (e: any) {
    console.warn('[orders/[id]] GET error:', e?.message);
    return NextResponse.json(
      { error: 'Σφάλμα ανάκτησης παραγγελίας' },
      { status: 500 }
    );
  }
}
