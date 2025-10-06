'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient, Order } from '@/lib/api';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function OrderDetails() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const orderId = parseInt(params.id as string);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (orderId) {
      loadOrder();
    }
  }, [orderId, isAuthenticated, router]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const orderData = await apiClient.getOrder(orderId);
      setOrder(orderData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'text-yellow-800 bg-yellow-100';
      case 'confirmed':
        return 'text-blue-800 bg-blue-100';
      case 'processing':
        return 'text-orange-800 bg-orange-100';
      case 'shipped':
        return 'text-purple-800 bg-purple-100';
      case 'delivered':
        return 'text-green-800 bg-green-100';
      case 'cancelled':
        return 'text-red-800 bg-red-100';
      default:
        return 'text-gray-800 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const copyOrderCode = async () => {
    try {
      await navigator.clipboard.writeText(order?.id.toString() || '');
      alert('Ο κωδικός αντιγράφηκε.');
    } catch {
      // Fallback for older browsers
      try {
        const ta = document.createElement('textarea');
        ta.value = order?.id.toString() || '';
        ta.style.position = 'fixed';
        ta.style.left = '-10000px';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        alert(ok ? 'Ο κωδικός αντιγράφηκε.' : 'Αποτυχία αντιγραφής.');
      } catch {
        alert('Αποτυχία αντιγραφής.');
      }
    }
  };

  const cancelOrder = async () => {
    if (!confirm('Θέλετε να ακυρώσετε την παραγγελία;')) return;
    try {
      const r = await fetch(`/api/me/orders/${order?.id}`, { method: 'POST' });
      if (r.ok) {
        alert('Η παραγγελία ακυρώθηκε.');
        loadOrder();
      } else {
        const j = await r.json();
        alert(j?.error || 'Δεν είναι δυνατή η ακύρωση');
      }
    } catch {
      alert('Σφάλμα σύνδεσης');
    }
  };

  const getItemStatusColor = (status: string) => {
    switch (status) {
      case 'PLACED': return 'bg-gray-100 text-gray-700';
      case 'ACCEPTED': return 'bg-yellow-100 text-yellow-700';
      case 'FULFILLED': return 'bg-green-100 text-green-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/cart"
            className="text-green-600 hover:text-green-700 flex items-center text-sm font-medium"
          >
            ← Back to Cart
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadOrder}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        ) : order ? (
          <div className="space-y-8">
            {/* Order Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Order #{order.id}
                  </h1>
                  <p className="text-gray-600">
                    Placed on {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div className="flex gap-3 mt-4 flex-wrap">
                <button
                  onClick={copyOrderCode}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
                >
                  Αντιγραφή κωδικού
                </button>
                <Link
                  href="/my/orders"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
                >
                  Οι παραγγελίες μου
                </Link>
                {order.status === 'PLACED' && order.items.every((item: any) => (item.status === 'PLACED' || !item.status)) && (
                  <button
                    onClick={cancelOrder}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium"
                  >
                    Ακύρωση παραγγελίας
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Order Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md">
                  <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">
                      Order Items
                    </h2>
                    
                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                          {/* Product Image */}
                          <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                            {item.product.images.length > 0 ? (
                              <img
                                src={item.product.images[0].image_path}
                                alt={item.product.images[0].alt_text || item.product.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <span className="text-gray-400 text-xs">No Image</span>
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h3 className="text-sm font-medium text-gray-900">
                                {item.product.name}
                              </h3>
                              {(item as any).status && (
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getItemStatusColor((item as any).status)}`}>
                                  {(item as any).status}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              By {item.product.producer.name}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-sm text-gray-600">
                                Quantity: {item.quantity} {item.product.unit}(s)
                              </span>
                              <span className="text-sm font-medium text-green-600">
                                €{(parseFloat(item.price) * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1 space-y-6">
                {/* Order Summary Card */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Order Summary
                  </h2>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">€{parseFloat(order.subtotal || order.total_amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <div className="text-right">
                        <span className="font-medium">
                          {order.shipping_cost ? `€${order.shipping_cost.toFixed(2)}` : 'Free'}
                        </span>
                        {order.shipping_carrier && (
                          <div className="text-xs text-gray-500">{order.shipping_carrier}</div>
                        )}
                        {order.shipping_eta_days && (
                          <div className="text-xs text-gray-500">{order.shipping_eta_days} day(s)</div>
                        )}
                      </div>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between text-base font-semibold">
                        <span>Total</span>
                        <span className="text-green-600">€{parseFloat(order.total_amount).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Information */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Delivery Information
                  </h2>
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600">Payment Method:</span>
                      <p className="font-medium capitalize">
                        {order.payment_method.replace('_', ' ')}
                      </p>
                    </div>
                    
                    {(order.postal_code || order.city) && (
                      <div>
                        <span className="text-gray-600">Delivery Location:</span>
                        <p className="font-medium">
                          {order.city}{order.postal_code && `, ${order.postal_code}`}
                        </p>
                        {order.shipping_carrier && order.shipping_eta_days && (
                          <p className="text-xs text-gray-500 mt-1">
                            Via {order.shipping_carrier} • Estimated {order.shipping_eta_days} day(s)
                          </p>
                        )}
                      </div>
                    )}
                    
                    {order.shipping_address && (
                      <div>
                        <span className="text-gray-600">Full Address:</span>
                        <p className="font-medium">
                          {order.shipping_address}
                        </p>
                      </div>
                    )}
                    
                    {order.notes && (
                      <div>
                        <span className="text-gray-600">Notes:</span>
                        <p className="font-medium">
                          {order.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Continue Shopping */}
                <div className="text-center">
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>

            {/* Success Message for New Orders */}
            {order.status === 'pending' && (
              <div data-testid="order-success" className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Order placed successfully!
                    </h3>
                    <p className="mt-1 text-sm text-green-700">
                      Thank you for your order. We&rsquo;ll notify you when your items are ready for delivery.
                      Payment will be collected upon delivery.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Order not found.</p>
            <Link
              href="/"
              className="mt-4 inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
            >
              Back to Products
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}