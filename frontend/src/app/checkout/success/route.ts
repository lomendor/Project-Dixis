import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const u = new URL(req.url);
  const id = u.searchParams.get('orderId') || u.searchParams.get('order') || '';

  // Use NEXT_PUBLIC_BASE_URL if set, otherwise use host from request headers
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
    `${u.protocol}//${req.headers.get('host') || u.host}`;

  const to = new URL(`/checkout/confirmation${id ? `?orderId=${encodeURIComponent(id)}` : ''}`, baseUrl);
  return NextResponse.redirect(to, { status: 307 });
}
