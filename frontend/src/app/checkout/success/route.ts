import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const u = new URL(req.url);
  const id = u.searchParams.get('orderId') || u.searchParams.get('order') || '';
  const to = new URL(`/checkout/confirmation${id ? `?orderId=${encodeURIComponent(id)}` : ''}`, u.origin);
  return NextResponse.redirect(to, { status: 307 });
}
