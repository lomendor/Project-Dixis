'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

interface OrderDetails {
  id: number;
  status: 'draft' | 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: string;
  subtotal: string;
  tax_amount: string;
  shipping_amount: string;
  payment_method: string;
  shipping_method: string;
  shipping_address?: string;
  city?: string;
  postal_code?: string;
  notes?: string;
  created_at: string;
  items: OrderItem[];
  statusTimeline: StatusTimelineItem[];
}

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: string;
  total_price: string;
  product_unit: string;
}

interface StatusTimelineItem {
  status: string;
  timestamp: string;
  description: string;
}

const statusLabels: Record<OrderDetails['status'], string> = {
  draft: 'Προσχέδιο',
  pending: 'Εκκρεμής',
  paid: 'Πληρωμένη',
  shipped: 'Αποστολή',
  delivered: 'Παραδόθηκε',
  cancelled: 'Ακυρώθηκε'
};

const statusColors: Record<OrderDetails['status'], string> = {
  draft: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = params.orderId as string;

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/account/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`
        }
      });

      if (response.status === 404) {
        setError('Η παραγγελία δεν βρέθηκε');
        return;
      }

      if (response.status === 403) {
        setError('Δεν έχετε δικαίωμα πρόσβασης σε αυτή την παραγγελία');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to load order details');
      }

      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error('Σφάλμα φόρτωσης παραγγελίας:', error);
      setError('Σφάλμα φόρτωσης λεπτομερειών παραγγελίας');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Φόρτωση παραγγελίας...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">{error}</h2>
          <div className="mt-6">
            <Link
              href="/account/orders"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Επιστροφή στις παραγγελίες
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link
            href="/account/orders"
            className="text-blue-600 hover:text-blue-800"
          >
            ← Επιστροφή στις παραγγελίες
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Παραγγελία #{order.id}
            </h1>
            <p className="mt-2 text-gray-600">
              {new Date(order.created_at).toLocaleDateString('el-GR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <span className={`inline-flex px-4 py-2 text-lg font-semibold rounded-full ${statusColors[order.status]}`}>
            {statusLabels[order.status]}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Προϊόντα</h2>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.product_name}</h3>
                      <p className="text-sm text-gray-500">
                        {item.quantity} {item.product_unit} × €{item.unit_price}
                      </p>
                    </div>
                    <div className="font-medium text-gray-900">
                      €{item.total_price}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          {order.statusTimeline && order.statusTimeline.length > 0 && (
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Ιστορικό Κατάστασης</h2>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-4">
                  {order.statusTimeline.map((item, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(item.timestamp).toLocaleDateString('el-GR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Σύνολο Παραγγελίας</h2>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Υποσύνολο</span>
                <span className="text-gray-900">€{order.subtotal}</span>
              </div>
              {order.tax_amount && parseFloat(order.tax_amount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">ΦΠΑ</span>
                  <span className="text-gray-900">€{order.tax_amount}</span>
                </div>
              )}
              {order.shipping_amount && parseFloat(order.shipping_amount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Μεταφορικά</span>
                  <span className="text-gray-900">€{order.shipping_amount}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-medium text-gray-900">Σύνολο</span>
                  <span className="text-lg font-bold text-gray-900">€{order.total_amount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment & Shipping Info */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Στοιχεία Παραγγελίας</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Τρόπος Πληρωμής</h3>
                <p className="mt-1 text-sm text-gray-600">{order.payment_method}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">Τρόπος Αποστολής</h3>
                <p className="mt-1 text-sm text-gray-600">{order.shipping_method}</p>
              </div>
              {order.shipping_address && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Διεύθυνση Αποστολής</h3>
                  <div className="mt-1 text-sm text-gray-600">
                    <p>{order.shipping_address}</p>
                    {order.city && order.postal_code && (
                      <p>{order.city}, {order.postal_code}</p>
                    )}
                  </div>
                </div>
              )}
              {order.notes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Σημειώσεις</h3>
                  <p className="mt-1 text-sm text-gray-600">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}