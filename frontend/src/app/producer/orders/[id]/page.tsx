'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient, ProducerOrder } from '@/lib/api';

interface CommissionData {
  platform_fee: string;
  platform_fee_vat: string;
  producer_payout: string;
}
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatCurrency } from '@/env';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Σε Εκκρεμότητα',
  confirmed: 'Επιβεβαιωμένη',
  processing: 'Σε Επεξεργασία',
  shipped: 'Απεσταλμένη',
  delivered: 'Παραδομένη',
  cancelled: 'Ακυρωμένη',
};

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-teal-100 text-teal-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const validTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ['processing'],
  confirmed: ['processing'],
  processing: ['shipped'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

const nextStatusLabels: Record<OrderStatus, string> = {
  pending: 'Ξεκίνησε Επεξεργασία',
  confirmed: 'Ξεκίνησε Επεξεργασία',
  processing: 'Σημείωσε ως Απεσταλμένη',
  shipped: 'Σημείωσε ως Παραδομένη',
  delivered: '',
  cancelled: '',
};

type EmailStatus = 'idle' | 'sending' | 'sent' | 'failed' | 'skipped';

export default function ProducerOrderDetailsPage() {
  const params = useParams();
  const orderId = Number(params.id);

  const [order, setOrder] = useState<ProducerOrder | null>(null);
  const [commission, setCommission] = useState<CommissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [emailStatus, setEmailStatus] = useState<EmailStatus>('idle');

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProducerOrder(orderId);
      setOrder(response.order);
      // Pass COMM-ENGINE-ACTIVATE-01: Commission data from backend
      if (response.commission) {
        setCommission(response.commission);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Αποτυχία φόρτωσης παραγγελίας');
    } finally {
      setLoading(false);
    }
  };

  /**
   * ARCH-FIX-02: Simplified status update handler.
   * Email is now sent server-side by Laravel (unified email path).
   * No separate frontend email call needed — the backend response includes
   * `email_sent` flag to indicate if notification was queued.
   */
  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!order || updating) return;

    try {
      setUpdating(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await apiClient.updateProducerOrderStatus(
        orderId,
        newStatus as 'processing' | 'shipped' | 'delivered'
      );
      setOrder(response.order);

      // ARCH-FIX-02: Email is sent server-side now — check backend flag
      if (response.email_sent) {
        setEmailStatus('sent');
      } else {
        // Backend couldn't send (no email on file, or email service disabled)
        setEmailStatus('skipped');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Αποτυχία ενημέρωσης κατάστασης');
    } finally {
      setUpdating(false);
    }
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const next = validTransitions[currentStatus];
    return next.length > 0 ? next[0] : null;
  };

  /** Open print-friendly shipping label in a new window */
  const handlePrintLabel = () => {
    if (!order?.shipping_address) return;
    const addr = order.shipping_address;
    const items = order.orderItems
      .map((i) => `${i.quantity}× ${i.product_name || i.product?.name}`)
      .join('<br/>');
    const html = `<!DOCTYPE html>
<html lang="el"><head><meta charset="UTF-8"/>
<title>Ετικέτα Αποστολής #${order.id}</title>
<style>
  @page { size: A6 landscape; margin: 10mm; }
  body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; }
  .label { border: 2px solid #000; padding: 20px; max-width: 400px; }
  .header { font-size: 11px; color: #666; border-bottom: 1px solid #ccc; padding-bottom: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; }
  .recipient { font-size: 18px; font-weight: bold; margin-bottom: 8px; }
  .address { font-size: 15px; line-height: 1.6; margin-bottom: 12px; }
  .phone { font-size: 14px; margin-bottom: 12px; padding: 6px 0; border-top: 1px dashed #ccc; }
  .items { font-size: 11px; color: #555; border-top: 1px solid #ccc; padding-top: 8px; }
  @media print { body { padding: 0; } }
</style></head><body>
<div class="label">
  <div class="header">
    <span>DIXIS - Παραγγελία #${order.id}</span>
    <span>${new Date(order.created_at).toLocaleDateString('el-GR')}</span>
  </div>
  <div class="recipient">${addr.name || ''}</div>
  <div class="address">
    ${addr.line1 || ''}${addr.line2 ? '<br/>' + addr.line2 : ''}<br/>
    ${addr.city || ''} ${addr.postal_code || ''}
  </div>
  ${addr.phone ? `<div class="phone">Τηλ: ${addr.phone}</div>` : ''}
  <div class="items"><strong>Περιεχόμενα:</strong><br/>${items}</div>
</div>
<script>window.onload=()=>{window.print();}<\/script>
</body></html>`;
    const w = window.open('', '_blank', 'width=500,height=400');
    if (w) { w.document.write(html); w.document.close(); }
  };

  return (
      <div>
        <div className="max-w-4xl mx-auto">
          {/* Back Link */}
          <Link
            href="/producer/orders"
            className="inline-flex items-center text-sm text-neutral-600 hover:text-neutral-900 mb-6"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Πίσω στις Παραγγελίες
          </Link>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={loadOrder}
                className="bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg transition-colors"
              >
                Δοκιμάστε Ξανά
              </button>
            </div>
          ) : order ? (
            <div className="space-y-6">
              {/* Order Header */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-neutral-900">
                      Παραγγελία #{order.id}
                    </h1>
                    <p className="text-sm text-neutral-500 mt-1">
                      {new Date(order.created_at).toLocaleDateString('el-GR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span
                    className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full ${
                      statusColors[order.status]
                    }`}
                  >
                    {statusLabels[order.status]}
                  </span>
                </div>
              </div>

              {/* Status Update Section */}
              {getNextStatus(order.status) && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                    Ενημέρωση Κατάστασης
                  </h2>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() =>
                        handleStatusUpdate(getNextStatus(order.status)!)
                      }
                      disabled={updating}
                      className={`flex-1 sm:flex-none px-6 py-3 rounded-lg font-medium transition-colors ${
                        updating
                          ? 'bg-neutral-300 cursor-not-allowed'
                          : 'bg-primary hover:bg-primary-light text-white'
                      }`}
                    >
                      {updating ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin h-5 w-5 mr-2"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Ενημέρωση...
                        </span>
                      ) : (
                        nextStatusLabels[order.status]
                      )}
                    </button>
                    <p className="text-sm text-neutral-500">
                      Τρέχουσα: {statusLabels[order.status]} →{' '}
                      {statusLabels[getNextStatus(order.status)!]}
                    </p>
                  </div>
                </div>
              )}

              {/* Email Notification Status */}
              {emailStatus !== 'idle' && (
                <div className={`rounded-lg shadow-md p-4 flex items-center justify-between ${
                  emailStatus === 'sent' ? 'bg-green-50 border border-green-200' :
                  emailStatus === 'skipped' ? 'bg-yellow-50 border border-yellow-200' :
                  emailStatus === 'failed' ? 'bg-red-50 border border-red-200' :
                  'bg-blue-50 border border-blue-200'
                }`}>
                  <div className="flex items-center gap-3">
                    {emailStatus === 'sent' && (
                      <>
                        <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-green-800 font-medium">Email ειδοποίησης στάλθηκε</span>
                      </>
                    )}
                    {emailStatus === 'skipped' && (
                      <>
                        <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="text-yellow-800 font-medium">Email παραλείφθηκε (dev mode)</span>
                      </>
                    )}
                    {emailStatus === 'failed' && (
                      <>
                        <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="text-red-800 font-medium">Αποτυχία αποστολής email</span>
                      </>
                    )}
                  </div>
                  {/* ARCH-FIX-02: No retry button needed — emails are sent server-side via Laravel queue */}
                </div>
              )}

              {/* Customer Info + Shipping Address */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                  Πληροφορίες Πελάτη
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-neutral-500">Όνομα</p>
                    <p className="text-neutral-900">
                      {order.user?.name || 'Επισκέπτης'}
                    </p>
                  </div>
                  {(order.user?.email || order.shipping_address?.email) && (
                    <div>
                      <p className="text-sm text-neutral-500">Email</p>
                      <p className="text-neutral-900">
                        {order.user?.email || order.shipping_address?.email}
                      </p>
                    </div>
                  )}
                </div>

                {/* Shipping Address Section */}
                {order.shipping_address && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-amber-900">
                        Στοιχεία Αποστολής
                      </h3>
                      <button
                        onClick={handlePrintLabel}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-medium text-amber-800 hover:bg-amber-100 transition-colors print:hidden"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Εκτύπωση Ετικέτας
                      </button>
                    </div>
                    <div className="text-sm text-amber-800 space-y-1">
                      {order.shipping_address.name && (
                        <p>{order.shipping_address.name}</p>
                      )}
                      {order.shipping_address.line1 && (
                        <p>{order.shipping_address.line1}</p>
                      )}
                      {order.shipping_address.line2 && (
                        <p>{order.shipping_address.line2}</p>
                      )}
                      {(order.shipping_address.city || order.shipping_address.postal_code) && (
                        <p>
                          {order.shipping_address.city}{' '}
                          {order.shipping_address.postal_code}
                        </p>
                      )}
                      {order.shipping_address.phone && (
                        <p className="mt-1">
                          <span className="text-amber-700">Τηλ:</span>{' '}
                          {order.shipping_address.phone}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                  Προϊόντα ({order.orderItems.length})
                </h2>
                <div className="divide-y">
                  {order.orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="py-4 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium text-neutral-900">
                          {item.product_name || item.product?.name}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {item.quantity} × {formatCurrency(parseFloat(item.unit_price))}
                        </p>
                      </div>
                      <p className="font-semibold text-neutral-900">
                        {formatCurrency(parseFloat(item.total_price))}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="border-t pt-4 mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Υποσύνολο</span>
                    <span className="text-neutral-900">
                      {formatCurrency(parseFloat(order.subtotal))}
                    </span>
                  </div>
                  {parseFloat(order.shipping_cost) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Μεταφορικά</span>
                      <span className="text-neutral-900">
                        {formatCurrency(parseFloat(order.shipping_cost))}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Σύνολο</span>
                    <span className="text-green-600">
                      {formatCurrency(parseFloat(order.total))}
                    </span>
                  </div>

                  {/* Pass COMM-ENGINE-ACTIVATE-01: Commission breakdown for producer */}
                  {commission && (
                    <div className="mt-4 pt-4 border-t border-dashed border-neutral-300 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">Προμήθεια πλατφόρμας</span>
                        <span className="text-red-600">-{formatCurrency(parseFloat(commission.platform_fee))}</span>
                      </div>
                      {parseFloat(commission.platform_fee_vat) > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-neutral-400 ml-2">συμπ. ΦΠΑ</span>
                          <span className="text-neutral-400">{formatCurrency(parseFloat(commission.platform_fee_vat))}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold pt-2 border-t border-dashed border-neutral-300">
                        <span className="text-emerald-700">Καθαρό ποσό</span>
                        <span className="text-emerald-600">{formatCurrency(parseFloat(commission.producer_payout))}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
  );
}
