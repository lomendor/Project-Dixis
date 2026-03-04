'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient, Order } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/contexts/ToastContext';
import { formatDateShort, formatStatus, safeMoney } from '@/lib/orderUtils';

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
        showToast('error', 'Αποτυχία φόρτωσης παραγγελιών. Δοκιμάστε ξανά.');
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
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Ιστορικό Παραγγελιών</h1>
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
          <div data-testid="orders-list" className="space-y-3">
            {orders.map((order) => {
              const statusConfig = formatStatus(order.status);
              const orderItems = order.items || order.order_items || [];
              const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);
              // Build product names preview (first 2 + "και X ακόμα")
              const productNames = orderItems.map(item => item.product_name).filter(Boolean);
              const previewNames = productNames.slice(0, 2);
              const remaining = productNames.length - previewNames.length;

              return (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  data-testid="order-card"
                  data-order-id={order.id}
                  className="block bg-white rounded-lg border border-neutral-200 hover:border-neutral-300 hover:shadow-sm transition-all"
                >
                  <div className="px-4 py-3 sm:px-5 sm:py-4">
                    {/* Row 1: Order ID + date | Status + Amount */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-neutral-900">#{order.id}</span>
                          <span className="text-neutral-400">·</span>
                          <span className="text-sm text-neutral-500">{formatDateShort(order.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          data-testid="order-status"
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}
                        >
                          {statusConfig.text}
                        </span>
                        <span className="font-semibold text-neutral-900">€{safeMoney(order.total_amount)}</span>
                      </div>
                    </div>

                    {/* Row 2: Product names preview + item count */}
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <p className="text-sm text-neutral-500 truncate">
                        {previewNames.length > 0
                          ? previewNames.join(', ') + (remaining > 0 ? ` +${remaining} ακόμα` : '')
                          : `${totalItems > 0 ? `${totalItems} ${totalItems === 1 ? 'προϊόν' : 'προϊόντα'}` : '—'}`
                        }
                      </p>
                      <svg className="h-4 w-4 text-neutral-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
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