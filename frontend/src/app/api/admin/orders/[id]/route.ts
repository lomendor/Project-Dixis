import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireAdmin, AdminError } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

/**
 * H1-ORDER-MODEL Phase 2: Proxy to Laravel for admin order detail.
 * Laravel doesn't have a dedicated GET /admin/orders/:id endpoint yet,
 * so we fetch the list filtered by order ID and return the first match.
 */
export async function GET(
  req: Request,
  ctx: { params: { id: string } }
): Promise<NextResponse> {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AdminError) return NextResponse.json({ error: e.message }, { status: 401 });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rawId = ctx?.params?.id;
  if (!rawId) {
    return new NextResponse('missing id', { status: 400 });
  }

  // Extract numeric Laravel ID from "A-123" format
  const laravelId = rawId.startsWith('A-') ? rawId.slice(2) : rawId;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value
      || new Headers(req.headers).get('authorization')?.replace('Bearer ', '');

    if (token) {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';

      // Search for this specific order by ID
      const laravelRes = await fetch(
        `${apiBase}/admin/orders?q=${encodeURIComponent(laravelId)}&per_page=1`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
          cache: 'no-store',
        }
      );

      if (laravelRes.ok) {
        const data = await laravelRes.json();
        const orders = data.orders || [];
        // Find exact match by ID
        const match = orders.find((o: any) => String(o.id) === laravelId);

        if (match) {
          return NextResponse.json({
            id: `A-${match.id}`,
            customer: match.user?.name || match.user?.email || 'N/A',
            email: match.user?.email || null,
            total: `€${Number(match.total_amount || 0).toFixed(2)}`,
            totalRaw: Number(match.total_amount || 0),
            status: match.status,
            paymentStatus: match.payment_status,
            paymentMethod: match.payment_method,
            shippingMethod: match.shipping_method,
            createdAt: match.created_at,
            updatedAt: match.updated_at,
            items: (match.order_items || match.orderItems || []).map((item: any) => ({
              id: item.id,
              productName: item.product_name || item.product?.name || 'N/A',
              quantity: item.quantity,
              unitPrice: item.unit_price,
              totalPrice: item.total_price,
            })),
          });
        }

        return new NextResponse('not found', { status: 404 });
      }

      return NextResponse.json({ error: 'Unauthorized' }, { status: laravelRes.status });
    }
  } catch (err) {
    console.error('[admin/orders/[id]] Laravel proxy error:', err);
  }

  return new NextResponse('not found', { status: 404 });
}
