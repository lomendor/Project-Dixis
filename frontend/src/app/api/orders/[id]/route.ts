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
        // AG130 checkout fields
        email: true,
        name: true,
        subtotal: true,
        shipping: true,
        vat: true,
        zone: true,
        // Legacy fields
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
            price: true,
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

    // Return format compatible with thank-you page
    return NextResponse.json({
      id: order.id,
      status: order.status,
      total: Number(order.total || 0),
      // AG130 checkout fields (used by thank-you page)
      subtotal: order.subtotal ? Number(order.subtotal) : undefined,
      shipping: order.shipping ? Number(order.shipping) : undefined,
      vat: order.vat ? Number(order.vat) : undefined,
      zone: order.zone || 'mainland',
      email: order.email || null,
      name: order.name || order.buyerName || null,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      // Items with format expected by thank-you page
      items: order.items.map((item: any) => ({
        id: item.id,
        titleSnap: item.titleSnap,
        price: Number(item.priceSnap || item.price || 0),
        qty: item.qty,
        status: item.status,
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
