import { NextRequest, NextResponse } from 'next/server';
import { getOrdersRepo } from '@/lib/orders/providers';
import type { ListParams } from '@/lib/orders/providers';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const forceDemo = url.searchParams.get('demo') === '1';
  const status = url.searchParams.get('status') || undefined;
  const q = url.searchParams.get('q') || undefined;
  const fromDate = url.searchParams.get('fromDate') || undefined;
  const toDate = url.searchParams.get('toDate') || undefined;
  const sort = (url.searchParams.get('sort') || '-createdAt') as ListParams['sort'];

  const mode = forceDemo ? 'demo' : (process.env.DIXIS_DATA_SRC || (process.env.CI ? 'sqlite' : 'demo'));
  const repo = getOrdersRepo(mode);

  const pageSize = 200;
  let page = 1;
  const totals = new Map<string, number>();
  let total = 0;

  for (;;) {
    const res = await repo.list({ status: status as any, q, fromDate, toDate, sort, page, pageSize });
    if (!total) total = res.count || 0;
    for (const r of res.items) {
      const st = (r as any).status ?? 'unknown';
      totals.set(st, (totals.get(st) || 0) + 1);
    }
    if (res.items.length < pageSize) break;
    page += 1;
    if ((page - 1) * pageSize >= total && total > 0) break;
    if (page > 10000) break; // safety
  }

  const obj: Record<string, number> = {};
  for (const [k, v] of totals.entries()) obj[k] = v;

  return NextResponse.json({ totals: obj, total }, { headers: { 'Cache-Control': 'no-store' } });
}
