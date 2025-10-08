/**
 * Local stub for @dixis/contracts/shipping
 * Στόχος: να ικανοποιήσει imports μέχρι να φτιαχτεί το πραγματικό package.
 * Προσαρμόζεται από το usage (types/consts) του UI.
 */

import { z } from 'zod';

export type DeliveryMethod = 'HOME' | 'LOCKER' | 'STORE_PICKUP';
export type PaymentMethod = 'CARD' | 'COD';

export const DeliveryMethodSchema = z.enum(['HOME', 'LOCKER', 'STORE_PICKUP']);

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
  distance?: number;
};

export interface LockerSearchResponse {
  lockers: Locker[];
}

export const LockerSearchResponseSchema = z.object({
  lockers: z.array(z.object({
    id: z.string(),
    name: z.string(),
    address: z.string(),
    city: z.string(),
    postalCode: z.string(),
    distance: z.number().optional(),
  })),
});

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

export function calculateShippingCost(
  method: DeliveryMethod,
  orderValue: number,
  freeShippingThreshold = 25
): number {
  if (method === 'STORE_PICKUP') return 0;
  if (orderValue >= freeShippingThreshold) return 0;

  const option = DEFAULT_DELIVERY_OPTIONS.find(o => o.code === method);
  return option?.baseCost ?? 0;
}
