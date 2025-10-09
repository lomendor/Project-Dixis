'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

const STATUSES = ['', 'PAID', 'PACKING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function Filters({ current }: {
  current: { status?: string; q?: string; page: number; perPage: number }
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [status, setStatus] = useState(current.status || '');
  const [q, setQ] = useState(current.q || '');

  useEffect(() => {
    setStatus(current.status || '');
    setQ(current.q || '');
  }, [current.status, current.q]);

  function apply() {
    const params = new URLSearchParams(sp?.toString() || '');
    status ? params.set('status', status) : params.delete('status');
    q ? params.set('q', q) : params.delete('q');
    params.set('page', '1');
    router.push(`/admin/orders?${params.toString()}`);
  }

  function reset() {
    router.push('/admin/orders');
  }

  return (
    <div style={{ display: 'flex', gap: 8, margin: '16px 0', alignItems: 'center' }}>
      <select
        value={status}
        onChange={e => setStatus(e.target.value)}
        aria-label="Status filter"
        style={{ padding: '8px', borderRadius: 4, border: '1px solid #ddd' }}
      >
        <option value="">— Όλες οι Καταστάσεις —</option>
        {STATUSES.slice(1).map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Αναζήτηση (ID/τηλ/email)"
        style={{ padding: '8px', borderRadius: 4, border: '1px solid #ddd', width: 300 }}
      />
      <button
        onClick={apply}
        style={{ padding: '8px 16px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
      >
        Φίλτρο
      </button>
      <button
        onClick={reset}
        style={{ padding: '8px 16px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
      >
        Reset
      </button>
    </div>
  );
}
