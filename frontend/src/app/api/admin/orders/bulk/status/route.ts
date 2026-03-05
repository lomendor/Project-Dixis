import { NextResponse } from 'next/server';
import { requireAdmin, AdminError } from '@/lib/auth/admin';
import { getLaravelInternalUrl } from '@/env';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from '@/lib/auth/cookies';

const VALID_STATUSES = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

/**
 * POST /api/admin/orders/bulk/status
 *
 * FIX-STALE-PRISMA-01: Now sends updates to Laravel (SSOT) instead of Prisma/Neon.
 *
 * Calls Laravel PUT /admin/orders/{id}/status for each order.
 * Laravel handles: validation, transition rules, stock restore, status history, emails.
 */
export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { orderIds, status } = await req.json();

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: 'missing orderIds' }, { status: 400 });
    }
    const to = String(status || '').toLowerCase();
    if (!VALID_STATUSES.includes(to)) {
      return NextResponse.json({ error: `invalid status: ${to}` }, { status: 400 });
    }
    if (orderIds.length > 50) {
      return NextResponse.json({ error: 'max 50 orders per batch' }, { status: 400 });
    }

    const base = getLaravelInternalUrl();
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const results: { id: string | number; ok: boolean; error?: string }[] = [];

    for (const orderId of orderIds) {
      try {
        const res = await fetch(`${base}/admin/orders/${orderId}/status`, {
          method: 'PATCH',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ status: to }),
          signal: AbortSignal.timeout(10000),
        });

        if (res.ok) {
          results.push({ id: orderId, ok: true });
        } else {
          const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
          results.push({ id: orderId, ok: false, error: body.error || `HTTP ${res.status}` });
        }
      } catch (err) {
        results.push({ id: orderId, ok: false, error: (err as Error).message });
      }
    }

    const updated = results.filter(r => r.ok).length;
    const failed = results.filter(r => !r.ok);

    return NextResponse.json({ ok: true, updated, failed });

  } catch (error: unknown) {
    if (error instanceof AdminError) {
      if (error.code === 'NOT_AUTHENTICATED') {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
      }
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
    return NextResponse.json(
      { error: (error as Error)?.message || 'bulk_status_fail' },
      { status: 500 }
    );
  }
}
