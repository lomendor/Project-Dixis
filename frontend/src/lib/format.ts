export function formatCurrency(value: number, currency: string = 'EUR', locale = 'el-GR') {
  const v = Number.isFinite(value) ? Number(value) : 0;
  try { return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(v); }
  catch { return `${v.toFixed(2)} ${currency}`; }
}
