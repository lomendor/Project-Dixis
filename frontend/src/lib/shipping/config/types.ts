/**
 * Shipping Engine V2 Types
 */

export type Method = 'HOME' | 'PICKUP' | 'LOCKER' | 'COURIER' | 'COURIER_COD';
export type ZoneId = string; // e.g. 'ATHENS' | 'ISLANDS' | numeric strings

export interface RateRow {
  zone: string;
  weight_from_kg: string;
  weight_to_kg: string;
  delivery_method: string;
  base_rate: string;
  extra_kg_rate?: string;
}

export interface ZoneRow {
  prefix: string;
  zone_id: string;
}

export interface ItemDim {
  qty: number;
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
}

export interface QuoteInput {
  postalCode: string;
  method: Method;
  items: ItemDim[];
  subtotal: number;
  producerId?: string;
}

export interface Surcharge {
  code: string;
  label: string;
  amount: number;
}

export interface QuoteResult {
  shippingCost: number;
  codFee: number;
  surcharges: Surcharge[];
  ruleTrace: string[];
  chargeableKg: number;
  zone: ZoneId;
}
