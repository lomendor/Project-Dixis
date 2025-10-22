import { NextRequest, NextResponse } from 'next/server';
import { getOrdersRepo, type OrderStatus } from '@/lib/orders/providers';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const forceDemo = url.searchParams.get('demo') === '1';
  const status = url.searchParams.get('status');

  const ALLOWED = new Set(['pending','paid','shipped','cancelled','refunded']);
  if (status && !ALLOWED.has(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const mode = forceDemo ? 'demo' : (process.env.DIXIS_DATA_SRC || (process.env.CI ? 'sqlite' : 'demo'));
  const repo = getOrdersRepo(mode);

  try {
    const data = await repo.list({ status: status as OrderStatus | undefined });
    return NextResponse.json(data, { status: 200 });
  } catch (err:any) {
    if (err?.name === 'NOT_IMPLEMENTED') {
      return NextResponse.json({ error: 'Not implemented for current mode', mode }, { status: 501 });
    }
    console.error('[orders api] unexpected', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
