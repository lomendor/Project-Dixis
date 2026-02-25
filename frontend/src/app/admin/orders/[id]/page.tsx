'use client';
import React from 'react';
import { orderNumber } from '../../../../lib/orderNumber';
import { useToast } from '@/contexts/ToastContext';
import { OrderStatusQuickActions } from './OrderStatusQuickActions';
import { ShippingLabelManager } from '@/components/shipping';

interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface ShippingAddress {
  name?: string;
  phone?: string;
  address?: string;
  line1?: string;
  line2?: string;
  city?: string;
  postal_code?: string;
  notes?: string;
}

type Order = {
  id: string;
  laravelId?: number;
  createdAt: string;
  postalCode: string;
  method: string;
  weightGrams?: number;
  subtotal?: number;
  shippingCost?: number;
  codFee?: number | null;
  total: number;
  totalRaw?: number;
  email?: string | null;
  customer?: string | null;
  paymentStatus?: string;
  paymentMethod?: string | null;
  paymentRef?: string | null;
  status?: string;
  items?: OrderItem[];
  shippingAddress?: ShippingAddress | null;
};

const fmt = new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' });

export default function AdminOrderDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  const { showSuccess, showError } = useToast();
  const [data, setData] = React.useState<Order | null>(null);
  const [err, setErr] = React.useState('');
  const [refunding, setRefunding] = React.useState(false);
  const [refundAmount, setRefundAmount] = React.useState('');
  const [refundReason, setRefundReason] = React.useState('');
  const [showRefundForm, setShowRefundForm] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/admin/orders/${id}`, { cache: 'no-store' });
        if (!r.ok) throw new Error(String(r.status));
        const j = await r.json();
        setData(j);
      } catch {
        setErr('Δεν είναι διαθέσιμο ή δεν βρέθηκε.');
      }
    })();
  }, [id]);

  const handleRefund = async () => {
    if (!data) return;
    setRefunding(true);
    try {
      const body: Record<string, unknown> = {};
      if (refundReason) body.reason = refundReason;
      if (refundAmount) body.amount_cents = Math.round(parseFloat(refundAmount) * 100);

      const r = await fetch(`/api/admin/orders/${id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await r.json();

      if (r.ok && result.success !== false) {
        showSuccess(`Επιστροφή ${result.amount_euros ? fmt.format(result.amount_euros) : ''} ολοκληρώθηκε`);
        setShowRefundForm(false);
        window.location.reload();
      } else {
        showError(result.error_message || result.error || 'Αποτυχία επιστροφής');
      }
    } catch {
      showError('Σφάλμα κατά την επιστροφή χρημάτων');
    } finally {
      setRefunding(false);
    }
  };

  const isStripe = data?.paymentMethod?.toLowerCase() === 'stripe' || data?.paymentMethod?.toLowerCase() === 'card';
  const isCod = (data?.paymentMethod || '').toUpperCase() === 'COD';
  const isPaid = (data?.paymentStatus || '').toLowerCase() === 'completed';
  const addr = data?.shippingAddress;

  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <h2 className="text-xl font-bold mb-1">Διαχείριση · Παραγγελία</h2>
      <p className="text-neutral-500 text-sm mb-6">Πλήρης σύνοψη παραγγελίας.</p>

      {err && <div className="mt-2 text-sm text-red-600">{err}</div>}

      {!data ? (
        <div className="mt-4 text-sm text-neutral-500">Φόρτωση…</div>
      ) : (
        <div className="space-y-6">
          {/* Quick Actions + Admin Override */}
          <OrderStatusQuickActions
            orderId={data.id}
            currentStatus={data.status || 'PENDING'}
            paymentMethod={data.paymentMethod ?? (data.codFee != null && Number(data.codFee) > 0 ? 'COD' : null)}
            paymentStatus={data.paymentStatus}
          />

          {/* Shipping Label Manager */}
          {data.status && ['PAID', 'PACKING'].includes(data.status.toUpperCase()) && (
            <div className="pb-6 border-b border-neutral-200">
              <ShippingLabelManager orderId={data.id} className="mt-4" />
            </div>
          )}

          {/* Order Info Card */}
          <div className="bg-white border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-neutral-500">Αρ. Παραγγελίας</div>
                <div className="text-lg font-bold font-mono" data-testid="detail-order-no">
                  {orderNumber(data.id, data.createdAt)}
                </div>
              </div>
              {data.status && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-neutral-100" data-testid="detail-status">
                  {data.status}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-neutral-500">Ημ/νία:</span> {new Date(data.createdAt).toLocaleString('el-GR')}</div>
              <div><span className="text-neutral-500">Email:</span> {data.email ?? '-'}</div>
              <div><span className="text-neutral-500">Πληρωμή:</span> {data.paymentMethod ?? '-'} · {data.paymentStatus ?? 'PAID'}</div>
              {data.paymentRef && <div><span className="text-neutral-500">Ref:</span> {data.paymentRef}</div>}
            </div>
          </div>

          {/* Shipping Address Card (T1-02) */}
          {addr && (
            <div className="bg-white border rounded-xl p-6" data-testid="shipping-address">
              <h3 className="font-semibold mb-3">Διεύθυνση Αποστολής</h3>
              <div className="text-sm space-y-1">
                {addr.name && <div className="font-medium">{addr.name}</div>}
                {(addr.address || addr.line1) && <div>{addr.address || addr.line1}</div>}
                {addr.line2 && <div>{addr.line2}</div>}
                {(addr.city || addr.postal_code) && (
                  <div>{[addr.postal_code, addr.city].filter(Boolean).join(', ')}</div>
                )}
                {addr.phone && <div>Τηλ: {addr.phone}</div>}
                {addr.notes && <div className="text-neutral-500 mt-2">Σημειώσεις: {addr.notes}</div>}
              </div>
            </div>
          )}

          {/* Order Items Card (T1-01) */}
          {data.items && data.items.length > 0 && (
            <div className="bg-white border rounded-xl p-6" data-testid="order-items">
              <h3 className="font-semibold mb-3">Προϊόντα Παραγγελίας</h3>
              <div className="space-y-2">
                {data.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm py-1 border-b border-neutral-100 last:border-0">
                    <div>
                      <span className="font-medium">{item.productName}</span>
                      <span className="text-neutral-500 ml-2">x{item.quantity}</span>
                    </div>
                    <span>{fmt.format(item.totalPrice)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t mt-3 pt-3 space-y-1 text-sm">
                {data.subtotal != null && (
                  <div className="flex justify-between"><span>Υποσύνολο</span><span>{fmt.format(data.subtotal)}</span></div>
                )}
                {data.shippingCost != null && data.shippingCost > 0 && (
                  <div className="flex justify-between"><span>Μεταφορικά</span><span>{fmt.format(data.shippingCost)}</span></div>
                )}
                {data.codFee != null && Number(data.codFee) > 0 && (
                  <div className="flex justify-between"><span>Αντικαταβολή</span><span>{fmt.format(Number(data.codFee))}</span></div>
                )}
                <div className="flex justify-between font-bold pt-1 border-t">
                  <span>Σύνολο</span>
                  <span data-testid="detail-total">{typeof data.total === 'string' ? data.total : fmt.format(data.totalRaw ?? data.total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Refund Section (T0-03) */}
          <div className="bg-white border rounded-xl p-6" data-testid="refund-section">
            <h3 className="font-semibold mb-3">Επιστροφή Χρημάτων</h3>

            {isCod && (
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 mb-3 text-sm" data-testid="cod-refund-notice">
                <svg className="w-4 h-4 mt-0.5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-amber-800">
                  <p className="font-medium">Παραγγελία με αντικαταβολή</p>
                  <p className="mt-1">Η επιστροφή χρημάτων δεν γίνεται αυτόματα. Θα πρέπει να κάνετε τραπεζική μεταφορά στον πελάτη χειροκίνητα.</p>
                </div>
              </div>
            )}

            {isStripe && isPaid && !showRefundForm && (
              <button
                onClick={() => setShowRefundForm(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                data-testid="refund-trigger"
              >
                Επιστροφή μέσω Stripe
              </button>
            )}

            {isStripe && !isPaid && (
              <p className="text-sm text-neutral-500">Η πληρωμή δεν έχει ολοκληρωθεί — δεν είναι δυνατή η επιστροφή.</p>
            )}

            {!isStripe && !isCod && (
              <p className="text-sm text-neutral-500">Μέθοδος πληρωμής: {data.paymentMethod ?? 'N/A'}</p>
            )}

            {showRefundForm && (
              <div className="mt-3 space-y-3 p-4 bg-red-50 border border-red-200 rounded-lg" data-testid="refund-form">
                <div>
                  <label className="block text-sm font-medium mb-1">Ποσό (€) — κενό = πλήρης επιστροφή</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={data.totalRaw ?? 9999}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    placeholder={`Μέγιστο: ${fmt.format(data.totalRaw ?? 0)}`}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Αιτία (προαιρετικό)</label>
                  <input
                    type="text"
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="π.χ. Κατεστραμμένο προϊόν"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleRefund}
                    disabled={refunding}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    {refunding ? 'Επεξεργασία...' : 'Επιβεβαίωση Επιστροφής'}
                  </button>
                  <button
                    onClick={() => setShowRefundForm(false)}
                    className="px-4 py-2 border rounded-lg text-sm"
                  >
                    Ακύρωση
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-4 pt-2">
            <button
              data-testid="resend-receipt"
              onClick={async () => {
                try {
                  const r = await fetch(`/api/admin/orders/${data?.id}/resend`, { method: 'POST' });
                  if (r.ok) showSuccess('Το email στάλθηκε ξανά.');
                  else showError('Αποτυχία αποστολής.');
                } catch {
                  showError('Σφάλμα αποστολής.');
                }
              }}
              className="border px-4 py-2 rounded-lg text-sm hover:bg-neutral-50"
            >
              Επαναποστολή απόδειξης
            </button>
            <a href="/admin/orders" className="text-sm text-primary hover:underline py-2">
              ← Πίσω στη λίστα
            </a>
          </div>
        </div>
      )}
    </main>
  );
}
