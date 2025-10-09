'use client';

import StatusBadge from './StatusBadge';

export default function OrdersTable({ rows, total, page, perPage }: {
  rows: any[];
  total: number;
  page: number;
  perPage: number;
}) {
  const pages = Math.max(1, Math.ceil((total || 0) / perPage));

  return (
    <div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd' }}>
            <th style={{ textAlign: 'left', padding: 8 }}>ID</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Ημ/νία</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Πελάτης</th>
            <th style={{ textAlign: 'right', padding: 8 }}>Ποσό</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Κατάσταση</th>
          </tr>
        </thead>
        <tbody>
          {(rows || []).length ? rows.map((r: any) => {
            const d = new Date(r.createdAt);
            const date = isNaN(d.getTime()) ? '' : d.toLocaleString('el-GR');
            const name = r.buyerName || '—';
            const phone = r.buyerPhone || '—';
            const orderTotal = (Number(r.total || 0)).toFixed(2);

            return (
              <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 8 }}>{r.id}</td>
                <td style={{ padding: 8 }}>{date}</td>
                <td style={{ padding: 8 }}>{name} ({phone})</td>
                <td style={{ textAlign: 'right', padding: 8 }}>€ {orderTotal}</td>
                <td style={{ padding: 8 }}><StatusBadge status={String(r.status || '')} /></td>
              </tr>
            );
          }) : (
            <tr>
              <td colSpan={5} style={{ padding: 16, textAlign: 'center', opacity: 0.7 }}>
                Δεν βρέθηκαν παραγγελίες.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div style={{ marginTop: 12, opacity: 0.7 }}>
        Σελίδα {page} / {pages}
      </div>
    </div>
  );
}
