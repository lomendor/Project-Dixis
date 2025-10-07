export const eur = new Intl.NumberFormat('el-GR', {
  style: 'currency',
  currency: 'EUR'
});

export function fmtPrice(n: number): string {
  return eur.format(n);
}

export function unitLabel(u: string): string {
  if (u === 'kg') return 'κιλό';
  if (u === 'pcs' || u === 'τεμ' || u === 'τεμ.') return 'τεμ.';
  return u || 'τεμ.';
}
