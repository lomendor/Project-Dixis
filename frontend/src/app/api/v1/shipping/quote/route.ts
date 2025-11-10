import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type Item = { slug: string; qty: number };
type ZoneKey = 'mainland' | 'islands';

const FREE_TH = Number(process.env.NEXT_PUBLIC_SHIP_FREE_THRESHOLD_EUR ?? '35');
const MAX_COST = Number(process.env.NEXT_PUBLIC_SHIP_MAX_COST ?? '19.9');

const ZONES: Record<ZoneKey, { base: number; perItem: number }> = {
  mainland: { base: Number(process.env.NEXT_PUBLIC_SHIP_MAINLAND_BASE ?? '2.5'),
              perItem: Number(process.env.NEXT_PUBLIC_SHIP_MAINLAND_PERITEM ?? '0.9') },
  islands:  { base: Number(process.env.NEXT_PUBLIC_SHIP_ISLANDS_BASE ?? '3.5'),
              perItem: Number(process.env.NEXT_PUBLIC_SHIP_ISLANDS_PERITEM ?? '1.1') },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const items: Item[] = Array.isArray(body?.items) ? body.items : [];
    const zone: ZoneKey = (body?.zone === 'islands' ? 'islands' : 'mainland');

    if (!items.length) {
      return NextResponse.json({ total: 0, subtotal: 0, zone, threshold: FREE_TH });
    }

    // Υπολόγισε subtotal από DB για να κρίνεις threshold
    const slugs = items.map(i => i.slug);
    const prods = await prisma.product.findMany({
      where: { id: { in: slugs } },
      select: { id: true, price: true }
    });

    const priceBySlug = new Map<string, number>();
    for (const p of prods) priceBySlug.set(p.id, Number(p.price ?? 0));

    let subtotal = 0;
    let qtyTotal = 0;
    for (const it of items) {
      const price = priceBySlug.get(it.slug) ?? 0;
      const q = Math.max(0, Number(it.qty) || 0);
      subtotal += price * q;
      qtyTotal += q;
    }

    // Κανόνες: δωρεάν πάνω από threshold, αλλιώς base + perItem*qty, με cap
    let total = 0;
    if (subtotal >= FREE_TH) {
      total = 0;
    } else {
      const { base, perItem } = ZONES[zone];
      total = Math.min(MAX_COST, Math.max(0, base + perItem * qtyTotal));
    }

    return NextResponse.json({
      total: Number(total.toFixed(2)),
      subtotal: Number(subtotal.toFixed(2)),
      zone,
      threshold: FREE_TH
    });
  } catch {
    return NextResponse.json({ total: 0, subtotal: 0, zone: 'mainland', threshold: FREE_TH });
  }
}

// Αν κληθεί GET, απάντησε 405 (για καθαρότητα)
export function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
