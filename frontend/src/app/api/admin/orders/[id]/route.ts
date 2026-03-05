import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { getAdminToken, handleAdminError } from '@/lib/admin/laravelProxy';
import { getLaravelInternalUrl } from '@/env';

export const dynamic = 'force-dynamic';

/** Map Laravel status names to Next.js equivalents */
function normalizeLaravelStatus(s: string): string {
  const map: Record<string, string> = {
    processing: 'PACKING',
    confirmed: 'PAID',
  };
  return map[s?.toLowerCase()] || s?.toUpperCase() || 'PENDING';
}

/**
 * GET /api/admin/orders/[id]
 *
 * FIX-STALE-PRISMA-01: Removed Prisma fallback — Laravel is the only SSOT for orders.
 * Previously fell back to stale Prisma/Neon data when Laravel didn't find a match.
 */
export async function GET(
  req: Request,
  ctx: { params: { id: string } }
): Promise<NextResponse> {
  try {
    await requireAdmin();
  } catch (error) {
    return handleAdminError(error);
  }

  const rawId = ctx?.params?.id;
  if (!rawId) {
    return new NextResponse('missing id', { status: 400 });
  }

  // Extract numeric Laravel ID from "A-123" format
  const laravelId = rawId.startsWith('A-') ? rawId.slice(2) : rawId;

  try {
    const token = await getAdminToken();

    if (!token) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const laravelBase = getLaravelInternalUrl();

    // Search for this specific order by ID
    const laravelRes = await fetch(
      `${laravelBase}/admin/orders?q=${encodeURIComponent(laravelId)}&per_page=1`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!laravelRes.ok) {
      console.error(`[admin/orders/${rawId}] Laravel returned ${laravelRes.status}`);
      return NextResponse.json({ error: 'upstream_error' }, { status: 502 });
    }

    const data = await laravelRes.json();
    const orders = data.orders || [];
    const match = orders.find((o: any) => String(o.id) === laravelId);

    if (!match) {
      return new NextResponse('not found', { status: 404 });
    }

    // Parse shipping_address JSON safely
    let shippingAddress = null;
    try {
      shippingAddress = typeof match.shipping_address === 'string'
        ? JSON.parse(match.shipping_address)
        : match.shipping_address || null;
    } catch { /* ignore parse errors */ }

    return NextResponse.json({
      id: `A-${match.id}`,
      laravelId: match.id,
      customer: match.user?.name || match.user?.email || 'N/A',
      email: match.user?.email || null,
      total: `€${Number(match.total_amount || 0).toFixed(2)}`,
      totalRaw: Number(match.total_amount || 0),
      subtotal: Number(match.subtotal || 0),
      shippingCost: Number(match.shipping_cost || match.shipping_amount || 0),
      codFee: Number(match.cod_fee || 0),
      status: normalizeLaravelStatus(match.status),
      paymentStatus: match.payment_status,
      paymentMethod: match.payment_method,
      paymentRef: match.payment_reference || null,
      shippingMethod: match.shipping_method,
      shippingAddress,
      postalCode: shippingAddress?.postal_code || match.postal_code || null,
      createdAt: match.created_at,
      updatedAt: match.updated_at,
      items: (match.order_items || match.orderItems || []).map((item: any) => ({
        id: item.id,
        productName: item.product_name || item.product?.name || 'N/A',
        quantity: item.quantity,
        unitPrice: Number(item.unit_price || 0),
        totalPrice: Number(item.total_price || 0),
      })),
    });
  } catch (err) {
    console.error('[admin/orders/[id]] Laravel proxy error:', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
