// Money types with cents-first convention
// Pass 174R.4 — Money Contract Normalization

export type Cents = number & { readonly __brand: 'Cents' };

/**
 * Convert number to cents (with proper rounding)
 */
export const toCents = (n: number): Cents => Math.round((Number(n||0)+Number.EPSILON) * 100) as Cents;

/**
 * Convert cents back to decimal number
 */
export const fromCents = (c: Cents): number => Number(c)/100;

/**
 * Format number as EUR with Greek locale
 */
export const fmtEUR = (n: number) => new Intl.NumberFormat('el-GR',{style:'currency',currency:'EUR'}).format(n);
