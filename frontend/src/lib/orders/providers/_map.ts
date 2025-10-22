import type { Order as DtoOrder, OrderStatus } from './types';

const EURO = new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' });
const ALLOWED: ReadonlyArray<OrderStatus> = ['pending','paid','shipped','cancelled','refunded'];

export function normalizeStatus(s: string | null | undefined): OrderStatus {
  const v = (s ?? '').toLowerCase();
  return (ALLOWED as readonly string[]).includes(v) ? (v as OrderStatus) : 'pending';
}

export function toDto(row: any): DtoOrder {
  return {
    id: String(row.id),
    customer: String(row.buyerName ?? row.customer ?? '—'),
    total: EURO.format(typeof row.total === 'number' ? row.total : Number(row.total ?? 0)),
    status: normalizeStatus(row.status),
  };
}
