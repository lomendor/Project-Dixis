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
  const hydratedRef = React.useRef(false); // AG33: one-time hydration guard

  // Filter state
  const [q, setQ] = React.useState('');
  const [pc, setPc] = React.useState('');
  const [method, setMethod] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [ordNo, setOrdNo] = React.useState('');
  const ordNoRef = React.useRef<HTMLInputElement | null>(null); // AG36: ref for keyboard focus
  const [fromISO, setFromISO] = React.useState<string>('');
  const [toISO, setToISO] = React.useState<string>('');

  // Helper functions for quick date filters
  const iso = (d: Date) => d.toISOString();
  const startOfDay = (d: Date) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };
  const addDays = (d: Date, n: number) => {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
  };
  const setQuickRange = (days: number) => {
    const now = new Date();
    const from = days === 0 ? startOfDay(now) : addDays(now, -days);
    const to = addDays(startOfDay(now), 1); // exclusive end (tomorrow 00:00)
    setFromISO(iso(from));
    setToISO(iso(to));
  };

  // Pagination state
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);
  const [total, setTotal] = React.useState(0);

  // Summary state
  const [sumAmount, setSumAmount] = React.useState(0);
  const [sumErr, setSumErr] = React.useState('');

  // Sorting state
  const [sortKey, setSortKey] = React.useState<'createdAt' | 'total'>('createdAt');
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('desc');

  // AG33: Parse query string from current browser location
  function parseQSFromLocation() {
    if (typeof window === 'undefined') return new URLSearchParams('');
    return new URLSearchParams(window.location.search || '');
  }

  // Helper to build filter params (no pagination)
  const buildFilterParams = React.useCallback(() => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (pc) params.set('pc', pc);
    if (method) params.set('method', method);
    if (status) params.set('status', status);
    if (ordNo) params.set('ordNo', ordNo);
    if (fromISO) params.set('from', fromISO);
    if (toISO) params.set('to', toISO);
    return params;
  }, [q, pc, method, status, ordNo, fromISO, toISO]);

  const fetchOrders = React.useCallback(async () => {
    try {
      // Build query string
      const params = buildFilterParams();

      // Pagination params
      const skip = page * pageSize;
      params.set('skip', String(skip));
      params.set('take', String(pageSize));
      params.set('count', '1');

      // Sorting params
      params.set('sort', sortKey);
      params.set('dir', sortDir);

      const query = params.toString();
      const url = query ? `/api/admin/orders?${query}` : '/api/admin/orders';

      const r = await fetch(url, { cache: 'no-store' });
      if (!r.ok) throw new Error(String(r.status));
      const j = await r.json();

      // Handle both formats: array (old) or {items, total} (new with count=1)
      if (Array.isArray(j)) {
        setRows(j);
        setTotal(j.length);
      } else if (j.items && typeof j.total === 'number') {
        setRows(j.items);
        setTotal(j.total);
      } else {
        setRows([]);
        setTotal(0);
      }
      setErr('');
    } catch (e: any) {
      setErr('Δεν είναι διαθέσιμο (ίσως BASIC_AUTH=1 μόνο σε CI).');
    }
  }, [buildFilterParams, page, pageSize, sortKey, sortDir]);

  // AG33: Hydrate filters from URL (priority) or localStorage on first load
  React.useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    try {
      const sp = parseQSFromLocation();
      const hasQS = Array.from(sp.keys()).length > 0;
      let saved: any = null;

      // Try to load from localStorage
      try {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('dixis.adminOrders.filters');
          saved = stored ? JSON.parse(stored) : null;
        }
      } catch {}

      // Helper: pick from URL (priority) or localStorage fallback
      const pick = (key: string, def: any) => {
        if (hasQS && sp.has(key)) {
          return sp.get(key) ?? def;
        }
        return (saved && saved[key] !== undefined) ? saved[key] : def;
      };

      // Restore filter state
      setQ(String(pick('q', '') || ''));
      setPc(String(pick('pc', '') || ''));
      setMethod(String(pick('method', '') || ''));
      setStatus(String(pick('status', '') || ''));
      setOrdNo(String(pick('ordNo', '') || ''));
      setFromISO(String(pick('from', '') || ''));
      setToISO(String(pick('to', '') || ''));
      setSortKey(pick('sort', 'createdAt') as 'createdAt' | 'total');
      setSortDir(pick('dir', 'desc') as 'asc' | 'desc');

      // Restore pagination
      const ps = parseInt(String(pick('take', '') || String((saved && saved.pageSize) || ''))) || 0;
      if (ps) setPageSize(ps);

      const p = parseInt(String(pick('page', '') || '')) || 0;
      if (p > 0) setPage(p);
    } catch {}
  }, []);

  // AG36: Keyboard shortcuts
  React.useEffect(() => {
    function isTypingTarget(el: any) {
      return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
    }

    function onKey(e: KeyboardEvent) {
      const tgt = e.target as any;

      // '/' → focus Order No (unless already typing in an input)
      if (e.key === '/' && !isTypingTarget(tgt)) {
        e.preventDefault();
        ordNoRef?.current?.focus();
        return;
      }

      // 't' → Today range (unless typing in input)
      if ((e.key === 't' || e.key === 'T') && !isTypingTarget(tgt)) {
        e.preventDefault();
        try {
          setQuickRange(0);
          setPage(0);
        } catch {}
        return;
      }

      // '[' → prev page
      if (e.key === '[' && !isTypingTarget(tgt)) {
        e.preventDefault();
        try {
          setPage((p: number) => Math.max(0, p - 1));
        } catch {}
        return;
      }

      // ']' → next page
      if (e.key === ']' && !isTypingTarget(tgt)) {
        e.preventDefault();
        try {
          setPage((p: number) => p + 1);
        } catch {}
        return;
      }
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setPage, setQuickRange]);

  React.useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Fetch summary (independent of pagination)
  React.useEffect(() => {
    const fetchSummary = async () => {
      try {
        const params = buildFilterParams();
        const query = params.toString();
        const url = query ? `/api/admin/orders/summary?${query}` : '/api/admin/orders/summary';

        const r = await fetch(url, { cache: 'no-store' });
        if (!r.ok) {
          setSumErr('⚠️');
          return;
        }
        const j = await r.json();
        setSumAmount(Number(j.totalAmount ?? 0));
        setSumErr('');
      } catch {
        setSumErr('⚠️');
      }
    };
    fetchSummary();
  }, [buildFilterParams]);

  // AG33: Sync filters to URL and localStorage on change
  React.useEffect(() => {
    try {
      if (typeof window === 'undefined') return;

      // Build query string with all filters
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (pc) params.set('pc', pc);
      if (method) params.set('method', method);
      if (status) params.set('status', status);
      if (ordNo) params.set('ordNo', ordNo);
      if (fromISO) params.set('from', fromISO);
      if (toISO) params.set('to', toISO);
      params.set('sort', sortKey);
      params.set('dir', sortDir);
      params.set('take', String(pageSize));
      params.set('page', String(page));

      const base = '/admin/orders';
      const qs = params.toString();
      const url = qs ? `${base}?${qs}` : base;

      // Update URL without page reload
      window.history.replaceState(null, '', url);

      // Save to localStorage
      const payload = {
        q,
        pc,
        method,
        status,
        ordNo,
        from: fromISO,
        to: toISO,
        sort: sortKey,
        dir: sortDir,
        pageSize,
        page,
      };
      localStorage.setItem('dixis.adminOrders.filters', JSON.stringify(payload));
    } catch {}
  }, [q, pc, method, status, ordNo, fromISO, toISO, sortKey, sortDir, pageSize, page]);

  const buildExportUrl = () => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (pc) params.set('pc', pc);
    if (method) params.set('method', method);
    if (status) params.set('status', status);
    if (ordNo) params.set('ordNo', ordNo);
    if (fromISO) params.set('from', fromISO);
    if (toISO) params.set('to', toISO);
    params.set('sort', sortKey); // AG33: include sort
    params.set('dir', sortDir); // AG33: include dir
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

      {/* Quick Date Filters */}
      <div className="mt-4 mb-2 flex gap-2 text-xs">
        <button
          type="button"
          onClick={() => setQuickRange(0)}
          className="border px-2 h-7 rounded hover:bg-gray-100"
          data-testid="quick-range-today"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => setQuickRange(7)}
          className="border px-2 h-7 rounded hover:bg-gray-100"
          data-testid="quick-range-7d"
        >
          7d
        </button>
        <button
          type="button"
          onClick={() => setQuickRange(30)}
          className="border px-2 h-7 rounded hover:bg-gray-100"
          data-testid="quick-range-30d"
        >
          30d
        </button>
        <button
          type="button"
          onClick={() => {
            setFromISO('');
            setToISO('');
          }}
          className="border px-2 h-7 rounded hover:bg-gray-100"
          data-testid="quick-range-clear"
        >
          Clear Dates
        </button>
      </div>

      {/* Filter Controls */}
      <div
        className="mb-4 p-3 border rounded"
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
              placeholder="Order No (DX-YYYYMMDD-####)"
              ref={ordNoRef}
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
              setPage(0);
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

      {/* Summary Bar */}
      <div className="mt-2 text-sm text-gray-700" data-testid="orders-summary">
        Σύνοψη: {total.toLocaleString()} παραγγελίες · Σύνολο €{sumAmount.toFixed(2)}
        {sumErr && <span className="text-red-600"> {sumErr}</span>}
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th>Order #</th>
              <th>ID</th>
              <th>
                <button
                  onClick={() => {
                    if (sortKey === 'createdAt') {
                      setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
                    } else {
                      setSortKey('createdAt');
                      setSortDir('desc');
                    }
                    setPage(0);
                  }}
                  className="underline cursor-pointer"
                  data-testid="th-date"
                >
                  Ημ/νία {sortKey === 'createdAt' && (sortDir === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th>Τ.Κ.</th>
              <th>Μέθοδος</th>
              <th>
                <button
                  onClick={() => {
                    if (sortKey === 'total') {
                      setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
                    } else {
                      setSortKey('total');
                      setSortDir('desc');
                    }
                    setPage(0);
                  }}
                  className="underline cursor-pointer"
                  data-testid="th-total"
                >
                  Σύνολο {sortKey === 'total' && (sortDir === 'asc' ? '↑' : '↓')}
                </button>
              </th>
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
                <td className="pr-2" data-testid="cell-total">
                  €{typeof r.total === 'number'
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

      {/* Keyboard Shortcuts Hint */}
      <div className="text-xs text-neutral-500 mt-3" data-testid="kb-hints">
        Shortcuts: / focus · t Today · [ Prev · ] Next
      </div>

      {/* Pagination Controls */}
      <div className="mt-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium">Page Size:</label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(0);
            }}
            className="px-2 py-1 border rounded text-xs"
            data-testid="page-size"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>

        <div className="text-xs text-gray-600" data-testid="page-info">
          {total === 0
            ? 'No orders'
            : `${page * pageSize + 1}–${Math.min((page + 1) * pageSize, total)} of ${total} orders`}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            data-testid="pager-prev"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={(page + 1) * pageSize >= total}
            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            data-testid="pager-next"
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
}
