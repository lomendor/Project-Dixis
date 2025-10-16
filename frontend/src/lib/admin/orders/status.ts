export type OrderStatus = 'PAID'|'PACKING'|'SHIPPED'|'DELIVERED'|'CANCELLED'

export const STATUS_OPTIONS: OrderStatus[] = ['PAID','PACKING','SHIPPED','DELIVERED','CANCELLED']

export function label(s: OrderStatus): string {
  const L: Record<OrderStatus, string> = {
    PAID: 'Πληρωμένη',
    PACKING: 'Συσκευασία',
    SHIPPED: 'Απεστάλη',
    DELIVERED: 'Παραδόθηκε',
    CANCELLED: 'Ακυρώθηκε'
  }
  return L[s] || s
}
