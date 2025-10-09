import { NextResponse } from 'next/server';
import { quote } from '@/lib/shipping/engine';

export async function GET(req: Request){
  const url = new URL(req.url);
  const method = (url.searchParams.get('method')||'COURIER') as any;
  const subtotal = Number(url.searchParams.get('subtotal')||0);
  if (!Number.isFinite(subtotal) || subtotal<0) {
    return NextResponse.json({ error:'invalid_subtotal' }, { status: 400 });
  }
  const q = quote({ method, subtotal });
  return NextResponse.json({ ok:true, method, subtotal, ...q }, { headers: { 'cache-control':'no-store' } });
}
