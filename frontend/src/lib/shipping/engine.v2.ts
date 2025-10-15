/**
 * Shipping Engine V2 — Config-based zones/tiers/volumetric
 */

import { RateRow, ZoneRow, QuoteInput, QuoteResult, Surcharge } from './config/types';

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const codFeeFor = (m: string) => (m === 'COURIER_COD' ? 2.0 : 0);

export function volumetricKg(
  l?: number,
  w?: number,
  h?: number,
  divisor = 5000
) {
  if (!l || !w || !h) return 0;
  return (l * w * h) / divisor;
}

export function zoneForPostal(zones: ZoneRow[], postal: string): string {
  const p = String(postal || '').replace(/\D/g, '');
  // longest prefix wins
  let best: ZoneRow | undefined;
  for (const z of zones) {
    if (
      p.startsWith(z.prefix) &&
      (!best || z.prefix.length > best.prefix.length)
    )
      best = z;
  }
  return best?.zone_id || 'MAIN';
}

export function chargeableKgOf(
  items: {
    qty: number;
    weightKg?: number;
    lengthCm?: number;
    widthCm?: number;
    heightCm?: number;
  }[]
) {
  let total = 0;
  for (const it of items) {
    const actual = Number(it.weightKg || 0);
    const vol = volumetricKg(it.lengthCm, it.widthCm, it.heightCm);
    const perItem = Math.max(actual, vol);
    total += perItem * Number(it.qty || 0);
  }
  return Math.max(round2(total), 0);
}

export function selectRate(
  rates: RateRow[],
  zone: string,
  method: string,
  kg: number
) {
  const r = rates
    .filter(
      x =>
        String(x.zone).toUpperCase() === String(zone).toUpperCase() &&
        String(x.delivery_method).toUpperCase() === String(method).toUpperCase()
    )
    .map(x => ({
      from: +x.weight_from_kg,
      to: +x.weight_to_kg,
      base: +x.base_rate,
      extra: +(x.extra_kg_rate || 0),
    }))
    .sort((a, b) => a.from - b.from);

  // binary-ish search
  let lo = 0,
    hi = r.length - 1,
    ans: null | { from: number; to: number; base: number; extra: number } =
      null;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const t = r[mid];
    if (kg < t.from) hi = mid - 1;
    else if (kg > t.to) lo = mid + 1;
    else {
      ans = t;
      break;
    }
  }

  if (!ans) {
    // last tier with extra per kg
    ans = r[r.length - 1] || null;
    if (ans && kg > ans.to) {
      const extraKg = Math.max(0, Math.ceil(kg - ans.to));
      return { ...ans, base: ans.base + extraKg * (ans.extra || 0) };
    }
  }
  return ans;
}

export function quoteV2(
  cfg: { rates: RateRow[]; zones: ZoneRow[] },
  i: QuoteInput
): QuoteResult {
  const trace: string[] = [];
  const sur: Surcharge[] = [];
  const zone = zoneForPostal(cfg.zones, i.postalCode);
  trace.push(`ZONE:${zone}`);
  const kg = chargeableKgOf(i.items);
  trace.push(`KG:${kg}`);

  // map to HOME if we only have HOME in CSV
  const method = i.method === 'COURIER' ? 'HOME' : i.method;
  let rate = selectRate(cfg.rates, zone, method, kg);

  if (!rate) {
    // fallback simple logic
    const base = i.method === 'PICKUP' ? 0 : 3.5;
    const cod = codFeeFor(i.method);
    trace.push('FALLBACK');
    return {
      shippingCost: round2(base),
      codFee: round2(cod),
      surcharges: sur,
      ruleTrace: trace,
      chargeableKg: kg,
      zone,
    };
  }

  let cost = rate.base;
  const cod = codFeeFor(i.method);
  if (cod > 0) trace.push('COD=2.0');

  // free shipping threshold (business rule)
  if (i.subtotal >= 60) {
    trace.push('FREE>=60');
    return {
      shippingCost: 0,
      codFee: 0,
      surcharges: [],
      ruleTrace: trace,
      chargeableKg: kg,
      zone,
    };
  }

  return {
    shippingCost: round2(cost),
    codFee: round2(cod),
    surcharges: sur,
    ruleTrace: trace,
    chargeableKg: kg,
    zone,
  };
}
