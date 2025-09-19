'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { apiClient, Order } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
import { useToast } from '@/contexts/ToastContext';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
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

function OrderDetailsPage(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId || isNaN(Number(orderId))) {
        setError('Invalid order ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const orderData = await apiClient.getOrder(Number(orderId));
        setOrder(orderData);
      } catch (error) {
        console.error('Failed to fetch order:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load order details';
        setError(errorMessage);

        if (errorMessage.includes('404') || errorMessage.includes('not found')) {
          showToast('error', 'Order not found');
        } else {
          showToast('error', 'Failed to load order details. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, showToast]);

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

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div data-testid="error-message" className="text-center py-12">
            <div className="text-red-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Order Not Found</h3>
            <p className="text-gray-500 mb-6">{error || 'The order you\'re looking for could not be found.'}</p>
            <div className="space-x-4">
              <button
                onClick={() => router.back()}
                data-testid="back-button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Go Back
              </button>
              <Link
                href="/account/orders"
                data-testid="view-all-orders-link"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                View All Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = formatStatus(order.status);
  const orderItems = order.items || order.order_items || [];
  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header with back navigation */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link
              href="/account/orders"
              data-testid="back-to-orders-link"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Orders
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Order #{order.id}</h1>
              <p className="text-gray-600">Placed on {formatDate(order.created_at)}</p>
            </div>
            <span
              data-testid="order-status-badge"
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}
            >
              {statusConfig.text}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div data-testid="order-items-section" className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Order Items ({totalItems})</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {orderItems.map((item) => (
                  <div
                    key={item.id}
                    data-testid="order-item"
                    data-product-id={item.product_id}
                    className="p-6 flex items-center"
                  >
                    {item.product && item.product.images && item.product.images.length > 0 ? (
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        width={64}
                        height={64}
                        className="h-16 w-16 object-cover rounded-md"
                        data-testid="product-image"
                      />
                    ) : (
                      <div className="h-16 w-16 bg-gray-200 rounded-md flex items-center justify-center">
                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="ml-4 flex-1">
                      <h3 className="text-sm font-medium text-gray-900" data-testid="product-name">
                        {item.product_name || item.product?.name || 'Product'}
                      </h3>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <span data-testid="item-quantity">Quantity: {item.quantity}</span>
                        <span className="mx-2">•</span>
                        <span data-testid="item-unit">
                          {item.product_unit || item.product?.unit || 'unit'}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        <span data-testid="unit-price">€{item.unit_price || item.price} each</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900" data-testid="item-total">
                        €{item.total_price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Timeline */}
            <div data-testid="order-timeline-section" className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Order Timeline</h2>
              </div>
              <div className="p-6">
                <div className="flow-root">
                  <ul className="-mb-8">
                    <li>
                      <div className="relative pb-8">
                        <div className="relative flex items-center space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center ring-8 ring-white">
                              <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div>
                              <div className="text-sm">
                                <span className="font-medium text-gray-900">Order placed</span>
                              </div>
                              <p className="mt-0.5 text-sm text-gray-500">
                                {formatDate(order.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                    {order.status !== 'draft' && (
                      <li>
                        <div className="relative">
                          <div className="relative flex items-center space-x-3">
                            <div>
                              <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                statusConfig.color.includes('green') ? 'bg-green-100' : 'bg-gray-100'
                              }`}>
                                <svg className={`h-4 w-4 ${
                                  statusConfig.color.includes('green') ? 'text-green-600' : 'text-gray-400'
                                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div>
                                <div className="text-sm">
                                  <span className="font-medium text-gray-900">Status: {statusConfig.text}</span>
                                </div>
                                <p className="mt-0.5 text-sm text-gray-500">
                                  Current status
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <div data-testid="payment-summary-section" className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  <span className="text-sm font-medium text-gray-900" data-testid="subtotal-amount">
                    €{order.subtotal}
                  </span>
                </div>
                {order.tax_amount && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tax</span>
                    <span className="text-sm font-medium text-gray-900" data-testid="tax-amount">
                      €{order.tax_amount}
                    </span>
                  </div>
                )}
                {order.shipping_amount && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Shipping</span>
                    <span className="text-sm font-medium text-gray-900" data-testid="shipping-amount">
                      €{order.shipping_amount}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-base font-medium text-gray-900">Total</span>
                    <span className="text-base font-medium text-gray-900" data-testid="total-amount">
                      €{order.total_amount}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping & Payment Info */}
            <div data-testid="shipping-payment-info-section" className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Shipping & Payment</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">Payment Method</h3>
                  <p className="text-sm text-gray-600" data-testid="payment-method">
                    {order.payment_method || 'Not specified'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">Shipping Method</h3>
                  <p className="text-sm text-gray-600" data-testid="shipping-method">
                    {order.shipping_method || 'Not specified'}
                  </p>
                </div>
                {order.shipping_address && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">Shipping Address</h3>
                    <p className="text-sm text-gray-600" data-testid="shipping-address">
                      {order.shipping_address}
                      {order.city && `, ${order.city}`}
                      {order.postal_code && ` ${order.postal_code}`}
                    </p>
                  </div>
                )}
                {order.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">Order Notes</h3>
                    <p className="text-sm text-gray-600" data-testid="order-notes">
                      {order.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailsPageWithAuth(): React.JSX.Element {
  return (
    <AuthGuard requireAuth={true} requireRole="consumer">
      <OrderDetailsPage />
    </AuthGuard>
  );
}