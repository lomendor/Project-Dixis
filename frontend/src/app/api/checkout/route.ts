import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { sendMailSafe } from '@/lib/mail/mailer';
import * as OrderTpl from '@/lib/mail/templates/orderConfirmation';
import * as NewOrderAdmin from '@/lib/mail/templates/newOrderAdmin';
import * as LowStockAdmin from '@/lib/mail/templates/lowStockAdmin';
import { normalizeMethod, calculateShippingCost } from '@/contracts/shipping';

export async function POST(request: NextRequest) {
  // ATOMIC CHECKOUT BEGIN
  try {
    const payload = await request.json().catch(():null => null) as any;
    const items = Array.isArray(payload?.items) ? payload.items : [];
    if (!items.length) return NextResponse.json({ error: 'Δεν υπάρχουν είδη στο καλάθι' }, { status: 400 });

    // Συλλογή productIds & ποσότητες
    const want = items.map((i: any) => ({ id: String(i.productId || ''), qty: Math.max(1, Number(i.qty || 0)) }));
    const ids = Array.from(new Set(want.map((w:any) => w.id).filter(Boolean))) as string[];
    if (!ids.length) return NextResponse.json({ error: 'Μη έγκυρα είδη' }, { status: 400 });

    const result = await prisma.$transaction(async (tx) => {
      // Διαβάζουμε τα προϊόντα από DB
      const products = await tx.product.findMany({ where: { id: { in: ids } }, select: { id: true, title: true, price: true, stock: true, isActive: true, producerId: true } });
      if (products.length !== ids.length) throw Object.assign(new Error('Κάποια προϊόντα δεν βρέθηκαν'), { code: 400 });

      // Map για lookup
      const byId = new Map(products.map(p => [p.id, p]));
      // Συνθέτουμε order lines από DB (όχι client τιμές)
      const lines = want.map((w:any) => {
        const p = byId.get(w.id);
        if (!p) throw Object.assign(new Error('Το προϊόν δεν βρέθηκε'), { code: 400 });
        if (!p.isActive) throw Object.assign(new Error(`Το προϊόν "${p.title}" δεν είναι διαθέσιμο`), { code: 400 });
        return { id: p.id, title: p.title, qty: w.qty, price: Number(p.price || 0), stock: Number(p.stock || 0), producerId: p.producerId };
      });

      // Έλεγχος stock
      const insufficient = lines.filter((l:any) => l.qty > l.stock);
      if (insufficient.length) {
        const names = insufficient.slice(0, 3).map((l:any) => `"${l.title}"`).join(', ');
        throw Object.assign(new Error(`Μη διαθέσιμο απόθεμα για: ${names}`), { code: 409 });
      }

      // Μειώνουμε stock conditionally (ώστε να αποτύχει αν άλλαξε stock μεταξύ ελέγχου)
      for (const l of lines) {
        const r = await tx.product.updateMany({
          where: { id: l.id, stock: { gte: l.qty } },
          data: { stock: { decrement: l.qty } }
        });
        if (r.count !== 1) {
          throw Object.assign(new Error(`Το απόθεμα ενημερώθηκε για "${l.title}", προσπαθήστε ξανά`), { code: 409 });
        }
      }

      // Υπολογισμός συνόλου από DB τιμές
      const subtotal = lines.reduce((s:number, l:any) => s + Number(l.price) * Number(l.qty), 0);

      // Υπολογισμός μεταφορικών (normalize aliases to canonical)
      const shippingMethod = normalizeMethod(payload?.shipping?.method);
      const computedShipping = Number(calculateShippingCost(shippingMethod, subtotal));
      const total = subtotal + computedShipping;

      // Δημιουργία παραγγελίας + items (snapshots)
      // Note: shippingMethod & computedShipping not in schema, total includes shipping
      const order = await tx.order.create({
        data: {
          status: 'PENDING',
          total,
          buyerName: String(payload?.shipping?.name || ''),
          buyerPhone: String(payload?.shipping?.phone || ''),
          shippingLine1: String(payload?.shipping?.line1 || ''),
          shippingLine2: String(payload?.shipping?.line2 || ''),
          shippingCity: String(payload?.shipping?.city || ''),
          shippingPostal: String(payload?.shipping?.postal || ''),
          items: {
            create: lines.map((l:any) => ({
              productId: l.id,
              producerId: l.producerId,
              qty: l.qty,
              price: l.price,
              titleSnap: l.title,
              priceSnap: l.price,
              status: 'PENDING'
            }))
          }
        },
        select: { id: true, publicToken: true, total: true }
      });

      return { orderId: order.id, publicToken: order.publicToken, total: order.total, lines };
    });

    // EMAILS: post-commit (best-effort)
    try {
      const email = payload?.shipping?.email?.trim?.();
      const phone = payload?.shipping?.phone?.trim?.() || '';
      const orderId = result.orderId;
      const publicToken = result.publicToken;
      const adminTo = process.env.DEV_MAIL_TO || '';

      // 1) Order confirmation to customer
      if (email) {
        await sendMailSafe({
          to: email,
          subject: OrderTpl.subject(orderId),
          html: OrderTpl.html({
            id: orderId,
            publicToken,
            total: Number(result.total || 0),
            items: result.lines.map((i: any) => ({
              title: String(i.title || ''),
              qty: Number(i.qty || 0),
              price: Number(i.price || 0)
            })),
            shipping: {
              name: String(payload?.shipping?.name || ''),
              line1: String(payload?.shipping?.line1 || ''),
              city: String(payload?.shipping?.city || ''),
              postal: String(payload?.shipping?.postal || ''),
              phone
            }
          })
        });
      }

      // 2) Admin new-order notice
      if (adminTo) {
        await sendMailSafe({
          to: adminTo,
          subject: NewOrderAdmin.subject(orderId),
          text: NewOrderAdmin.text({
            id: orderId,
            buyerName: String(payload?.shipping?.name || ''),
            buyerPhone: phone,
            total: Number(result.total || 0)
          })
        });
      }
    } catch (e) {
      console.warn('[mail] post-commit emails failed:', (e as Error).message);
    }

    // EMAIL: low-stock admin (threshold from env, default 3)
    try {
      const threshold = parseInt(String(process.env.LOW_STOCK_THRESHOLD || '3')) || 3;
      const pids = result.lines.map((l: any) => l.id);
      if (pids.length) {
        const products = await prisma.product.findMany({
          where: { id: { in: pids } },
          select: { id: true, title: true, stock: true }
        });
        const low = products.filter((p) => Number(p.stock || 0) <= threshold);
        if (low.length) {
          const to = process.env.DEV_MAIL_TO || 'dev@localhost';
          await sendMailSafe({
            to,
            subject: LowStockAdmin.subject(
              low.map((l) => ({ title: String(l.title), stock: Number(l.stock || 0) })),
              result.orderId
            ),
            text: LowStockAdmin.text({
              orderId: result.orderId,
              items: low.map((l) => ({ title: String(l.title), stock: Number(l.stock || 0) })),
              threshold
            })
          });
        }
      }
    } catch (e) {
      console.warn('[mail] low-stock admin failed:', (e as Error).message);
    }

    // ΕΠΙΤΥΧΙΑ
    return NextResponse.json({ success: true, orderId: result.orderId, total: result.total }, { status: 201 });
  } catch (e: any) {
    const code = Number(e?.code || 0);
    if (code === 409) return NextResponse.json({ error: e.message || 'Μη διαθέσιμο απόθεμα' }, { status: 409 });
    if (code === 400) return NextResponse.json({ error: e.message || 'Μη έγκυρα δεδομένα' }, { status: 400 });
    console.warn('[checkout] atomic error:', e?.message);
    return NextResponse.json({ error: 'Σφάλμα παραγγελίας' }, { status: 500 });
  }
  // ATOMIC CHECKOUT END
}
