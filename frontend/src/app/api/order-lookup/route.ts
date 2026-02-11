import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { memOrders } from '../../../lib/orderStore';
import { rateLimit } from '../../../lib/rateLimit';
import { parseOrderNo } from '../../../lib/orderNumber';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // Rate-limit: 60 req/min (prod-only)
  if (!(await rateLimit('order-lookup', 60))) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return new NextResponse('bad json', { status: 400 });
  }

  const orderNo = String(body?.orderNo || '').trim();
  const email = String(body?.email || '').trim().toLowerCase();

  if (!orderNo || !email) {
    return new NextResponse('missing orderNo or email', { status: 400 });
  }

  const parsed = parseOrderNo(orderNo);
  if (!parsed) {
    // Uniform 404 for security (avoid enumeration)
    return new NextResponse('not found', { status: 404 });
  }

  const { dateStart, dateEnd, suffix } = parsed;

  try {
    const candidates = await prisma.checkoutOrder.findMany({
        where: {
          createdAt: {
            gte: dateStart,
            lt: dateEnd,
          },
          email,
        },
      });

      // Match suffix (last 4 chars of ID uppercased)
      const matched = candidates.find((o: any) => {
        const safeId = (o.id || '').replace(/[^a-z0-9]/gi, '');
        const orderSuffix = (safeId.slice(-4) || '0000').toUpperCase();
        return orderSuffix === suffix;
      });

      if (!matched) {
        return new NextResponse('not found', { status: 404 });
      }

      // Return limited order fields (no sensitive data)
      return NextResponse.json({
        orderNo,
        createdAt: matched.createdAt,
        postalCode: matched.postalCode,
        method: matched.method,
        total: matched.total,
        paymentStatus: matched.paymentStatus,
      });
  } catch {
    // Fallback to memory
  }

  // In-memory fallback
  const memList = memOrders.list();
  const candidates = memList.filter((o: any) => {
    const oDate = new Date(o.createdAt);
    return (
      oDate >= dateStart &&
      oDate < dateEnd &&
      String(o.email || '').toLowerCase() === email
    );
  });

  const matched = candidates.find((o: any) => {
    const safeId = (o.id || '').replace(/[^a-z0-9]/gi, '');
    const orderSuffix = (safeId.slice(-4) || '0000').toUpperCase();
    return orderSuffix === suffix;
  });

  if (!matched) {
    return new NextResponse('not found', { status: 404 });
  }

  return NextResponse.json({
    orderNo,
    createdAt: matched.createdAt,
    postalCode: matched.postalCode,
    method: matched.method,
    total: matched.total,
    paymentStatus: matched.paymentStatus || 'PAID',
  });
}
