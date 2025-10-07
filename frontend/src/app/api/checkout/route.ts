import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { checkoutApi } from '@/lib/api/checkout';
import { shippingSchema } from '@/lib/validate';
import { t } from '@/lib/i18n/t';
import { sendMailSafe } from '@/lib/mail/mailer';

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

      // Create order (use validated shipping data)
      const order = await tx.order.create({
        data: {
          buyerPhone,
          buyerName: validatedShipping.name,
          shippingLine1: validatedShipping.line1,
          shippingLine2: shipping.line2 || null,
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

      return {
        orderId: order.id,
        total: order.total,
        status: order.status
      };
    });

    // EMAIL: customer notification
    try {
      const customerEmail = (shipping.email || validatedShipping.phone || buyerPhone) as string;
      const to = process.env.DIXIS_DEV === '1' ? (process.env.DEV_MAIL_TO || '') : customerEmail;
      if (to && to.includes('@')) {
        await sendMailSafe({
          to,
          subject: 'Επιβεβαίωση παραγγελίας - Dixis',
          html: `<p>Η παραγγελία #${result.orderId} καταχωρήθηκε επιτυχώς.</p><p>Σύνολο: ${new Intl.NumberFormat('el-GR', {style:'currency', currency:'EUR'}).format(Number(result.total))}</p>`
        });
      }
    } catch (err) {
      console.warn('[checkout] customer email failed:', err);
    }

    // EMAIL: producers notification (group by producer)
    try {
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId: result.orderId },
        select: { id: true, qty: true, titleSnap: true, producerId: true, priceSnap: true }
      });

      const groupedByProducer = new Map<string, any[]>();
      for (const item of orderItems) {
        const pid = String(item.producerId);
        if (!groupedByProducer.has(pid)) {
          groupedByProducer.set(pid, []);
        }
        groupedByProducer.get(pid)!.push(item);
      }

      for (const [producerId, itemsList] of groupedByProducer) {
        const producer = await prisma.producer.findUnique({
          where: { id: producerId },
          select: { email: true, name: true }
        });

        const to = producer?.email || (process.env.DIXIS_DEV === '1' ? (process.env.DEV_MAIL_TO || '') : '');
        if (to && to.includes('@')) {
          const itemsHtml = itemsList.map(it =>
            `<li>${it.titleSnap} × ${it.qty} (${new Intl.NumberFormat('el-GR', {style:'currency', currency:'EUR'}).format(Number(it.priceSnap) * it.qty)})</li>`
          ).join('');

          await sendMailSafe({
            to,
            subject: 'Νέα παραγγελία - Dixis',
            html: `<p>Γεια σας ${producer?.name || 'Παραγωγός'},</p><p>Έχετε ${itemsList.length} νέο/α είδος/ηματα στην παραγγελία #${result.orderId}:</p><ul>${itemsHtml}</ul>`
          });
        }
      }
    } catch (err) {
      console.warn('[checkout] producer emails failed:', err);
    }

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
