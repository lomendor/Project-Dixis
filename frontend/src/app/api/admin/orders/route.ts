import { NextRequest, NextResponse } from 'next/server';
import { getOrdersRepo, type OrderStatus, type SortArg } from '@/lib/orders/providers';

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

  const ALLOWED = new Set(['pending','paid','shipped','cancelled','refunded']);
  if (status && !ALLOWED.has(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const mode = forceDemo ? 'demo' : (process.env.DIXIS_DATA_SRC || (process.env.CI ? 'sqlite' : 'demo'));
  const repo = getOrdersRepo(mode);

  try {
    const data = await repo.list({ status: status as OrderStatus | undefined, page, pageSize, sort, q, fromDate, toDate });
    return NextResponse.json(data, { status: 200 });
  } catch (err:any) {
    if (err?.name === 'NOT_IMPLEMENTED') {
      return NextResponse.json({ error: 'Not implemented for current mode', mode }, { status: 501 });
    }
    console.error('[orders api] unexpected', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
