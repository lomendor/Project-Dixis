import { NextResponse } from 'next/server';
import { requireAdmin, AdminError } from '@/lib/auth/admin';
import { getAdminToken } from '@/lib/admin/laravelProxy';
import { getLaravelInternalUrl } from '@/env';

/**
 * POST /api/admin/orders/[id]/status
 *
 * FIX-STALE-PRISMA-01: Removed Prisma fallback — Laravel is the only SSOT for orders.
 * Previously had dual code paths: Laravel for "A-" IDs and Prisma for cuid IDs.
 * Now all status changes go through Laravel which handles: validation, transition
 * rules, stock restore, status history, and email notifications.
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const id = params.id;
    const body = await req.json();
    const newStatus = body.status;
    const force = body.force === true;

    if (!newStatus) {
      return NextResponse.json({ error: 'missing status' }, { status: 400 });
    }

    // Extract numeric Laravel ID from "A-123" format
    const laravelId = id.startsWith('A-') ? id.slice(2) : id;

    const token = await getAdminToken();
    if (!token) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    // Map Next.js status names to Laravel equivalents
    const statusMap: Record<string, string> = {
      PACKING: 'processing',
      PAID: 'confirmed',
    };
    const laravelStatus = statusMap[String(newStatus).toUpperCase()]
      || String(newStatus).toLowerCase();

    const laravelBase = getLaravelInternalUrl();
    const laravelRes = await fetch(
      `${laravelBase}/admin/orders/${laravelId}/status`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: laravelStatus, ...(force ? { force: true } : {}) }),
      }
    );

    if (!laravelRes.ok) {
      const errData = await laravelRes.json().catch(() => ({}));
      console.error(`[admin/orders/${id}/status] Laravel error:`, laravelRes.status, errData);
      return NextResponse.json(
        { error: (errData as Record<string, unknown>).error || 'status_change_failed' },
        { status: laravelRes.status }
      );
    }

    console.log(`[order] ${id} (Laravel ${laravelId}) status → ${newStatus}${force ? ' (ADMIN OVERRIDE)' : ''}`);
    return NextResponse.json({ ok: true, orderId: id, status: String(newStatus).toUpperCase() });

  } catch (error: unknown) {
    if (error instanceof AdminError) {
      if (error.code === 'NOT_AUTHENTICATED') {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
      }
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    return NextResponse.json(
      { error: (error as Error)?.message || 'status_fail' },
      { status: 500 }
    );
  }
}
