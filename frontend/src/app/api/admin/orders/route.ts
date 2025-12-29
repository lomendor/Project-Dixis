import { NextRequest, NextResponse } from 'next/server';
import { getOrdersRepo, type OrderStatus, type SortArg } from '@/lib/orders/providers';
import { cookies } from 'next/headers';

/**
 * Pass 61: Admin orders list
 * Proxies to Laravel API when auth token available, falls back to local demo
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const forceDemo = url.searchParams.get('demo') === '1';
  const status = url.searchParams.get('status') || undefined;
  const page = Number(url.searchParams.get('page') || '1');
  const pageSize = Number(url.searchParams.get('pageSize') || '10');
  const sort = (url.searchParams.get('sort') || '-createdAt') as SortArg;
  const q = url.searchParams.get('q') || undefined;
  const fromDate = url.searchParams.get('fromDate') || undefined;
  const toDate = url.searchParams.get('toDate') || undefined;

  // Pass 61: Try Laravel API first (single source of truth)
  if (!forceDemo) {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('auth_token')?.value || req.headers.get('authorization')?.replace('Bearer ', '');

      if (token) {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001/api/v1';
        const params = new URLSearchParams();
        if (status) params.set('status', status);
        if (q) params.set('q', q);
        if (fromDate) params.set('from_date', fromDate);
        if (toDate) params.set('to_date', toDate);
        params.set('page', String(page));
        params.set('per_page', String(pageSize));
        params.set('sort', sort === 'createdAt' ? 'created_at' : '-created_at');

        const laravelRes = await fetch(`${apiBase}/admin/orders?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
          cache: 'no-store',
        });

        if (laravelRes.ok) {
          const data = await laravelRes.json();
          // Transform Laravel response to match existing frontend format
          return NextResponse.json({
            items: (data.orders || []).map((o: Record<string, unknown>) => ({
              id: `A-${o.id}`,
              customer: (o.user as Record<string, unknown>)?.name || (o.user as Record<string, unknown>)?.email || 'N/A',
              total: `€${Number(o.total_amount || 0).toFixed(2)}`,
              status: o.status,
            })),
            count: data.meta?.total || 0,
            stats: data.stats || {},
            meta: data.meta || {},
          }, { status: 200 });
        }
        // If Laravel returns 403/401, return unauthorized (no demo fallback in prod)
        return NextResponse.json({ error: 'Unauthorized' }, { status: laravelRes.status });
      }
    } catch (err) {
      console.error('[admin/orders] Laravel API error:', err);
      // In production, don't fallback to demo - require real auth
      if (process.env.NODE_ENV === 'production' && !process.env.CI) {
        return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
      }
    }
  }

  // Demo fallback: ONLY allowed in CI/test environments
  const isCIOrTest = process.env.CI === 'true' || process.env.NODE_ENV === 'test' || forceDemo;
  if (!isCIOrTest && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized - admin authentication required' }, { status: 401 });
  }

  // Fallback: demo mode (local data) - CI/test only
  const ALLOWED = new Set(['pending','paid','shipped','cancelled','refunded','confirmed','processing','delivered']);
  if (status && !ALLOWED.has(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const mode = forceDemo ? 'demo' : (process.env.DIXIS_DATA_SRC || (process.env.CI ? 'sqlite' : 'demo'));
  const repo = getOrdersRepo(mode);

  try {
    const data = await repo.list({ status: status as OrderStatus | undefined, page, pageSize, sort, q, fromDate, toDate });
    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    const error = err as { name?: string; message?: string };
    if (error?.name === 'NOT_IMPLEMENTED') {
      return NextResponse.json({ error: 'Not implemented for current mode', mode }, { status: 501 });
    }
    console.error('[orders api] unexpected', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
