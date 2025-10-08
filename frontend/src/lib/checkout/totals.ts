export type Line = { price:number; qty:number };
export type Totals = { currency:'EUR'; vatRate:number; subtotal:number; shipping:number; vat:number; total:number; rules:{ flat:number; freeFrom:number } };

// VAT is part of gross price: vat = subtotal * r/(1+r)
function round2(n:number){ return Math.round((n + Number.EPSILON) * 100) / 100; }

export function computeTotals(lines:Line[], opts?:{ vatRate?:number; shippingFlat?:number; shippingFreeFrom?:number }):Totals{
  const vatRate = Number(opts?.vatRate ?? (process.env.VAT_RATE ? Number(process.env.VAT_RATE) : 0.13));
  const shippingFlat = Number(opts?.shippingFlat ?? (process.env.SHIPPING_FLAT_EUR ? Number(process.env.SHIPPING_FLAT_EUR) : 3.5));
  const shippingFreeFrom = Number(opts?.shippingFreeFrom ?? (process.env.SHIPPING_FREE_FROM_EUR ? Number(process.env.SHIPPING_FREE_FROM_EUR) : 25));
  const subtotal = round2(lines.reduce((s,l)=> s + Number(l.price||0)*Number(l.qty||0), 0));
  const shipping = subtotal >= shippingFreeFrom ? 0 : shippingFlat;
  const vat = round2(subtotal * vatRate / (1 + vatRate));
  const total = round2(subtotal + shipping);
  return { currency:'EUR', vatRate, subtotal, shipping, vat, total, rules:{ flat: shippingFlat, freeFrom: shippingFreeFrom } };
}
