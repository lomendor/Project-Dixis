import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { getAdminToken, handleAdminError } from '@/lib/admin/laravelProxy';
import { getLaravelInternalUrl } from '@/env';

/**
 * Pass COD-COMPLETE: Confirm COD payment received.
 * POST /api/admin/orders/:id/payment-confirm
 *
 * Proxies to Laravel: PATCH /api/v1/admin/orders/:id/payment/confirm
 */
export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
  } catch (error) {
    return handleAdminError(error);
  }

  try {
    const token = await getAdminToken();
    if (!token) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    // Extract numeric Laravel order ID from "A-123" format
    const rawId = params.id;
    const laravelId = rawId.startsWith('A-') ? rawId.slice(2) : rawId;

    const laravelBase = getLaravelInternalUrl();
    const laravelRes = await fetch(
      `${laravelBase}/admin/orders/${laravelId}/payment/confirm`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await laravelRes.json();

    if (!laravelRes.ok) {
      return NextResponse.json(
        { error: data.error || 'confirm_fail' },
        { status: laravelRes.status }
      );
    }

    return NextResponse.json({ ok: true, orderId: rawId });
  } catch (error: unknown) {
    console.error('[admin] payment confirm error:', error);
    return NextResponse.json(
      { error: (error as Error)?.message || 'confirm_fail' },
      { status: 500 }
    );
  }
}
