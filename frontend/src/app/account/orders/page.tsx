'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient, Order } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/contexts/ToastContext';
import { formatDateShort, formatStatus, safeMoney, safeText, formatShippingMethod, formatPaymentMethod } from '@/lib/orderUtils';

function OrdersPage(): React.JSX.Element {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Pass FIX-ORDERS-PRIVACY-01: Use authenticated endpoint to show only user's own orders
        // Previously used getPublicOrders() which returned ALL orders (security bug)
        apiClient.refreshToken(); // Ensure latest token is loaded
        const response = await apiClient.getOrders();
        setOrders(response.orders || []);
      } catch {
        showToast('error', 'Failed to load your orders. Please try again.');
        setOrders([]); // Explicitly set empty on error
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [showToast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="flex items-center justify-center min-h-96">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Ιστορικό Παραγγελιών</h1>
          <p className="text-neutral-600">Παρακολουθήστε και διαχειριστείτε τις παραγγελίες σας</p>
        </div>

        {orders.length === 0 ? (
          <div data-testid="empty-orders-message" className="text-center py-12">
            <div className="text-neutral-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Δεν έχετε παραγγελίες ακόμα</h3>
            <p className="text-neutral-500 mb-6">Όταν κάνετε την πρώτη σας αγορά, θα εμφανιστεί εδώ.</p>
            <Link
              href="/products"
              data-testid="browse-products-link"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Δείτε τα Προϊόντα
            </Link>
          </div>
        ) : (
          <div data-testid="orders-list" className="space-y-6">
            {orders.map((order) => {
              const statusConfig = formatStatus(order.status);
              const totalItems = (order.items || order.order_items || []).reduce((sum, item) => sum + item.quantity, 0);

              return (
                <div
                  key={order.id}
                  data-testid="order-card"
                  data-order-id={order.id}
                  className="bg-white rounded-lg shadow-sm border border-neutral-200 hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900">
                          Παραγγελία #{order.id}
                        </h3>
                        <p className="text-sm text-neutral-500">
                          Ημερομηνία: {formatDateShort(order.created_at)}
                        </p>
                      </div>
                      <span
                        data-testid="order-status"
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}
                      >
                        {statusConfig.text}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-neutral-500">Συνολικό Ποσό</p>
                        <p className="text-lg font-semibold text-neutral-900">€{safeMoney(order.total_amount)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-500">Προϊόντα</p>
                        <p className="text-lg font-semibold text-neutral-900">
                          {totalItems > 0 ? `${totalItems} ${totalItems === 1 ? 'προϊόν' : 'προϊόντα'}` : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-500">Τρόπος Πληρωμής</p>
                        <p className="text-lg font-semibold text-neutral-900">{formatPaymentMethod(order.payment_method)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                      <div className="text-sm text-neutral-500">
                        {order.shipping_method && (
                          <span>Αποστολή: {formatShippingMethod(order.shipping_method, order.shipping_method_label)}</span>
                        )}
                      </div>
                      <Link
                        href={`/account/orders/${order.id}`}
                        data-testid="view-order-details-link"
                        className="inline-flex items-center px-3 py-2 border border-neutral-300 shadow-sm text-sm leading-4 font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      >
                        Λεπτομέρειες
                        <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPageWithAuth(): React.JSX.Element {
  return (
    <AuthGuard requireAuth={true}>
      <OrdersPage />
    </AuthGuard>
  );
}