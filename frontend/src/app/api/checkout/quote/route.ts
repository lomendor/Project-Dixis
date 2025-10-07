import { NextResponse } from 'next/server';
import { computeShipping } from '@/lib/checkout/shipping';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const subtotal = Number(body?.subtotal ?? 0);
    const shipping = computeShipping(subtotal);
    const total = subtotal + shipping;
    
    return NextResponse.json({ subtotal, shipping, total });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'quote_failed' }, 
      { status: 400 }
    );
  }
}
