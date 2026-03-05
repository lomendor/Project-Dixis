import { NextResponse } from 'next/server';
import { requireAdmin, AdminError } from '@/lib/auth/admin';
import { fetchOrdersAnalytics } from '@/lib/laravel/dashboard';

/**
 * GET /api/admin/orders/facets
 *
 * FIX-STALE-PRISMA-01: Now reads from Laravel (SSOT) instead of stale Prisma/Neon.
 *
 * Previously used Prisma groupBy or demo mode with complex PG provider setup.
 * Now simply proxies Laravel's /admin/analytics/orders which already has
 * `by_status` counts and `summary.total_orders`.
 */
export async function GET() {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AdminError) return NextResponse.json({ error: e.message }, { status: 401 });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const analytics = await fetchOrdersAnalytics();

    if (!analytics) {
      // Laravel unavailable — return empty facets (graceful degradation)
      return NextResponse.json(
        { totals: {}, total: 0, provider: 'laravel-unavailable' },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    return NextResponse.json(
      {
        totals: analytics.by_status,
        total: analytics.summary.total_orders,
        provider: 'laravel',
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('[facets] Failed to fetch from Laravel:', error);
    return NextResponse.json(
      { totals: {}, total: 0, provider: 'error' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
