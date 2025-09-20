'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient, Order } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
import { useToast } from '@/contexts/ToastContext';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatStatus(status: string): { text: string; color: string } {
  switch (status.toLowerCase()) {
    case 'draft':
      return { text: 'Draft', color: 'bg-gray-100 text-gray-800' };
    case 'pending':
      return { text: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
    case 'paid':
      return { text: 'Paid', color: 'bg-blue-100 text-blue-800' };
    case 'shipped':
      return { text: 'Shipped', color: 'bg-purple-100 text-purple-800' };
    case 'delivered':
      return { text: 'Delivered', color: 'bg-green-100 text-green-800' };
    case 'cancelled':
      return { text: 'Cancelled', color: 'bg-red-100 text-red-800' };
    default:
      return { text: status, color: 'bg-gray-100 text-gray-800' };
  }
}

function OrdersPage(): React.JSX.Element {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getOrders();
        setOrders(response.orders);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        showToast('error', 'Failed to load your orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [showToast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="flex items-center justify-center min-h-96">
            <div data-testid="loading-spinner" className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order History</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {orders.length === 0 ? (
          <div data-testid="empty-orders-message" className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6">When you make your first purchase, it will appear here.</p>
            <Link
              href="/products"
              data-testid="browse-products-link"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Browse Products
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
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.id}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Placed on {formatDate(order.created_at)}
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
                        <p className="text-sm font-medium text-gray-500">Total Amount</p>
                        <p className="text-lg font-semibold text-gray-900">€{order.total_amount}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Items</p>
                        <p className="text-lg font-semibold text-gray-900">{totalItems} items</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Payment Method</p>
                        <p className="text-lg font-semibold text-gray-900">{order.payment_method || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-500">
                        {order.shipping_method && (
                          <span>Shipping: {order.shipping_method}</span>
                        )}
                      </div>
                      <Link
                        href={`/account/orders/${order.id}`}
                        data-testid="view-order-details-link"
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        View Details
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
    <AuthGuard requireAuth={true} requireRole="consumer">
      <OrdersPage />
    </AuthGuard>
  );
}