'use client';
import React from 'react';

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

  React.useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/admin/orders', { cache: 'no-store' });
        if (!r.ok) throw new Error(String(r.status));
        const j = await r.json();
        setRows(Array.isArray(j) ? j : []);
      } catch (e: any) {
        setErr('Δεν είναι διαθέσιμο (ίσως BASIC_AUTH=1 μόνο σε CI).');
      }
    })();
  }, []);

  return (
    <main style={{ maxWidth: 960, margin: '40px auto', padding: 16 }}>
      <h2 style={{ margin: 0 }}>Admin · Orders</h2>
      <p style={{ color: '#6b7280', marginTop: 6 }}>
        Τελευταίες παραγγελίες (CI/DEV).
      </p>
      {err && <div className="mt-2 text-sm text-red-600">{err}</div>}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
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
                <td className="pr-2">{r.id.slice(0, 8)}</td>
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
                <td colSpan={7} className="text-neutral-600">
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
