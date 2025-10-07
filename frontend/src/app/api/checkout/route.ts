import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { checkoutApi } from '@/lib/api/checkout';
import { shippingSchema } from '@/lib/validate';
import { t } from '@/lib/i18n/t';
import { computeShipping } from '@/lib/checkout/shipping';
import { createPaymentIntent } from '@/lib/payments/provider';
import { sendMailSafe, renderOrderEmail } from '@/lib/mail/mailer';
import { decrementStockAtomic, StockError } from '@/lib/inventory/stock';
import { z } from 'zod';

// Comprehensive checkout validation schema
const CheckoutSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1, 'Μη έγκυρο προϊόν'),
    qty: z.number().int().min(1, 'Ελάχιστη ποσότητα 1')
  })).min(1, 'Το καλάθι είναι άδειο'),
  shipping: z.object({
    name: z.string().min(2, 'Ονοματεπώνυμο απαιτείται'),
    phone: z.string().min(7, 'Τηλέφωνο απαιτείται'),
    line1: z.string().min(3, 'Διεύθυνση απαιτείται'),
    line2: z.string().optional(),
    city: z.string().min(2, 'Πόλη απαιτείται'),
    postal: z.string().min(3, 'Τ.Κ. απαιτείται'),
    email: z.string().email('Μη έγκυρο email').optional().or(z.literal('')).transform(v => v === '' ? undefined : v)
  }),
  paymentMethod: z.literal('COD').optional().default('COD')
});

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

    // VALIDATE_INPUT: Comprehensive Zod validation
    let parsed: z.infer<typeof CheckoutSchema>;
    try {
      parsed = CheckoutSchema.parse(body);
    } catch (e: any) {
      const firstError = e.errors?.[0];
      return NextResponse.json(
        {
          error: firstError?.message || 'Μη έγκυρα δεδομένα',
          field: firstError?.path?.join('.')
        },
        { status: 400 }
      );
    }
    // Use parsed and validated data
    const items = parsed.items;
    const validatedShipping = parsed.shipping;

    // Get phone from session (mock for now)
    const buyerPhone = request.headers.get('x-buyer-phone') || '+306912345678';

    // Wrap in transaction (oversell-safe)
    const result = await prisma.$transaction(async (tx) => {
      // STOCK: decrement atomically with low-stock warnings
      try {
        await decrementStockAtomic(items.map(i => ({ productId: i.productId, qty: Number(i.qty || 0) })), tx);
      } catch (e: any) {
        if (e?.code === 'INSUFFICIENT_STOCK') {
          throw new Error('OVERSALE');
        }
        throw e;
      }

      // Calculate subtotal and fetch product snapshots
      let subtotal = 0;
      const productsMap = new Map();

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { price: true, producerId: true, title: true }
        });
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }
        productsMap.set(item.productId, product);
        subtotal += product.price * item.qty;
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
          shippingLine2: validatedShipping.line2 || null,
          shippingCity: validatedShipping.city,
          shippingPostal: validatedShipping.postal,
          total,
          status: 'pending'
        }
      });

      // Create order items
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
      }

      // Note: shipping cost is included in total
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
      orderId: result.orderId,
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
