import { NextRequest, NextResponse } from 'next/server';
import { getOrdersRepo } from '@/lib/orders/providers';
import type { ListParams } from '@/lib/orders/providers';

function csvEscape(v: any) {
  return `"${String(v ?? '').replace(/"/g, '""')}"`;
}

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

  // Μαζεύουμε ΟΛΑ τα rows με paging, για τα ενεργά φίλτρα
  const pageSize = 100;
  let page = 1;
  let total = 0;
  let lines: string[] = [];
  // Header
  lines.push(['Order','Πελάτης','Σύνολο','Κατάσταση'].map(csvEscape).join(','));

  // Loop μέχρι να φτάσουμε count
  // (πρακτικό για τις τρέχουσες κλίμακες — για τεράστια datasets, μελλοντικά θα το κάνουμε streaming)
  for (;;) {
    const res = await repo.list({ status: status as any, q, fromDate, toDate, sort, page, pageSize });
    if (!total) total = res.count || 0;
    for (const r of res.items) {
      lines.push([r.id, (r as any).customer, r.total, r.status].map(csvEscape).join(','));
    }
    const got = res.items.length;
    if (got < pageSize) break;
    page += 1;
    if ((page-1)*pageSize >= total && total>0) break;
    // Προστασία για runaway loops
    if (page > 10000) break;
  }

  const body = lines.join('\n');
  const ts = new Date().toISOString().slice(0,10);
  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="orders_full_${ts}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
