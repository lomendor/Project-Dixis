import { DEFAULT_DELIVERY_OPTIONS, calculateShippingCost, type DeliveryMethod } from '@/contracts/shipping';

export function labelFor(code?: string): string {
  const c = String(code || 'HOME').toUpperCase() as DeliveryMethod;
  const opt = DEFAULT_DELIVERY_OPTIONS.find(o => o.code === c);
  return opt?.label || c;
}

export function costFor(code: string | undefined, subtotal: number): number {
  const c = String(code || 'HOME').toUpperCase() as DeliveryMethod;
  return calculateShippingCost(c, Number(subtotal || 0));
}
