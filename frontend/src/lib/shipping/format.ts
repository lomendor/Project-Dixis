import { calculateShippingCost, normalizeMethod, type ShippingMethod } from '@/contracts/shipping';

// Canonical labels for shipping methods (Greek-first)
const CANONICAL_LABELS: Record<ShippingMethod, string> = {
  PICKUP: 'Παραλαβή από κατάστημα',
  COURIER: 'Παράδοση με κούριερ',
  COURIER_COD: 'Αντικαταβολή'
};

/**
 * Convert shipping method code to Greek label
 * Automatically normalizes aliases to canonical codes
 */
export function labelFor(code?: string): string {
  const canonical = normalizeMethod(code);
  return CANONICAL_LABELS[canonical] || canonical;
}

/**
 * Calculate shipping cost for a given method and subtotal
 * Automatically normalizes aliases to canonical codes
 */
export function costFor(code: string | undefined, subtotal: number): number {
  const canonical = normalizeMethod(code);
  return calculateShippingCost(canonical, Number(subtotal || 0));
}
