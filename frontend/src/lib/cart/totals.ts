// Totals/Taxes helper (EL-first formatting)
// Pass 174Q — Quick-Wins Triad

export function fmtEUR(cents: number): string {
  return new Intl.NumberFormat('el-GR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export type ShippingMethod = 'PICKUP' | 'COURIER' | 'COURIER_COD';

export interface TotalsInput {
  subtotalCents: number;
  shippingMethod: ShippingMethod;
  shippingCostCents?: number;
  codFeeCents?: number;
  taxRate?: number;
}

export interface TotalsOutput {
  subtotalCents: number;
  shippingCents: number;
  codCents: number;
  taxCents: number;
  totalCents: number;
  subtotalEUR: string;
  shippingEUR: string;
  codEUR: string;
  taxEUR: string;
  totalEUR: string;
}

export function calcTotals(input: TotalsInput): TotalsOutput {
  const {
    subtotalCents,
    shippingMethod,
    shippingCostCents = 0,
    codFeeCents = 0,
    taxRate = 0,
  } = input;

  let shippingCents = 0;
  let codCents = 0;

  // Apply shipping cost for courier methods
  if (shippingMethod === 'COURIER' || shippingMethod === 'COURIER_COD') {
    shippingCents = shippingCostCents;
  }

  // Apply COD fee for COURIER_COD
  if (shippingMethod === 'COURIER_COD') {
    codCents = codFeeCents;
  }

  // Calculate tax
  const taxableCents = subtotalCents + shippingCents + codCents;
  const taxCents = Math.round(taxableCents * taxRate);

  // Calculate total
  const totalCents = taxableCents + taxCents;

  return {
    subtotalCents,
    shippingCents,
    codCents,
    taxCents,
    totalCents,
    subtotalEUR: fmtEUR(subtotalCents),
    shippingEUR: fmtEUR(shippingCents),
    codEUR: fmtEUR(codCents),
    taxEUR: fmtEUR(taxCents),
    totalEUR: fmtEUR(totalCents),
  };
}
