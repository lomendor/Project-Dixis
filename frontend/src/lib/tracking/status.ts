export type OrderStatus = 'PAID'|'PACKING'|'SHIPPED'|'DELIVERED'|'CANCELLED'

export const STATUS_ORDER: OrderStatus[] = ['PAID','PACKING','SHIPPED','DELIVERED']

export const EL_LABEL: Record<OrderStatus,string> = {
  PAID:'Πληρωμή',
  PACKING:'Συσκευασία',
  SHIPPED:'Απεστάλη',
  DELIVERED:'Παραδόθηκε',
  CANCELLED:'Ακυρώθηκε'
}

export function normalizeStatus(s?:string): OrderStatus {
  const u = String(s||'').toUpperCase()
  return (['PAID','PACKING','SHIPPED','DELIVERED','CANCELLED'] as string[]).includes(u) ? (u as OrderStatus) : 'PAID'
}

export function getStatusIndex(status: OrderStatus): number {
  return STATUS_ORDER.indexOf(status)
}
