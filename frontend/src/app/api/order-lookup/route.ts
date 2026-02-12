import { NextResponse } from 'next/server';
import { rateLimit } from '../../../lib/rateLimit';
import { parseOrderNo } from '../../../lib/orderNumber';

export const dynamic = 'force-dynamic';

// TODO [H1-Phase2]: Proxy to Laravel API for real order lookup.
// CheckoutOrder model was deleted (H1-ORDER-MODEL Phase 1) — it was never
// populated in production, so this endpoint always returned 404 anyway.
// When Laravel exposes a lookup-by-orderNo endpoint, wire it here.

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
