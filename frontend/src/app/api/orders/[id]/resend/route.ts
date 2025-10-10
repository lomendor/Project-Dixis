import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/client';
import { sendMailSafe } from '@/lib/mail/mailer';
import { subject as statusSubject, html as statusHtml } from '@/lib/mail/templates/orderStatus';

type Props = { params: { id: string } };

export async function POST(_req: NextRequest, { params }: Props) {
  const { id } = params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      select: { id: true, status: true, buyerName: true, total: true }
    });

    if (!order) {
      return NextResponse.json({ ok: false, message: 'Not found' }, { status: 404 });
    }

    const status = String(order.status || 'PENDING');
    const to = process.env.DEV_MAIL_TO || '';

    // Try to send email
    let delivered = false;
    if (to) {
      try {
        await sendMailSafe({
          to,
          subject: statusSubject(id, status),
          html: statusHtml({ id, status })
        });
        delivered = true;
      } catch (e) {
        console.warn('[resend] sendMailSafe failed:', (e as Error).message);
      }
    }

    // Log the attempt
    console.log('[POST /api/orders/[id]/resend]', {
      orderId: id,
      status,
      delivered,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ ok: true, id, delivered });
  } catch (e: any) {
    console.warn('[POST /api/orders/[id]/resend] failed', e?.message);
    return NextResponse.json({ ok: false, id, message: 'Internal error' }, { status: 500 });
  }
}
