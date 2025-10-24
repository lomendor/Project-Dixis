'use client';
import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export type OrdersFilters = {
  status?: string;
  q?: string;
  fromDate?: string;
  toDate?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
};

function parseIntOr(x: string | null, d: number): number | undefined {
  if (!x) return undefined;
  const n = Number.parseInt(x, 10);
  return Number.isFinite(n) ? n : d;
}

export function useOrdersFilters() {
  const router = useRouter();
  const sp = useSearchParams();

  const filters = React.useMemo<OrdersFilters>(() => ({
    status: sp.get('status') || undefined,
    q: sp.get('q') || undefined,
    fromDate: sp.get('fromDate') || undefined,
    toDate: sp.get('toDate') || undefined,
    sort: sp.get('sort') || undefined,
    page: parseIntOr(sp.get('page'), 1),
    pageSize: parseIntOr(sp.get('pageSize'), 10),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [sp?.toString()]);

  const paramString = React.useMemo(() => {
    const qs = new URLSearchParams();
    if (filters.status) qs.set('status', filters.status);
    if (filters.q) qs.set('q', filters.q);
    if (filters.fromDate) qs.set('fromDate', filters.fromDate);
    if (filters.toDate) qs.set('toDate', filters.toDate);
    if (filters.sort) qs.set('sort', filters.sort);
    if (filters.page && filters.page > 1) qs.set('page', String(filters.page));
    if (filters.pageSize && filters.pageSize !== 10) qs.set('pageSize', String(filters.pageSize));
    return qs.toString();
  }, [filters]);

  function urlWith(next: Partial<OrdersFilters>) {
    const u = new URL(window.location.href);
    const qs = u.searchParams;
    const merged: OrdersFilters = { ...filters, ...next };
    // normalize
    function setOrDel(k: string, v?: string | number) {
      if (v === undefined || v === null || v === '') qs.delete(k);
      else qs.set(k, String(v));
    }
    setOrDel('status', merged.status);
    setOrDel('q', merged.q);
    setOrDel('fromDate', merged.fromDate);
    setOrDel('toDate', merged.toDate);
    setOrDel('sort', merged.sort || '-createdAt');
    setOrDel('page', merged.page && merged.page > 1 ? merged.page : undefined);
    setOrDel('pageSize', merged.pageSize && merged.pageSize !== 10 ? merged.pageSize : undefined);
    u.search = qs.toString();
    return u.toString();
  }

  const setFilter = React.useCallback((k: keyof OrdersFilters, v?: string | number, opts?: { replace?: boolean }) => {
    const href = urlWith({ [k]: (v as any) });
    if (opts?.replace) router.replace(href);
    else router.push(href);
  }, [router, urlWith]);

  const clearFilter = React.useCallback((k: keyof OrdersFilters, opts?: { replace?: boolean }) => {
    const href = urlWith({ [k]: undefined as any });
    if (opts?.replace) router.replace(href);
    else router.push(href);
  }, [router, urlWith]);

  const clearAll = React.useCallback((opts?: { replace?: boolean }) => {
    const href = urlWith({ status: undefined, q: undefined, fromDate: undefined, toDate: undefined, page: 1 });
    if (opts?.replace) router.replace(href);
    else router.push(href);
  }, [router, urlWith]);

  return { filters, paramString, setFilter, clearFilter, clearAll };
}
