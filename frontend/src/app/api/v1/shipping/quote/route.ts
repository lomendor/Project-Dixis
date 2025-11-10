import { NextRequest, NextResponse } from 'next/server';
import { calcShippingForItems, Zone } from '@/lib/shipping';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const items = Array.isArray(body?.items) ? body.items : [];
    const zone: Zone = (body?.zone === 'islands' ? 'islands' : 'mainland');
    if (!items.length) return NextResponse.json({ total: 0, subtotal: 0, zone, threshold: Number(process.env.NEXT_PUBLIC_SHIP_FREE_THRESHOLD_EUR ?? 35) });
    const res = await calcShippingForItems(items, zone);
    return NextResponse.json(res);
  } catch {
    return NextResponse.json({ total: 0, subtotal: 0, zone: 'mainland', threshold: Number(process.env.NEXT_PUBLIC_SHIP_FREE_THRESHOLD_EUR ?? 35) });
  }
}
export function GET(){ return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 }); }
