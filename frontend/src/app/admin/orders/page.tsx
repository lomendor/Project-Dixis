'use client';
import React from 'react';
import { orderNumber } from '../../../lib/orderNumber';

type Row = {
  id: string;
  createdAt: string;
  postalCode: string;
  method: string;
  total: number;
  paymentStatus?: string;
  email?: string;
};

export default function AdminOrders() {
  const [rows, setRows] = React.useState<Row[]>([]);
  const [err, setErr] = React.useState<string>('');

  // Filter state
  const [q, setQ] = React.useState('');
  const [pc, setPc] = React.useState('');
  const [method, setMethod] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [ordNo, setOrdNo] = React.useState('');

  const fetchOrders = React.useCallback(async () => {
    try {
      // Build query string
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (pc) params.set('pc', pc);
      if (method) params.set('method', method);
      if (status) params.set('status', status);
      if (ordNo) params.set('ordNo', ordNo);

      const query = params.toString();
      const url = query ? `/api/admin/orders?${query}` : '/api/admin/orders';

      const r = await fetch(url, { cache: 'no-store' });
      if (!r.ok) throw new Error(String(r.status));
      const j = await r.json();
      setRows(Array.isArray(j) ? j : []);
      setErr('');
    } catch (e: any) {
      setErr('Δεν είναι διαθέσιμο (ίσως BASIC_AUTH=1 μόνο σε CI).');
    }
  }, [q, pc, method, status, ordNo]);

  React.useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const buildExportUrl = () => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (pc) params.set('pc', pc);
    if (method) params.set('method', method);
    if (status) params.set('status', status);
    if (ordNo) params.set('ordNo', ordNo);
    const query = params.toString();
    return query
      ? `/api/admin/orders/export?${query}`
      : '/api/admin/orders/export';
  };

  return (
    <main style={{ maxWidth: 960, margin: '40px auto', padding: 16 }}>
      <h2 style={{ margin: 0 }}>Admin · Orders</h2>
      <p style={{ color: '#6b7280', marginTop: 6 }}>
        Τελευταίες παραγγελίες (CI/DEV).
      </p>
      {err && <div className="mt-2 text-sm text-red-600">{err}</div>}

      {/* Filter Controls */}
      <div
        className="mt-4 mb-4 p-3 border rounded"
        style={{ backgroundColor: '#f9fafb' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <label className="block mb-1 text-xs font-medium">
              Αναζήτηση (ID ή Email)
            </label>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Αναζήτηση..."
              className="w-full px-2 py-1 border rounded"
              data-testid="filter-q"
            />
          </div>
          <div>
            <label className="block mb-1 text-xs font-medium">Τ.Κ.</label>
            <input
              type="text"
              value={pc}
              onChange={(e) => setPc(e.target.value)}
              placeholder="Ταχυδρομικός κώδικας"
              className="w-full px-2 py-1 border rounded"
              data-testid="filter-pc"
            />
          </div>
          <div>
            <label className="block mb-1 text-xs font-medium">Μέθοδος</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-2 py-1 border rounded"
              data-testid="filter-method"
            >
              <option value="">Όλες</option>
              <option value="COURIER">COURIER</option>
              <option value="PICKUP">PICKUP</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 text-xs font-medium">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-2 py-1 border rounded"
              data-testid="filter-status"
            >
              <option value="">Όλα</option>
              <option value="PAID">PAID</option>
              <option value="PENDING">PENDING</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 text-xs font-medium">
              Order No (DX-YYYYMMDD-####)
            </label>
            <input
              type="text"
              value={ordNo}
              onChange={(e) => setOrdNo(e.target.value)}
              placeholder="DX-20251017-A1B2"
              className="w-full px-2 py-1 border rounded"
              data-testid="filter-ordno"
            />
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={fetchOrders}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            data-testid="filter-apply"
          >
            Εφαρμογή Φίλτρων
          </button>
          <button
            onClick={() => {
              setQ('');
              setPc('');
              setMethod('');
              setStatus('');
              setOrdNo('');
            }}
            className="px-3 py-1 bg-gray-400 text-white text-sm rounded hover:bg-gray-500"
            data-testid="filter-clear"
          >
            Καθαρισμός
          </button>
          <a
            href={buildExportUrl()}
            download="orders.csv"
            className="ml-auto px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            data-testid="export-csv"
          >
            Export CSV
          </a>
        </div>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th>Order #</th>
              <th>ID</th>
              <th>Ημ/νία</th>
              <th>Τ.Κ.</th>
              <th>Μέθοδος</th>
              <th>Σύνολο</th>
              <th>Status</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="pr-2">
                  {orderNumber(r.id as any, r.createdAt as any)}
                </td>
                <td className="pr-2">
                  <a
                    href={`/admin/orders/${r.id}`}
                    className="underline"
                    data-testid="order-link"
                  >
                    {r.id.slice(0, 8)}
                  </a>
                </td>
                <td className="pr-2">
                  {new Date(r.createdAt).toLocaleString()}
                </td>
                <td className="pr-2">{r.postalCode}</td>
                <td className="pr-2">{r.method}</td>
                <td className="pr-2">
                  {typeof r.total === 'number'
                    ? r.total.toFixed(2)
                    : String(r.total)}
                </td>
                <td>{r.paymentStatus ?? 'PAID'}</td>
                <td className="pr-2">{r.email ?? '-'}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="text-neutral-600">
                  Καμία καταχώρηση.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
