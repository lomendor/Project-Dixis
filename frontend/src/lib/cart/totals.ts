// Totals/Taxes helper (EL-format)
// Pass 174Q — Quick-Wins Triad

/**
 * Format cents as EUR with Greek locale formatting
 * @param cents - Amount in cents
 * @returns Formatted string (e.g., "50,00 €")
 */
export function fmtEUR(cents: number): string {
  return new Intl.NumberFormat('el-GR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/**
 * Round to 2 decimal places
 */
export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// Pass 48: Added 'HOME' for backward compatibility with checkout UI
export type ShippingMethod = 'PICKUP' | 'COURIER' | 'COURIER_COD' | 'HOME';

export interface CartItem {
  price: number; // in cents
  qty: number;
}

export interface TotalsInput {
  items: CartItem[];
  shippingMethod: ShippingMethod;
  baseShipping?: number; // in cents
  codFee?: number; // in cents
  taxRate?: number; // e.g., 0.24 for 24%
}

export interface TotalsOutput {
  subtotal: number; // in cents
  shipping: number; // in cents
  codFee: number; // in cents
  tax: number; // in cents
  grandTotal: number; // in cents
}

/**
 * Calculate order totals with shipping, COD, and tax
 * @param input - TotalsInput with items, shipping method, fees, and tax rate
 * @returns TotalsOutput with all calculated totals in cents
 */
export function calcTotals(input: TotalsInput): TotalsOutput {
  const {
    items,
    shippingMethod,
    baseShipping = 0,
    codFee = 0,
    taxRate = 0,
  } = input;

  // Calculate subtotal from items
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  // Calculate shipping based on method
  // Pass 48: HOME also uses baseShipping (like COURIER)
  let shipping = 0;
  if (shippingMethod === 'COURIER' || shippingMethod === 'COURIER_COD' || shippingMethod === 'HOME') {
    shipping = baseShipping;
  }

  // Calculate COD fee if applicable
  let codFeeAmount = 0;
  if (shippingMethod === 'COURIER_COD') {
    codFeeAmount = codFee;
  }

  // Calculate tax on subtotal + shipping + COD
  const taxableAmount = subtotal + shipping + codFeeAmount;
  const tax = Math.round(taxableAmount * taxRate);

  // Calculate grand total
  const grandTotal = taxableAmount + tax;

  return {
    subtotal,
    shipping,
    codFee: codFeeAmount,
    tax,
    grandTotal,
  };
}
