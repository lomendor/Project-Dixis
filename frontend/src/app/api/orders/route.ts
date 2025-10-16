import { NextResponse } from 'next/server';
import { getPrisma } from '../../../lib/prismaSafe';
import { memOrders } from '../../../lib/orderStore';
import { rateLimit } from '../../../lib/rateLimit';

export const dynamic = 'force-dynamic';

function originFromReq(req: Request): string {
  try {
    const o = (req as any).headers?.get?.('origin');
    if (o) return o;
  } catch {}
  return process.env.APP_ORIGIN || 'http://localhost:3000';
}

export async function POST(req: Request) {
  // Rate-limit: 60 req/min (prod-only)
  if (!(await rateLimit('orders-create', 60))) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return new NextResponse('bad json', { status: 400 });
  }

  // Allow either {summary} or raw fields
  const summary = body && (body.summary || body);

  const data = {
    postalCode: String(summary?.address?.postalCode || summary?.postalCode || ''),
    method: String(summary?.method || ''),
    weightGrams: Number(summary?.weight ?? summary?.items?.[0]?.weightGrams ?? 0),
    subtotal: Number(summary?.subtotal ?? 0),
    shippingCost: Number(
      summary?.quote?.shippingCost ?? summary?.shippingCost ?? 0
    ),
    codFee: summary?.quote?.codFee ?? summary?.codFee ?? null,
    total: Number(summary?.total ?? 0),
    email: summary?.email ?? null,
    paymentRef: summary?.paymentSessionId ?? null,
  };

  if (!data.postalCode || !data.method || !data.total) {
    return new NextResponse('missing fields', { status: 400 });
  }

  const prisma = getPrisma();
  if (prisma) {
    try {
      const created = await prisma.checkoutOrder.create({
        data: {
          postalCode: data.postalCode,
          method: data.method,
          weightGrams: data.weightGrams,
          subtotal: data.subtotal,
          shippingCost: data.shippingCost,
          codFee: data.codFee,
          total: data.total,
          email: data.email,
          paymentRef: data.paymentRef,
          paymentStatus: 'PAID',
        },
      });
      try {
        if (process.env.SMTP_DEV_MAILBOX === '1') {
          const origin = originFromReq(req);
          const to = String(
            summary?.email || process.env.DEVMAIL_DEFAULT_TO || 'test@dixis.dev'
          );
          const subject = `Dixis Order — ${data.postalCode} — Total: €${(
            data.total ?? 0
          ).toFixed(2)}`;
          const body = `Ευχαριστούμε για την παραγγελία σας. Σύνολο: €${(
            data.total ?? 0
          ).toFixed(2)}. Τ.Κ.: ${data.postalCode}.`;
          await fetch(`${origin}/api/ci/devmail/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to, subject, body }),
          }).catch(() => {});
        }
      } catch {}
      return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
    } catch (e) {
      // Fallback to memory if DB fails
      const created = memOrders.create(data);
      try {
        if (process.env.SMTP_DEV_MAILBOX === '1') {
          const origin = originFromReq(req);
          const to = String(
            summary?.email || process.env.DEVMAIL_DEFAULT_TO || 'test@dixis.dev'
          );
          const subject = `Dixis Order — ${data.postalCode} — Total: €${(
            data.total ?? 0
          ).toFixed(2)}`;
          const body = `Ευχαριστούμε για την παραγγελία σας. Σύνολο: €${(
            data.total ?? 0
          ).toFixed(2)}. Τ.Κ.: ${data.postalCode}.`;
          await fetch(`${origin}/api/ci/devmail/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to, subject, body }),
          }).catch(() => {});
        }
      } catch {}
      return NextResponse.json(
        { ok: true, id: created.id, mem: true },
        { status: 201 }
      );
    }
  } else {
    const created = memOrders.create(data);
    try {
      if (process.env.SMTP_DEV_MAILBOX === '1') {
        const origin = originFromReq(req);
        const to = String(
          summary?.email || process.env.DEVMAIL_DEFAULT_TO || 'test@dixis.dev'
        );
        const subject = `Dixis Order — ${data.postalCode} — Total: €${(
          data.total ?? 0
        ).toFixed(2)}`;
        const body = `Ευχαριστούμε για την παραγγελία σας. Σύνολο: €${(
          data.total ?? 0
        ).toFixed(2)}. Τ.Κ.: ${data.postalCode}.`;
        await fetch(`${origin}/api/ci/devmail/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to, subject, body }),
        }).catch(() => {});
      }
    } catch {}
    return NextResponse.json(
      { ok: true, id: created.id, mem: true },
      { status: 201 }
    );
  }
}
