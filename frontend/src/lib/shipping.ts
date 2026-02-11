import { getLaravelInternalUrl } from '@/env';

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

/**
 * Phase 5.5c: Fetch product prices from Laravel (SSOT) instead of Prisma.
 * Fetches individual products by ID from /public/products/{id}.
 */
export async function calcShippingForItems(items: Item[], zone: Zone) {
  const slugs = items.map(i => i.slug);
  const laravelBase = getLaravelInternalUrl();
  const priceMap = new Map<string, number>();

  try {
    await Promise.all(slugs.map(async (id) => {
      const url = new URL(`${laravelBase}/public/products/${id}`);
      const res = await fetch(url.toString(), {
        headers: { 'Accept': 'application/json' },
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const json = await res.json();
        const product = json?.data ?? json;
        priceMap.set(id, Number(product.price ?? 0));
      }
    }));
  } catch {
    // If Laravel fails, prices default to 0 (graceful degradation)
  }

  let subtotal = 0; let qty = 0;
  for (const it of items) {
    const q = Math.max(0, Number(it.qty) || 0);
    subtotal += (priceMap.get(it.slug) ?? 0) * q;
    qty += q;
  }
  return calcShippingFromSummary(subtotal, qty, zone);
}
