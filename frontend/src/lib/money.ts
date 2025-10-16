/**
 * Format a number as EUR currency
 * @param amount - The amount to format (in euros)
 * @returns Formatted string like "12,34 €"
 */
export function formatEUR(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return '0,00 €';
  return amount.toFixed(2).replace('.', ',') + ' €';
}
