import { NextResponse } from 'next/server';
import { requireAdmin, AdminError } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

// TODO [H1-Phase2]: Proxy to Laravel API for admin order summary/aggregation.
// CheckoutOrder + memOrders removed (H1-ORDER-MODEL Phase 1) — data was
// never populated in production. Wire to Laravel aggregation endpoint
// when available.

export async function GET(req: Request) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AdminError) return NextResponse.json({ error: e.message }, { status: 401 });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // No backend data source available yet — return zero totals
  return NextResponse.json({ totalCount: 0, totalAmount: 0 });
}
