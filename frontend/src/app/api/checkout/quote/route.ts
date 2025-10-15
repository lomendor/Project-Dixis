/**
 * POST /api/checkout/quote — Shipping Engine V2 quote endpoint
 */

import { NextResponse } from 'next/server';
import rates from '@/lib/shipping/config/rates.json';
import zones from '@/lib/shipping/config/zones.json';
import { quoteV2 } from '@/lib/shipping/engine.v2';
import type { RateRow, ZoneRow } from '@/lib/shipping/config/types';

export async function POST(req: Request) {
  const body = await req.json();
  const items = Array.isArray(body?.items) ? body.items : [];

  const res = quoteV2(
    { rates: rates as RateRow[], zones: zones as ZoneRow[] },
    {
      postalCode: String(body?.postalCode || ''),
      method: String(body?.method || 'COURIER') as any,
      items,
      subtotal: Number(body?.subtotal || 0),
      producerId: body?.producerId ? String(body.producerId) : undefined,
    }
  );

  return NextResponse.json({ ok: true, quote: res });
}
