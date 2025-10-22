'use client';
import React from 'react';
import type { Order, OrderStatus, SortArg } from '@/lib/orders/providers/types';

export default function AdminOrdersMain() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [count, setCount] = React.useState(0);
  const [err, setErr] = React.useState('');

  // Pagination state
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Filter state
  const [status, setStatus] = React.useState<OrderStatus | ''>('');

  // Sorting state
  const [sort, setSort] = React.useState<SortArg>('-createdAt');

  const fetchOrders = React.useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      params.set('sort', sort);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 501) {
          setErr('Provider not implemented (demo mode active)');
        } else {
          throw new Error(`HTTP ${res.status}`);
        }
        return;
      }

      const data = await res.json();
      setOrders(data.items || []);
      setCount(data.count || 0);
      setErr('');
    } catch (e: any) {
      setErr(e.message || 'Fetch error');
      setOrders([]);
      setCount(0);
    }
  }, [status, page, pageSize, sort]);

  React.useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const totalPages = Math.ceil(count / pageSize);

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const toggleSort = () => {
    if (sort === '-createdAt') {
      setSort('createdAt');
    } else if (sort === 'createdAt') {
      setSort('-total');
    } else if (sort === '-total') {
      setSort('total');
    } else {
      setSort('-createdAt');
    }
    setPage(1);
  };

  const sortLabel = () => {
    if (sort === '-createdAt') return 'Date ↓';
    if (sort === 'createdAt') return 'Date ↑';
    if (sort === '-total') return 'Total ↓';
    if (sort === 'total') return 'Total ↑';
    return 'Sort';
  };

  return (
    <main style={{ maxWidth: 800, margin: '40px auto', padding: 16 }}>
      <h2>Admin · Orders (AG79 Pagination)</h2>
      <p style={{ color: '#6b7280', marginTop: 6 }}>
        Orders with pagination & sorting
      </p>

      {err && (
        <div className="mt-2 text-sm text-red-600" data-testid="error-message">
          {err}
        </div>
      )}

      {/* Filters */}
      <div className="mt-4 mb-4 p-3 border rounded bg-gray-50">
        <div className="flex items-center gap-3 text-sm">
          <label className="font-medium">Status:</label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as OrderStatus | '');
              setPage(1);
            }}
            className="px-2 py-1 border rounded"
            data-testid="filter-status"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="shipped">Shipped</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>

          <label className="ml-4 font-medium">Page Size:</label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="px-2 py-1 border rounded"
            data-testid="page-size-select"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
          </select>

          <button
            type="button"
            onClick={toggleSort}
            className="ml-4 px-3 py-1 border rounded hover:bg-gray-100"
            data-testid="sort-toggle"
          >
            {sortLabel()}
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-2 text-sm text-gray-700" data-testid="results-count">
        {count === 0
          ? 'No orders'
          : `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, count)} of ${count} orders`}
      </div>

      {/* Orders Table */}
      <div className="border rounded overflow-auto">
        <table className="w-full text-sm" data-testid="orders-table">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2 border-b">ID</th>
              <th className="text-left p-2 border-b">Customer</th>
              <th className="text-left p-2 border-b">Total</th>
              <th className="text-left p-2 border-b">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && !err && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} className="border-b hover:bg-gray-50">
                <td className="p-2" data-testid="order-id">
                  {o.id}
                </td>
                <td className="p-2" data-testid="order-customer">
                  {o.customer}
                </td>
                <td className="p-2" data-testid="order-total">
                  {o.total}
                </td>
                <td className="p-2" data-testid="order-status">
                  <span className={`px-2 py-1 rounded text-xs ${
                    o.status === 'paid' ? 'bg-green-100 text-green-800' :
                    o.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    o.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    o.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600" data-testid="page-info">
          Page {page} of {totalPages || 1}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePrev}
            disabled={page <= 1}
            className="px-4 py-2 border rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            data-testid="page-prev"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={page >= totalPages}
            className="px-4 py-2 border rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            data-testid="page-next"
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
}
