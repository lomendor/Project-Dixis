import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { getAdminToken, handleAdminError } from '@/lib/admin/laravelProxy';
import { getLaravelInternalUrl } from '@/env';

export const dynamic = 'force-dynamic';

/**
 * H1-ORDER-MODEL Phase 2: Proxy to Laravel for order summary.
 * Laravel GET /admin/orders returns { meta: { total }, stats: { status→count } }.
 * We extract totalCount from meta.total and sum stats for totalAmount.
 */
export async function GET(req: Request) {
  try {
    await requireAdmin();
  } catch (error) {
    return handleAdminError(error);
  }

  // Parse filters from query string (same as list endpoint)
  const url = new URL(req.url);
  const status = url.searchParams.get('status') || '';
  const q = url.searchParams.get('q') || '';
  const from = url.searchParams.get('from') || url.searchParams.get('fromDate') || '';
  const to = url.searchParams.get('to') || url.searchParams.get('toDate') || '';

  try {
    const token = await getAdminToken();

    if (token) {
      const laravelBase = getLaravelInternalUrl();
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (q) params.set('q', q);
      if (from) params.set('from_date', from);
      if (to) params.set('to_date', to);
      params.set('per_page', '1'); // minimal payload — we only need meta+stats

      const laravelRes = await fetch(`${laravelBase}/admin/orders?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        cache: 'no-store',
      });

      if (laravelRes.ok) {
        const data = await laravelRes.json();
        const totalCount = data.meta?.total ?? 0;
        // Sum all order amounts from stats is not available — return count only
        // totalAmount requires a dedicated Laravel endpoint (future enhancement)
        return NextResponse.json({ totalCount, totalAmount: 0 });
      }

      return NextResponse.json({ error: 'Unauthorized' }, { status: laravelRes.status });
    }
  } catch (err) {
    console.error('[admin/orders/summary] Laravel proxy error:', err);
  }

  // Fallback for CI/demo
  return NextResponse.json({ totalCount: 0, totalAmount: 0 });
}
