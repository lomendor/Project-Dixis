import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Simple rules (tunable next pass)
const BASE = 2.5;         // base cost
const PER_ITEM = 0.9;     // per item
const MAX_COST = 19.9;    // cap to avoid runaway costs

type Item = { slug: string; qty: number };

function calc(items: Item[]) {
  const qty = items.reduce((s, i) => s + Math.max(0, Number(i.qty) || 0), 0);
  const total = Math.min(MAX_COST, Math.max(0, BASE + PER_ITEM * qty));
  return { total: Number(total.toFixed(2)) };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const items: Item[] = Array.isArray(body?.items) ? body.items : [];
    if (!items.length) return NextResponse.json({ total: 0 });
    return NextResponse.json(calc(items));
  } catch {
    return NextResponse.json({ total: 0 });
  }
}

// Explicitly reject other methods
export function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
