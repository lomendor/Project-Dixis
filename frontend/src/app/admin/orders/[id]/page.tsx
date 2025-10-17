'use client';
import React from 'react';

type Order = {
  id: string;
  createdAt: string;
  postalCode: string;
  method: string;
  weightGrams?: number;
  subtotal?: number;
  shippingCost?: number;
  codFee?: number | null;
  total: number;
  email?: string | null;
  paymentStatus?: string;
  paymentRef?: string | null;
};

export default function AdminOrderDetail({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const [data, setData] = React.useState<Order | null>(null);
  const [err, setErr] = React.useState('');

  React.useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/admin/orders/${id}`, { cache: 'no-store' });
        if (!r.ok) throw new Error(String(r.status));
        const j = await r.json();
        setData(j);
      } catch (e: any) {
        setErr('Δεν είναι διαθέσιμο ή δεν βρέθηκε.');
      }
    })();
  }, [id]);

  return (
    <main style={{ maxWidth: 960, margin: '40px auto', padding: 16 }}>
      <h2 style={{ margin: 0 }}>Admin · Order Detail</h2>
      <p style={{ color: '#6b7280', marginTop: 6 }}>
        Πλήρης σύνοψη παραγγελίας.
      </p>
      {err && <div className="mt-2 text-sm text-red-600">{err}</div>}
      {!data ? (
        <div className="mt-4 text-sm">Φόρτωση…</div>
      ) : (
        <div className="mt-4 text-sm">
          <div className="mb-2">
            Order ID:{' '}
            <strong data-testid="detail-order-id">{data.id}</strong>
          </div>
          <table className="text-sm">
            <tbody>
              <tr>
                <td className="pr-4">Ημ/νία</td>
                <td>{new Date(data.createdAt).toLocaleString()}</td>
              </tr>
              <tr>
                <td className="pr-4">Τ.Κ.</td>
                <td data-testid="detail-pc">{data.postalCode}</td>
              </tr>
              <tr>
                <td className="pr-4">Μέθοδος</td>
                <td>{data.method}</td>
              </tr>
              <tr>
                <td className="pr-4">Βάρος (g)</td>
                <td>{data.weightGrams ?? '-'}</td>
              </tr>
              <tr>
                <td className="pr-4">Subtotal</td>
                <td>{String(data.subtotal ?? '-')}</td>
              </tr>
              <tr>
                <td className="pr-4">Μεταφορικά</td>
                <td>{String(data.shippingCost ?? '-')}</td>
              </tr>
              {data.codFee != null && (
                <tr>
                  <td className="pr-4">Αντικαταβολή</td>
                  <td>{String(data.codFee)}</td>
                </tr>
              )}
              <tr>
                <td className="pr-4">Σύνολο</td>
                <td data-testid="detail-total">{String(data.total)}</td>
              </tr>
              <tr>
                <td className="pr-4">Email</td>
                <td>{data.email ?? '-'}</td>
              </tr>
              <tr>
                <td className="pr-4">Payment</td>
                <td>
                  {data.paymentStatus ?? 'PAID'}{' '}
                  {data.paymentRef ? `(${data.paymentRef})` : ''}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="mt-4">
            <a href="/admin/orders" className="underline">
              ← Πίσω στη λίστα
            </a>
          </div>
        </div>
      )}
    </main>
  );
}
