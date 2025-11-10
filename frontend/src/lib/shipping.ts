import { prisma } from '@/lib/prisma';

export type Zone = 'mainland' | 'islands';
export type Item = { slug: string; qty: number };

const FREE_TH = Number(process.env.NEXT_PUBLIC_SHIP_FREE_THRESHOLD_EUR ?? '35');
const MAX_COST = Number(process.env.NEXT_PUBLIC_SHIP_MAX_COST ?? '19.9');

const ZONES: Record<Zone, { base: number; perItem: number }> = {
  mainland: { base: Number(process.env.NEXT_PUBLIC_SHIP_MAINLAND_BASE ?? '2.5'),
              perItem: Number(process.env.NEXT_PUBLIC_SHIP_MAINLAND_PERITEM ?? '0.9') },
  islands:  { base: Number(process.env.NEXT_PUBLIC_SHIP_ISLANDS_BASE ?? '3.5'),
              perItem: Number(process.env.NEXT_PUBLIC_SHIP_ISLANDS_PERITEM ?? '1.1') },
};

export function calcShippingFromSummary(subtotal: number, qty: number, zone: Zone) {
  if (subtotal >= FREE_TH) return { total: 0, subtotal, zone, threshold: FREE_TH };
  const { base, perItem } = ZONES[zone];
  const total = Math.min(MAX_COST, Math.max(0, base + perItem * Math.max(0, qty)));
  return { total: Number(total.toFixed(2)), subtotal: Number(subtotal.toFixed(2)), zone, threshold: FREE_TH };
}

export async function calcShippingForItems(items: Item[], zone: Zone) {
  const slugs = items.map(i => i.slug);
  const prods = await prisma.product.findMany({
    where: { id: { in: slugs } },
    select: { id: true, price: true }
  });
  const map = new Map<string, number>();
  for (const p of prods) map.set(p.id, Number(p.price ?? 0));

  let subtotal = 0; let qty = 0;
  for (const it of items) {
    const q = Math.max(0, Number(it.qty) || 0);
    subtotal += (map.get(it.slug) ?? 0) * q;
    qty += q;
  }
  return calcShippingFromSummary(subtotal, qty, zone);
}
