import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { getAdminToken, handleAdminError } from '@/lib/admin/laravelProxy';

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
            status: match.status,
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
