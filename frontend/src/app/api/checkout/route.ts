import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { checkoutApi } from '@/lib/api/checkout';
import { shippingSchema } from '@/lib/validate';
import { t } from '@/lib/i18n/t';
import { computeShipping } from '@/lib/checkout/shipping';
import { createPaymentIntent } from '@/lib/payments/provider';
import { sendMailSafe, renderOrderEmail } from '@/lib/mail/mailer';

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

    // Validate shipping data with Greek phone/postal validation
    const validation = shippingSchema.safeParse(shipping);
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      const errorMessage = firstError.message.startsWith('errors.')
        ? t(firstError.message)
        : firstError.message;

      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    // Use validated data
    const validatedShipping = validation.data;

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

      // Calculate subtotal and fetch product snapshots
      let subtotal = 0;
      const productsMap = new Map();

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { price: true, producerId: true, title: true }
        });
        productsMap.set(item.productId, product);
        subtotal += product!.price * item.qty;
      }

      // SHIPPING: compute
      const shipping = computeShipping(subtotal);
      const total = subtotal + shipping;

      // Create order (use validated shipping data)
      const order = await tx.order.create({
        data: {
          buyerPhone,
          buyerName: validatedShipping.name,
          shippingLine1: validatedShipping.line1,
          shippingLine2: body.shipping?.line2 || null,
          shippingCity: validatedShipping.city,
          shippingPostal: validatedShipping.postal,
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

      // Note: shipping cost is included in total
      // If Order model had a 'meta' or 'shippingCost' field, we could store it separately
      console.log(`[checkout] Order ${order.id}: subtotal=${subtotal}, shipping=${shipping}, total=${total}`);

      return {
        orderId: order.id,
        total: order.total,
        subtotal,
        shipping,
        status: order.status
      };
    });

    // PAYMENT: create (COD fallback)
    try {
      const amountCents = Math.round(result.total * 100);
      const pay = await createPaymentIntent({ amount: amountCents, method: 'cod' });
      console.log('[checkout] payment', pay);
    } catch (e) {
      console.warn('[checkout] payment init failed', String(e).substring(0, 100));
    }

    // EMAIL: order confirmation (safe fallback)
    try {
      const fullOrder = await prisma.order.findUnique({
        where: { id: result.orderId },
        include: { items: true }
      });
      if (fullOrder) {
        const { subject, html, text } = await renderOrderEmail('confirm', {
          id: fullOrder.id,
          buyerName: fullOrder.buyerName || undefined,
          buyerEmail: (fullOrder as any).customerEmail || undefined,
          total: Number(fullOrder.total || 0),
          createdAt: fullOrder.createdAt,
          shippingLine1: fullOrder.shippingLine1 || undefined,
          shippingCity: fullOrder.shippingCity || undefined,
          shippingPostal: fullOrder.shippingPostal || undefined,
          items: fullOrder.items.map(i => ({
            titleSnap: i.titleSnap || undefined,
            qty: i.qty,
            price: i.price
          }))
        });
        const toEmail = (fullOrder as any).customerEmail || process.env.DEV_MAIL_TO || '';
        if (toEmail) {
          await sendMailSafe({ to: toEmail, subject, html, text });
        }
      }
    } catch (e) {
      console.warn('[checkout email] skipped:', (e as Error).message);
    }

    // Emit event + notification stubs
    await (await import('@/lib/events/bus')).emitEvent('order.created', {
      orderId: result.orderId,
      items,
      shipping: validatedShipping
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
