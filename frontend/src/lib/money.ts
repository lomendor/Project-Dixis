/**
 * Format a number as EUR currency
 * @param amount - The amount to format (in euros)
 * @returns Formatted string like "12,34 €"
 */
export function formatEUR(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return '0,00 €';
  return amount.toFixed(2).replace('.', ',') + ' €';
}

/**
 * Format cents to EUR currency string (Greek locale)
 * @param cents - The amount in cents (e.g., 1050 = €10.50)
 * @returns Formatted string like "10,50 €"
 */
export function formatCentsEUR(cents: number): string {
  return new Intl.NumberFormat('el-GR', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100)
}
