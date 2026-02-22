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
import AuthGuard from '@/components/AuthGuard';
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

function PackingSlip({ order }: { order: ProducerOrder }) {
  return (
    <div className="hidden print:block p-8 max-w-[210mm] mx-auto text-sm text-black">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">dixis.gr</h1>
          <p className="text-xs text-neutral-600 mt-1">Δελτίο Αποστολής</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">#{order.id}</p>
          <p className="text-xs text-neutral-600">
            {new Date(order.created_at).toLocaleDateString('el-GR', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
          <p className="text-xs mt-1">
            {statusLabels[order.status]}
          </p>
        </div>
      </div>

      {/* Shipping Address */}
      {order.shipping_address && (
        <div className="mb-6 p-4 border border-neutral-300 rounded">
          <h2 className="font-bold mb-2 text-xs uppercase tracking-wider">Παραλήπτης</h2>
          <div className="space-y-0.5">
            {order.shipping_address.name && <p className="font-medium">{order.shipping_address.name}</p>}
            {order.shipping_address.line1 && <p>{order.shipping_address.line1}</p>}
            {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
            {(order.shipping_address.city || order.shipping_address.postal_code) && (
              <p>{order.shipping_address.city} {order.shipping_address.postal_code}</p>
            )}
            {order.shipping_address.phone && <p>Τηλ: {order.shipping_address.phone}</p>}
          </div>
        </div>
      )}

      {/* Items Table */}
      <table className="w-full border-collapse mb-6">
        <thead>
          <tr className="border-b-2 border-black">
            <th className="text-left py-2 font-bold">Προϊόν</th>
            <th className="text-center py-2 font-bold w-20">Ποσ.</th>
            <th className="text-right py-2 font-bold w-24">Τιμή</th>
            <th className="text-right py-2 font-bold w-24">Σύνολο</th>
          </tr>
        </thead>
        <tbody>
          {order.orderItems.map((item) => (
            <tr key={item.id} className="border-b border-neutral-300">
              <td className="py-2">{item.product_name || item.product?.name}</td>
              <td className="py-2 text-center">{item.quantity}</td>
              <td className="py-2 text-right">{formatCurrency(parseFloat(item.unit_price))}</td>
              <td className="py-2 text-right">{formatCurrency(parseFloat(item.total_price))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-60 space-y-1">
          <div className="flex justify-between">
            <span>Υποσύνολο:</span>
            <span>{formatCurrency(parseFloat(order.subtotal))}</span>
          </div>
          {parseFloat(order.shipping_cost) > 0 && (
            <div className="flex justify-between">
              <span>Μεταφορικά:</span>
              <span>{formatCurrency(parseFloat(order.shipping_cost))}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base border-t border-black pt-1">
            <span>Σύνολο:</span>
            <span>{formatCurrency(parseFloat(order.total))}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="mt-6 p-3 border border-neutral-300 rounded">
          <p className="text-xs font-bold uppercase tracking-wider mb-1">Σημειώσεις</p>
          <p>{order.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-neutral-300 text-xs text-neutral-500 text-center">
        dixis.gr — Ελληνικά τοπικά προϊόντα
      </div>
    </div>
  );
}

export default function ProducerOrderDetailsPage() {
  const params = useParams();
  const orderId = Number(params.id);

  const [order, setOrder] = useState<ProducerOrder | null>(null);
  const [commission, setCommission] = useState<CommissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [emailStatus, setEmailStatus] = useState<EmailStatus>('idle');
  const [lastEmailData, setLastEmailData] = useState<{
    status: 'processing' | 'shipped' | 'delivered';
    customerEmail: string;
    customerName: string;
    total: string;
  } | null>(null);

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
   * FIX-EMAIL-01: Get customer email from multiple sources.
   * The order.email field can be null — also check user.email
   * and shipping_address.email (where Stripe stores it).
   */
  const getCustomerEmail = (o: ProducerOrder): string | null => {
    return o.user?.email
      || o.shipping_address?.email
      || null;
  };

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!order || updating) return;

    try {
      setUpdating(true);
      const response = await apiClient.updateProducerOrderStatus(
        orderId,
        newStatus as 'processing' | 'shipped' | 'delivered'
      );
      setOrder(response.order);

      // FIX-EMAIL-01: Send email notification with data from Laravel API response
      const customerEmail = getCustomerEmail(order);
      if (customerEmail) {
        const emailData = {
          status: newStatus as 'processing' | 'shipped' | 'delivered',
          customerName: order.user?.name || order.shipping_address?.name || 'Πελάτη',
          customerEmail,
          total: order.total,
        };
        setLastEmailData(emailData);
        await sendEmailNotification(emailData);
      } else {
        // No email available — skip silently
        setEmailStatus('skipped');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Αποτυχία ενημέρωσης κατάστασης');
    } finally {
      setUpdating(false);
    }
  };

  const sendEmailNotification = async (data: {
    status: 'processing' | 'shipped' | 'delivered';
    customerEmail: string;
    customerName: string;
    total: string;
  }) => {
    setEmailStatus('sending');
    try {
      const res = await fetch(`/api/producer/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (result.success) {
        setEmailStatus(result.dryRun ? 'skipped' : 'sent');
      } else {
        setEmailStatus('failed');
      }
    } catch {
      setEmailStatus('failed');
    }
  };

  const handleRetryEmail = async () => {
    if (!lastEmailData) return;
    await sendEmailNotification(lastEmailData);
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const next = validTransitions[currentStatus];
    return next.length > 0 ? next[0] : null;
  };

  return (
    <AuthGuard requireAuth={true} requireRole="producer">
      {/* Packing slip — visible only when printing */}
      {order && <PackingSlip order={order} />}

      <div className="min-h-screen bg-neutral-50 print:hidden">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 transition-colors"
                      title="Εκτύπωση δελτίου αποστολής"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Εκτύπωση
                    </button>
                    <span
                      className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full ${
                        statusColors[order.status]
                      }`}
                    >
                      {statusLabels[order.status]}
                    </span>
                  </div>
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
                    {emailStatus === 'sending' && (
                      <>
                        <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="text-blue-800 font-medium">Αποστολή email...</span>
                      </>
                    )}
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
                  {emailStatus === 'failed' && lastEmailData && (
                    <button
                      onClick={handleRetryEmail}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Επανάληψη
                    </button>
                  )}
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
                    <h3 className="font-medium text-amber-900 mb-2">
                      Στοιχεία Αποστολής
                    </h3>
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
                          <span className="text-neutral-400 ml-2">incl. ΦΠΑ</span>
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
        </main>
      </div>
    </AuthGuard>
  );
}
