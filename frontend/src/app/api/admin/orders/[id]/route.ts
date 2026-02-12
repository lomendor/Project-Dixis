import { NextResponse } from 'next/server';
import { requireAdmin, AdminError } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

// TODO [H1-Phase2]: Proxy to Laravel API for admin order detail.
// CheckoutOrder + memOrders removed (H1-ORDER-MODEL Phase 1) — data was
// never populated in production. Wire to Laravel GET /admin/orders/:id
// when the endpoint is available.

export async function GET(
  _req: Request,
  ctx: { params: { id: string } }
): Promise<NextResponse> {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AdminError) return NextResponse.json({ error: e.message }, { status: 401 });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const id = ctx?.params?.id;
  if (!id) {
    return new NextResponse('missing id', { status: 400 });
  }

  // No backend data source available yet — return 404
  return new NextResponse('not found', { status: 404 });
}
