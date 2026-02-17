import { NextResponse } from 'next/server';
import { rateLimit } from '../../../lib/rateLimit';
import { parseOrderNo } from '../../../lib/orderNumber';

export const dynamic = 'force-dynamic';

// Order lookup stub. Public order tracking uses /track/[token] with
// Laravel token-based lookup instead. This legacy endpoint returns 404.

export async function POST(req: Request) {
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

  if (!parseOrderNo(orderNo)) {
    return new NextResponse('not found', { status: 404 });
  }

  // No backend data source available yet — always 404
  return new NextResponse('not found', { status: 404 });
}
