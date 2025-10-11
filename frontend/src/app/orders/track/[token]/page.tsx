'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface TrackingData {
  id: string;
  status: string;
  total: number;
  shippingMethod: string | null;
  computedShipping: number;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    title: string;
    qty: number;
    price: number;
    status: string;
  }>;
}

// Greek status labels
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Εκκρεμής',
  CONFIRMED: 'Επιβεβαιωμένη',
  SHIPPED: 'Σε αποστολή',
  DELIVERED: 'Παραδόθηκε',
  CANCELLED: 'Ακυρώθηκε',
  pending: 'Εκκρεμής',
  confirmed: 'Επιβεβαιωμένη',
  shipped: 'Σε αποστολή',
  delivered: 'Παραδόθηκε',
  cancelled: 'Ακυρώθηκε'
};

// Greek shipping method labels
const SHIPPING_LABELS: Record<string, string> = {
  PICKUP: 'Παραλαβή από κατάστημα',
  COURIER: 'Παράδοση με κούριερ',
  COURIER_COD: 'Αντικαταβολή',
  HOME: 'Παράδοση στο σπίτι',
  LOCKER: 'Παράδοση σε locker',
  STORE_PICKUP: 'Παραλαβή από κατάστημα'
};

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [data, setData] = useState<TrackingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/orders/track/${token}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Σφάλμα ανάκτησης παραγγελίας');
        }

        const trackingData = await response.json();
        setData(trackingData);
        setError(null);
      } catch (err) {
        console.error('[tracking] error:', err);
        setError(err instanceof Error ? err.message : 'Σφάλμα ανάκτησης παραγγελίας');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchTracking();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Φόρτωση παραγγελίας...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Σφάλμα</h2>
            <p className="text-gray-600 mb-4" data-testid="tracking-error">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Επιστροφή στην αρχική
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const statusLabel = STATUS_LABELS[data.status] || data.status;
  const shippingLabel = data.shippingMethod ? (SHIPPING_LABELS[data.shippingMethod] || data.shippingMethod) : 'N/A';
  const subtotal = data.total - data.computedShipping;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-green-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Παρακολούθηση Παραγγελίας</h1>
            <p className="text-green-100 text-sm mt-1">Κωδικός: {data.id}</p>
          </div>

          {/* Status */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Κατάσταση:</span>
              <span
                className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800"
                data-testid="tracking-status"
              >
                {statusLabel}
              </span>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Μεταφορικά</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Μέθοδος:</span>
                <span className="font-medium" data-testid="tracking-shipping-method">
                  {shippingLabel}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Κόστος:</span>
                <span className="font-medium" data-testid="tracking-shipping-cost">
                  €{data.computedShipping.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Προϊόντα</h3>
            <div className="space-y-3">
              {data.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start" data-testid="tracking-item">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500">
                      Ποσότητα: {item.qty} × €{item.price.toFixed(2)}
                    </p>
                  </div>
                  <span className="font-medium text-gray-900">
                    €{(item.qty * item.price).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="px-6 py-4 bg-gray-50">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Υποσύνολο:</span>
                <span>€{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Μεταφορικά:</span>
                <span>€{data.computedShipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Σύνολο:</span>
                <span data-testid="tracking-total">€{data.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="px-6 py-4 bg-gray-100 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Δημιουργία: {new Date(data.createdAt).toLocaleString('el-GR')}</span>
              <span>Ενημέρωση: {new Date(data.updatedAt).toLocaleString('el-GR')}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Επιστροφή στην αρχική
          </button>
        </div>
      </div>
    </div>
  );
}
