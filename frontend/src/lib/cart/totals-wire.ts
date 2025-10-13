// Totals wire adapter (cents-based API mapping)
// Pass 174R.3 — Wire totals into API routes
// Pass 174R.4 — Money Contract Normalization (cents-first projection)

import { calcTotals, type ShippingMethod } from '@/lib/cart/totals';
import { Cents, toCents } from '@/types/money';

type Item = { priceCents?: number; price?: number; qty?: number; quantity?: number };
type ShippingCtx = { method?: string; baseCostCents?: number; codFeeCents?: number } | null;
type PaymentCtx = { method?: string } | null;

/**
 * Compute totals from flexible context (maps various input formats to helper)
 * @param ctx - Context with items, shipping, payment details
 * @returns Totals object with cents-based fields
 */
export function computeTotalsFromContext(ctx: {
  items?: Item[];
  shipping?: ShippingCtx;
  payment?: PaymentCtx;
  preferCents?: boolean;
}) {
  // Normalize items to helper format
  const items = Array.isArray(ctx.items)
    ? ctx.items.map((it) => ({
        price: Number(it?.priceCents ?? it?.price ?? 0),
        qty: Number(it?.qty ?? it?.quantity ?? 1),
      }))
    : [];

  // Build options for calcTotals
  const opts: any = { items };

  // Normalize shipping method
  const method = String(ctx?.shipping?.method || '').toUpperCase();
  if (method) opts.shippingMethod = method as ShippingMethod;

  // Add shipping cost if present
  if (typeof ctx?.shipping?.baseCostCents === 'number') {
    opts.baseShipping = ctx.shipping.baseCostCents;
  }

  // Add COD fee if payment method is COD
  if ((ctx?.payment?.method || '').toUpperCase() === 'COD') {
    opts.codFee =
      typeof ctx?.shipping?.codFeeCents === 'number' ? ctx.shipping.codFeeCents : 200;
  }

  // Calculate totals
  const t = calcTotals(opts);

  // Return in requested format (defaults to cents-based)
  const cents = ctx.preferCents !== false;

  // Return with branded Cents types (Pass 174R.4)
  return cents
    ? {
        subtotalCents: t.subtotalCents,
        shippingCents: t.shippingCents,
        codCents: t.codFeeCents,
        taxCents: t.taxCents,
        totalCents: t.grandTotalCents,
      }
    : {
        subtotal: Number(t.subtotal || 0),
        shipping: Number(t.shipping || 0),
        codFee: Number(t.codFee || 0),
        tax: Number(t.tax || 0),
        grandTotal: Number(t.grandTotal || 0),
      };
}

/**
 * Ensure cents projection is always present in totals object (non-breaking helper)
 * Pass 174R.4 — Adds branded Cents fields if missing
 * @param obj - Object with optional totals property
 * @returns Same object with guaranteed cents fields in totals
 */
export function withCentsProjection<T extends { totals?: any }>(obj: T): T {
  const t = (obj as any).totals || {};

  // Ensure *Cents fields exist (use toCents if raw values present)
  const ensure = (key: string, rawValue: number) => {
    const centsKey = key + 'Cents';
    if (typeof t[centsKey] === 'undefined' && typeof rawValue === 'number') {
      t[centsKey] = toCents(rawValue);
    }
  };

  if (typeof t.subtotal === 'number') ensure('subtotal', t.subtotal);
  if (typeof t.shipping === 'number') ensure('shipping', t.shipping);
  if (typeof t.codFee === 'number') ensure('codFee', t.codFee);
  if (typeof t.tax === 'number') ensure('tax', t.tax);
  if (typeof t.grandTotal === 'number') ensure('grandTotal', t.grandTotal);

  (obj as any).totals = t;
  return obj;
}
