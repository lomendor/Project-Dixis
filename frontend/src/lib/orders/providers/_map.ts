import type { Order as DtoOrder, OrderStatus, SortArg, ListParams } from './types';

const EURO = new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' });
const ALLOWED: ReadonlyArray<OrderStatus> = ['pending','paid','shipped','cancelled','refunded'];
const SORT_DEFAULT: SortArg = '-createdAt';

export function normalizeStatus(s: string | null | undefined): OrderStatus {
  const v = (s ?? '').toLowerCase();
  return (ALLOWED as readonly string[]).includes(v) ? (v as OrderStatus) : 'pending';
}

export function parseSort(sort?: SortArg) {
  const key = (sort || SORT_DEFAULT).startsWith('-') ? (sort || SORT_DEFAULT).slice(1) : (sort || SORT_DEFAULT);
  const dir = (sort || SORT_DEFAULT).startsWith('-') ? 'desc' : 'asc';
  if (key !== 'createdAt' && key !== 'total') return { key: 'createdAt' as const, dir: 'desc' as const };
  return { key: key as 'createdAt'|'total', dir: dir as 'asc'|'desc' };
}

export function toDto(row: any): DtoOrder {
  const totalNum = typeof row.total === 'number' ? row.total : Number(row.total ?? 0);
  return {
    id: String(row.id),
    customer: String(row.buyerName ?? row.customer ?? '—'),
    total: EURO.format(totalNum),
    status: normalizeStatus(row.status),
  };
}

export function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

export function parseDateRange(p?: Pick<ListParams,'fromDate'|'toDate'>) {
  const r: { gte?: Date; lte?: Date } = {};
  if (p?.fromDate) {
    const d = new Date(p.fromDate + 'T00:00:00Z');
    if (!isNaN(d.getTime())) r.gte = d;
  }
  if (p?.toDate) {
    const d = new Date(p.toDate + 'T23:59:59Z');
    if (!isNaN(d.getTime())) r.lte = d;
  }
  return r;
}
