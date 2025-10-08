/**
 * Local stub for @dixis/contracts/shipping
 * Στόχος: να ικανοποιήσει imports μέχρι να φτιαχτεί το πραγματικό package.
 * Προσαρμόζεται από το usage (types/consts) του UI.
 */

import { z } from 'zod';

export type DeliveryMethod = 'HOME_DELIVERY' | 'LOCKER_DELIVERY' | 'STORE_PICKUP';
export type PaymentMethod = 'CARD' | 'COD';

export const DeliveryMethodSchema = z.enum(['HOME_DELIVERY', 'LOCKER_DELIVERY', 'STORE_PICKUP']);

export interface ShippingQuoteRequest {
  postalCode: string;
  city: string;
  weight?: number;
  orderValue?: number;
}

export interface ShippingQuoteResponse {
  method: DeliveryMethod;
  cost: number;
  estimatedDays: number;
  available: boolean;
  message?: string;
}

export interface LockerSearchResponse {
  lockers: Array<{
    id: string;
    name: string;
    address: string;
    city: string;
    postalCode: string;
    distance?: number;
  }>;
}

export const DEFAULT_DELIVERY_OPTIONS: Array<{
  code: DeliveryMethod;
  label: string;
  etaDays?: number;
  baseCost?: number;
}> = [
  { code: 'STORE_PICKUP', label: 'Παραλαβή από κατάστημα', etaDays: 0, baseCost: 0 },
  { code: 'HOME_DELIVERY', label: 'Παράδοση στο σπίτι', etaDays: 2, baseCost: 3.5 },
  { code: 'LOCKER_DELIVERY', label: 'Παράδοση σε locker', etaDays: 1, baseCost: 2.0 },
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
