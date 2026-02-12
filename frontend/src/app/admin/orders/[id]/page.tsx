'use client';
import React from 'react';
import { orderNumber } from '../../../../lib/orderNumber';
import { useToast } from '@/contexts/ToastContext';
import { OrderStatusQuickActions } from './OrderStatusQuickActions';
import { ShippingLabelManager } from '@/components/shipping';

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
  paymentMethod?: string | null;
  paymentRef?: string | null;
  status?: string;
};

export default function AdminOrderDetail({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const { showSuccess, showError } = useToast();
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
      <h2 style={{ margin: 0 }}>Διαχείριση · Παραγγελία</h2>
      <p style={{ color: '#6b7280', marginTop: 6 }}>
        Πλήρης σύνοψη παραγγελίας.
      </p>
      {err && <div className="mt-2 text-sm text-red-600">{err}</div>}
      {!data ? (
        <div className="mt-4 text-sm">Φόρτωση…</div>
      ) : (
        <div className="mt-4 text-sm">
          {/* PR-FIX-01: Wire orphaned OrderStatusQuickActions */}
          {data.status && (
            <OrderStatusQuickActions
              orderId={data.id}
              currentStatus={data.status}
              paymentMethod={data.paymentMethod ?? (data.codFee != null && Number(data.codFee) > 0 ? 'COD' : null)}
              paymentStatus={data.paymentStatus}
            />
          )}

          {/* ADMIN-SHIPPING-UI-01: Shipping Label Manager */}
          {data.status && ['PAID', 'PACKING'].includes(data.status.toUpperCase()) && (
            <div className="my-6 pb-6 border-b border-gray-200">
              <ShippingLabelManager
                orderId={data.id}
                className="mt-4"
              />
            </div>
          )}

          <div className="mb-2">
            Αρ. Παραγγελίας:{' '}
            <strong data-testid="detail-order-no">
              {orderNumber(data.id, data.createdAt)}
            </strong>
          </div>
          <div className="mb-2">
            ID Παραγγελίας:{' '}
            <strong data-testid="detail-order-id">{data.id}</strong>
          </div>
          <div className="mb-2">
            <a
              href={`/orders/lookup?ordNo=${orderNumber(data.id, data.createdAt)}`}
              className="text-blue-600 underline text-xs"
              data-testid="customer-view-link"
            >
              Προβολή πελάτη →
            </a>
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
                <td className="pr-4">Υποσύνολο</td>
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
              {data.status && (
                <tr>
                  <td className="pr-4">Κατάσταση</td>
                  <td data-testid="detail-status" className="font-medium">{data.status}</td>
                </tr>
              )}
              <tr>
                <td className="pr-4">Πληρωμή</td>
                <td>
                  {data.paymentStatus ?? 'PAID'}{' '}
                  {data.paymentRef ? `(${data.paymentRef})` : ''}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="mt-4">
            <button
              data-testid="resend-receipt"
              onClick={async ()=>{
                try {
                  const r = await fetch(`/api/admin/orders/${data?.id}/resend`, { method:'POST' });
                  if (r.ok) {
                    showSuccess('Το email στάλθηκε ξανά.');
                  } else {
                    showError('Αποτυχία αποστολής.');
                  }
                } catch {
                  showError('Σφάλμα αποστολής.');
                }
              }}
              className="border px-3 py-1 rounded"
            >Επαναποστολή απόδειξης</button>
          </div>
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
