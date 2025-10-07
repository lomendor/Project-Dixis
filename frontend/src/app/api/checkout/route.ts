import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { checkoutApi } from '@/lib/api/checkout';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10/min per IP (soft guard)
    const { rateLimit, rlHeaders } = await import('@/lib/rl/db');
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown';
    const rl = await rateLimit('checkout', ip, 10, 60, 1);
    if (!rl.ok) {
      return new NextResponse(
        JSON.stringify({ error: 'Πολλές προσπάθειες αγοράς. Δοκιμάστε ξανά σε λίγο.' }),
        { status: 429, headers: { 'Content-Type': 'application/json', ...rlHeaders(rl) } }
      );
    }

    const body = await request.json();
    const { items: bodyItems, shipping } = body;
    let items = Array.isArray(bodyItems) ? bodyItems : undefined;

    // Fallback from backend cart (align with useCheckout/checkoutApi)
    if (!items || items.length === 0) {
      try {
        const result = await checkoutApi.getValidatedCart();
        if (result.success && result.data) {
          items = result.data.map((cartLine: any) => ({
            productId: cartLine.product_id,
            qty: cartLine.quantity
          }));
        }
      } catch (e) {
        // If backend cart unavailable, items stays empty and we return 400
      }
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Το καλάθι είναι άδειο' },
        { status: 400 }
      );
    }

    if (!shipping || !shipping.name || !shipping.line1 || !shipping.city || !shipping.postal) {
      return NextResponse.json(
        { error: 'Η διεύθυνση αποστολής είναι υποχρεωτική' },
        { status: 400 }
      );
    }

    // Get phone from session (mock for now)
    const buyerPhone = request.headers.get('x-buyer-phone') || '+306912345678';

    // Wrap in transaction (oversell-safe)
    const result = await prisma.$transaction(async (tx) => {
      // Validate stock for all items
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true, price: true, producerId: true }
        });

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (product.stock < item.qty) {
          throw new Error('OVERSALE');
        }
      }

      // Calculate total and fetch product snapshots
      let total = 0;
      const productsMap = new Map();

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { price: true, producerId: true, title: true }
        });
        productsMap.set(item.productId, product);
        total += product!.price * item.qty;
      }

      // Create order
      const order = await tx.order.create({
        data: {
          buyerPhone,
          buyerName: shipping.name,
          shippingLine1: shipping.line1,
          shippingLine2: shipping.line2 || null,
          shippingCity: shipping.city,
          shippingPostal: shipping.postal,
          total,
          status: 'pending'
        }
      });

      // Create order items and decrement stock atomically
      for (const item of items) {
        const product = productsMap.get(item.productId);

        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            producerId: product!.producerId,
            qty: item.qty,
            price: product!.price,
            titleSnap: product!.title,
            priceSnap: product!.price,
            status: 'PENDING'
          }
        });

        // Atomic decrement with stock validation (prevents race conditions)
        const res = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.qty }
          },
          data: { stock: { decrement: item.qty } }
        });

        // If count !== 1, another transaction consumed the stock
        if (res.count !== 1) {
          throw new Error('OVERSALE');
        }
      }

      return {
        orderId: order.id,
        total: order.total,
        status: order.status
      };
    });

    // Emit event + notification stubs
    await (await import('@/lib/events/bus')).emitEvent('order.created', {
      orderId: result.orderId,
      items,
      shipping
    });

    return NextResponse.json({
      success: true,
      order: result
    }, { headers: rlHeaders(rl) });

  } catch (e: any) {
    if (String(e.message || '').includes('OVERSALE')) {
      return NextResponse.json(
        { error: 'Ανεπαρκές απόθεμα' },
        { status: 409 }
      );
    }
    console.error('Checkout error:', e);
    return NextResponse.json(
      { error: 'Σφάλμα κατά την ολοκλήρωση της παραγγελίας' },
      { status: 500 }
    );
  }
}
