/**
 * Local stub for @dixis/contracts/shipping
 * Στόχος: να ικανοποιήσει imports μέχρι να φτιαχτεί το πραγματικό package.
 * Προσαρμόζεται από το usage (types/consts) του UI.
 */

import { z } from 'zod';

// Canonical shipping method codes
export type ShippingMethod = 'PICKUP' | 'COURIER' | 'COURIER_COD';

// Legacy alias types for backward compatibility
export type DeliveryMethod = 'HOME' | 'LOCKER' | 'STORE_PICKUP';
export type PaymentMethod = 'CARD' | 'COD';

export const DeliveryMethodSchema = z.enum(['HOME', 'LOCKER', 'STORE_PICKUP']);
export const ShippingMethodSchema = z.enum(['PICKUP', 'COURIER', 'COURIER_COD']);

export interface ShippingQuoteRequest {
  items: Array<{
    product_id: number;
    qty: number;
  }>;
  postal_code: string;
  delivery_method: DeliveryMethod;
  payment_method?: PaymentMethod;
}

export interface ShippingQuoteResponse {
  data: {
    method: DeliveryMethod;
    cost_cents: number;
    estimated_delivery_days: number;
    available: boolean;
    message?: string;
    breakdown?: {
      locker_discount_cents?: number;
    };
  };
}

export type Locker = {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  provider?: string;
  distance?: number;
  operating_hours?: string;
  notes?: string;
};

export interface LockerSearchResponse {
  lockers: Locker[];
}

const LockerSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  city: z.string(),
  postalCode: z.string(),
  provider: z.string().optional(),
  distance: z.number().optional(),
  operating_hours: z.string().optional(),
  notes: z.string().optional(),
});

export const LockerSearchResponseSchema = z.object({
  lockers: z.array(LockerSchema),
});

// Ensure Locker type matches the schema
export type LockerFromSchema = z.infer<typeof LockerSchema>;

// Legacy delivery options (for backward compatibility)
export const DEFAULT_DELIVERY_OPTIONS: Array<{
  code: DeliveryMethod;
  label: string;
  etaDays?: number;
  baseCost?: number;
}> = [
  { code: 'STORE_PICKUP', label: 'Παραλαβή από κατάστημα', etaDays: 0, baseCost: 0 },
  { code: 'HOME', label: 'Παράδοση στο σπίτι', etaDays: 2, baseCost: 3.5 },
  { code: 'LOCKER', label: 'Παράδοση σε locker', etaDays: 1, baseCost: 2.0 },
];

// Canonical shipping options with COD fee
export const DEFAULT_OPTIONS: Array<{
  code: ShippingMethod;
  label: string;
  etaDays?: number;
  baseCost: number;
  codFee?: number;
}> = [
  { code: 'PICKUP', label: 'Παραλαβή από κατάστημα', etaDays: 0, baseCost: 0 },
  { code: 'COURIER', label: 'Παράδοση με κούριερ', etaDays: 2, baseCost: 3.5 },
  { code: 'COURIER_COD', label: 'Αντικαταβολή', etaDays: 2, baseCost: 3.5, codFee: 1.5 },
];

export function calculateShippingCost(
  method: DeliveryMethod | ShippingMethod,
  orderValue: number,
  freeShippingThreshold = 25
): number {
  const normalized = normalizeMethod(method as string);

  // PICKUP is always free
  if (normalized === 'PICKUP') return 0;

  // Free shipping over threshold (applies to COURIER and COURIER_COD)
  if (orderValue >= freeShippingThreshold) return 0;

  // Look up shipping option
  const option = DEFAULT_OPTIONS.find(o => o.code === normalized);
  if (!option) return 0;

  // Calculate total cost: base + COD fee (if applicable)
  const base = Number(option.baseCost || 0);
  const cod = normalized === 'COURIER_COD' ? Number(option.codFee || 0) : 0;

  return Number((base + cod).toFixed(2));
}

/**
 * Normalize shipping method aliases to canonical codes
 * Aliases: HOME, LOCKER, COURIER_HOME → COURIER
 *          STORE_PICKUP, PICK-UP, PICK_UP → PICKUP
 *          COD, CASH_ON_DELIVERY → COURIER_COD
 */
export function normalizeMethod(code?: string): ShippingMethod {
  const c = String(code || '').toUpperCase().trim();

  // Normalize aliases to canonical codes
  if (c === 'HOME' || c === 'LOCKER' || c === 'COURIER_HOME') return 'COURIER';
  if (c === 'STORE_PICKUP' || c === 'PICK-UP' || c === 'PICK_UP') return 'PICKUP';
  if (c === 'COD' || c === 'CASH_ON_DELIVERY') return 'COURIER_COD';

  // If already canonical, return as-is
  const known: readonly ShippingMethod[] = ['PICKUP', 'COURIER', 'COURIER_COD'];
  return known.includes(c as ShippingMethod) ? (c as ShippingMethod) : 'COURIER';
}
