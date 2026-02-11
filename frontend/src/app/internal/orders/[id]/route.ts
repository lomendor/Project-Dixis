import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

// GET /internal/orders/:id - Fetch single order by CUID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const orderId = params.id;

  // Validate ID is non-empty string (CUID format: alphanumeric, 20+ chars)
  if (!orderId || typeof orderId !== 'string' || orderId.length < 10) {
    return NextResponse.json(
      { error: 'Invalid order ID' },
      { status: 400 }
    );
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Map Prisma order to API format (same as list endpoint)
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

    const mapped = {
      id: order.id,
      user_id: 0, // Prisma orders don't have user_id currently
      subtotal: order.subtotal?.toString() || '0',
      tax_amount: order.vat?.toString() || '0',
      shipping_amount: order.shipping?.toString() || '0',
      total_amount: order.total?.toString() || '0',
      payment_status: order.status || 'pending',
      payment_method: 'COD',
      status: order.status || 'pending',
      shipping_method: 'COURIER',
      shipping_address: order.address,
      postal_code: order.zip,
      city: order.city,
      created_at: order.createdAt?.toISOString() || new Date().toISOString(),
      items,
      order_items: items, // duplicate for compatibility
    };

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('GET /internal/orders/:id error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
