import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { getAdminToken, handleAdminError } from '@/lib/admin/laravelProxy';
import { getLaravelInternalUrl } from '@/env';
import { prisma } from '@/lib/db/client';

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

        // Laravel found no match — try Prisma fallback (dashboard uses cuid IDs)
      }

      // Laravel returned non-OK or no match — fall through to Prisma
    }
  } catch (err) {
    console.error('[admin/orders/[id]] Laravel proxy error:', err);
  }

  // Prisma fallback: dashboard links use cuid IDs
  try {
    const order = await prisma.order.findUnique({
      where: { id: rawId },
      include: { items: true },
    });
    if (order) {
      return NextResponse.json({
        id: order.id,
        laravelId: null,
        customer: order.buyerName || order.name || order.email || 'N/A',
        email: order.email || null,
        total: `€${Number(order.total || 0).toFixed(2)}`,
        totalRaw: Number(order.total || 0),
        subtotal: Number(order.subtotal || 0),
        shippingCost: Number(order.shipping || 0),
        codFee: 0,
        status: order.status,
        paymentStatus: null,
        paymentMethod: null,
        paymentRef: null,
        shippingMethod: null,
        shippingAddress: order.shippingLine1 ? {
          line1: order.shippingLine1,
          line2: order.shippingLine2,
          city: order.shippingCity || order.city,
          postal_code: order.shippingPostal || order.zip,
        } : null,
        postalCode: order.shippingPostal || order.zip || null,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.items.map((item: { id: string; titleSnap: string | null; qty: number; price: number }) => ({
          id: item.id,
          productName: item.titleSnap || 'N/A',
          quantity: item.qty,
          unitPrice: Number(item.price || 0),
          totalPrice: Number(item.price || 0) * item.qty,
        })),
      });
    }
  } catch (err) {
    console.error('[admin/orders/[id]] Prisma fallback error:', err);
  }

  return new NextResponse('not found', { status: 404 });
}
