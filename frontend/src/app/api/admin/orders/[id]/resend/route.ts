import { NextResponse } from 'next/server';
import { getPrisma } from '../../../../../../lib/prismaSafe';
import { memOrders } from '../../../../../../lib/orderStore';
import { adminEnabled } from '../../../../../../lib/adminGuard';
import { rateLimit } from '../../../../../../lib/rateLimit';
import { orderNumber } from '../../../../../../lib/orderNumber';

export const dynamic = 'force-dynamic';

function originFromReq(req: Request): string {
  try {
    const o = req.headers.get('origin');
    if (o) return o;
  } catch {}
  // Use NEXT_PUBLIC_SITE_URL for production, never localhost
  return process.env.APP_ORIGIN || process.env.NEXT_PUBLIC_SITE_URL || 'https://dixis.gr';
}

export async function POST(req: Request, ctx: { params: { id: string } }) {
  if (!adminEnabled()) return new NextResponse('Not Found', { status: 404 });

  if (!(await rateLimit('admin-resend-receipt', 30))) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  const id = ctx?.params?.id;
  if (!id) return new NextResponse('missing id', { status: 400 });

  const prisma = getPrisma();
  let o: any = null;

  if (prisma) {
    try {
      o = await prisma.checkoutOrder.findUnique({ where: { id } });
    } catch {}
  }
  if (!o) {
    o = memOrders.get(id);
  }
  if (!o) return new NextResponse('not found', { status: 404 });

  const ordNo = orderNumber(o.id, o.createdAt);
  const origin = originFromReq(req);
  const to = String(o.email || process.env.DEVMAIL_DEFAULT_TO || 'test@dixis.dev');

  const total = Number(o.total ?? 0);
  const subject = 'Dixis Order ' + ordNo + ' — Total: €' + total.toFixed(2);
  const link = origin + '/admin/orders/' + o.id;
  const text = 'Order ' + ordNo + '\nΣύνολο: €' + total.toFixed(2) + '\nΤ.Κ.: ' + o.postalCode + '\n\nΠροβολή: ' + link;

  try {
    await fetch(origin + '/api/ci/devmail/send', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ to, subject, text })
    });
  } catch {}

  return NextResponse.json({ ok: true });
}
