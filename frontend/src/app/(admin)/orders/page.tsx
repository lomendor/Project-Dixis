'use client';
import { useEffect, useState } from 'react';

type Item = {
  id: string;
  createdAt: string;
  buyerName?: string;
  buyerPhone?: string;
  status: string;
  total?: number;
};

export default function AdminOrders() {
  const [items, setItems] = useState<Item[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<string>('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(20);

  async function fetchList(pg = 1) {
    const params = new URLSearchParams({ page: String(pg), limit: String(limit) });
    if (q) params.set('q', q);
    if (status) params.set('status', status);
    if (from) params.set('from', from);
    if (to) params.set('to', to);

    const r = await fetch(`/api/admin/orders?${params.toString()}`, { cache: 'no-store' });
    const j = await r.json();

    setItems(j.items || []);
    setTotal(j.total || 0);
    setPage(j.page || 1);
    setLimit(j.limit || 20);
  }

  useEffect(() => {
    fetchList(1);
  }, []);

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div style={{ maxWidth: 980, margin: '24px auto', padding: '0 12px' }}>
      <h1>Admin — Παραγγελίες</h1>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <input
          placeholder="Αναζήτηση (ID/Τηλέφωνο)"
          value={q}
          onChange={e => setQ(e.target.value)}
          style={{ padding: 8, flex: '1 1 200px' }}
        />
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          style={{ padding: 8 }}
        >
          <option value="">Κατάσταση (όλες)</option>
          {['PENDING', 'PAID', 'PACKING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input
          type="date"
          value={from}
          onChange={e => setFrom(e.target.value)}
          style={{ padding: 8 }}
        />
        <input
          type="date"
          value={to}
          onChange={e => setTo(e.target.value)}
          style={{ padding: 8 }}
        />
        <button onClick={() => fetchList(1)} style={{ padding: '8px 16px' }}>
          Αναζήτηση
        </button>
        <a
          href={`/api/admin/orders/export.csv?${new URLSearchParams({ status, from, to }).toString()}`}
          target="_blank"
          rel="noreferrer"
          style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', textDecoration: 'none', borderRadius: 4 }}
        >
          Export CSV
        </a>
      </div>

      <table width="100%" cellPadding={6} style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
            <th>ID</th>
            <th>Ημ/νία</th>
            <th>Πελάτης</th>
            <th>Τηλέφωνο</th>
            <th>Κατάσταση</th>
            <th style={{ textAlign: 'right' }}>Σύνολο</th>
          </tr>
        </thead>
        <tbody>
          {items.map(it => (
            <tr key={it.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td><a href={`/order/${it.id}`}>{it.id}</a></td>
              <td>{new Date(it.createdAt).toLocaleString('el-GR')}</td>
              <td>{it.buyerName || '—'}</td>
              <td>{it.buyerPhone || '—'}</td>
              <td>{it.status}</td>
              <td style={{ textAlign: 'right' }}>€ {(Number(it.total || 0)).toFixed(2)}</td>
            </tr>
          ))}
          {!items.length && (
            <tr>
              <td colSpan={6} style={{ padding: 12, color: '#666', textAlign: 'center' }}>
                Δεν βρέθηκαν παραγγελίες.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
        <span>Σύνολο: {total}</span>
        <div>
          <button disabled={page <= 1} onClick={() => fetchList(page - 1)} style={{ padding: '4px 8px', marginRight: 8 }}>
            « Πίσω
          </button>
          <span style={{ margin: '0 8px' }}>Σελίδα {page}/{pages}</span>
          <button disabled={page >= pages} onClick={() => fetchList(page + 1)} style={{ padding: '4px 8px', marginLeft: 8 }}>
            Μπροστά »
          </button>
        </div>
      </div>
    </div>
  );
}
