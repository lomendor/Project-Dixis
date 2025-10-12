import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

// Admin check helper
async function checkAdmin(req: Request): Promise<boolean> {
  try {
    const { requireAdmin } = await import('@/lib/auth/admin');
    await requireAdmin();
    return true;
  } catch {
    return false;
  }
}

function canTransition(from: string, to: string): boolean {
  const flow: Record<string, string[]> = {
    PENDING: ['PACKING', 'CANCELLED'],
    PAID: ['PACKING', 'CANCELLED'],
    PACKING: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED'],
    DELIVERED: [],
    CANCELLED: []
  };
  
  const F = (from || 'PENDING').toUpperCase();
  const T = (to || '').toUpperCase();
  return (flow[F] || []).includes(T);
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const isAdmin = await checkAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    const id = params.id;
    const { status: newStatus } = await req.json();
    
    if (!newStatus) {
      return NextResponse.json({ error: 'missing status' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    const from = String(order.status || 'PENDING').toUpperCase();
    const to = String(newStatus).toUpperCase();
    
    if (!canTransition(from, to)) {
      return NextResponse.json(
        { error: `invalid_transition ${from}→${to}` },
        { status: 400 }
      );
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: to }
    });

    // Fetch order with items for email notification
    const fresh = await prisma.order.findUnique({
      where: { id: updated.id },
      select: {
        id: true,
        status: true,
        publicToken: true,
        shippingMethod: true,
        items: {
          select: {
            titleSnap: true,
            qty: true,
            price: true
          }
        }
      }
    }).catch((): null => null);

    // Send status update email to customer
    try {
      const { sendMailSafe } = await import('@/lib/mail/mailer');
      const orderStatusTpl = await import('@/lib/mail/templates/orderStatus');

      // Get customer email from order (if stored)
      const orderWithEmail = await prisma.order.findUnique({
        where: { id },
        select: { buyerPhone: true }
      });

      // For now, we don't have buyer email in schema
      // Email will be sent when email field is added
      const customerEmail = process.env.DEV_MAIL_TO; // Send to dev for testing

      if (customerEmail && fresh) {
        // Prepare items for email
        const itemsForEmail = (fresh.items || []).map((it: any) => ({
          title: it.titleSnap || '—',
          qty: Number(it.qty || 0),
          price: Number(it.price || 0)
        }))

        // Calculate totals
        let totals: any = undefined
        try {
          const { calcTotals } = await import('@/lib/cart/totals')
          const method = String(fresh.shippingMethod || 'COURIER')
          const shippingMethod =
            (method === 'COURIER_COD' || method === 'COD') ? 'COURIER_COD' :
            (method === 'PICKUP') ? 'PICKUP' : 'COURIER'

          totals = calcTotals({
            items: itemsForEmail.map(x => ({ price: x.price, qty: x.qty })),
            shippingMethod,
            baseShipping: undefined,
            codFee: undefined,
            taxRate: 0
          })
        } catch (_) {}

        await sendMailSafe({
          to: customerEmail,
          subject: orderStatusTpl.subject(updated.id, to),
          html: orderStatusTpl.html({
            id: updated.id,
            status: to,
            publicToken: fresh.publicToken || '',
            items: itemsForEmail,
            totals
          } as any),
          text: orderStatusTpl.text({
            id: updated.id,
            status: to,
            publicToken: fresh.publicToken || '',
            items: itemsForEmail,
            totals
          } as any)
        });
        console.log(`[admin] Status email sent to ${customerEmail}`);
      }
    } catch (e) {
      console.warn('[admin status mail] skipped:', (e as Error).message);
    }

    console.log(`[order] ${id} status ${from}→${to}`);
    
    return NextResponse.json({
      ok: true,
      orderId: id,
      status: to
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'status_fail' },
      { status: 500 }
    );
  }
}
