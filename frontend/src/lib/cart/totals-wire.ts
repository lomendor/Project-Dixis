// Totals wire adapter (cents-based API mapping)
// Pass 174R.3 — Wire totals into API routes

import { calcTotals, type ShippingMethod } from '@/lib/cart/totals';

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

  return cents
    ? {
        subtotalCents: Number(t.subtotal || 0),
        shippingCents: Number(t.shipping || 0),
        codCents: Number(t.codFee || 0),
        taxCents: Number(t.tax || 0),
        totalCents: Number(t.grandTotal || 0),
      }
    : {
        subtotal: Number(t.subtotal || 0),
        shipping: Number(t.shipping || 0),
        codFee: Number(t.codFee || 0),
        tax: Number(t.tax || 0),
        grandTotal: Number(t.grandTotal || 0),
      };
}
