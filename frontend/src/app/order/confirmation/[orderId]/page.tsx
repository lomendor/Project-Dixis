'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { labelFor } from '@/lib/shipping/format';
import { useTranslations } from '@/contexts/LocaleContext';

const fmtEUR = new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' });

interface Order {
  id: string;
  status: string;
  createdAt: string;
  total: number;
  shippingMethod?: string | null;
  computedShipping?: number;
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
  }>;
  shipping: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    postal: string;
    phone?: string;
  };
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const t = useTranslations();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const orderId = params.orderId as string;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (orderId) {
      loadOrder();
    }
  }, [isAuthenticated, orderId, router]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError('');

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      const response = await fetch(`${baseUrl}/api/orders/${orderId}`);

      if (!response.ok) {
        throw new Error('Failed to load order');
      }

      const data = await response.json();
      setOrder(data);
    } catch {
      setError(t('orderConfirmation.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PAID: 'bg-green-100 text-green-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
    };

    const statusKey = status.toLowerCase() as 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered';
    const color = statusColors[status.toUpperCase()] || statusColors['PENDING'];

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>
        {t(`orderStatus.${statusKey}`)}
      </span>
    );
  };


  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">❌</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('orderConfirmation.error')}</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              {t('orderConfirmation.backToHome')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('orderConfirmation.orderNotFound')}</h1>
            <p className="text-gray-600 mb-6">
              {t('orderConfirmation.orderNotFoundMsg').replace('{id}', orderId)}
            </p>
            <Link
              href="/"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              {t('orderConfirmation.backToHome')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="order-confirmation-page">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">✅</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="confirmation-title">
            {t('orderConfirmation.orderComplete')}
          </h1>
          <p className="text-gray-600">
            {t('orderConfirmation.orderSuccessMsg')}
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('orderConfirmation.orderNumber').replace('{id}', order.id)}
            </h2>
            {getStatusBadge(order.status)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">{t('orderConfirmation.orderDate')}</h3>
              <p className="text-gray-600">
                {new Date(order.createdAt).toLocaleDateString('el-GR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">{t('orderConfirmation.orderTotal')}</h3>
              <p className="text-xl font-bold text-green-600" data-testid="order-total">
                {fmtEUR.format(order.total)}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('orderConfirmation.products')}</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      {t('orderConfirmation.quantity')}: {item.quantity} × {fmtEUR.format(item.price)}
                    </p>
                  </div>
                  <p className="font-medium text-gray-900">
                    {fmtEUR.format(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Shipping Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('orderConfirmation.shippingAddress')}</h3>
            <div className="text-gray-600">
              <p className="font-medium">{order.shipping.name}</p>
              <p>{order.shipping.line1}</p>
              {order.shipping.line2 && <p>{order.shipping.line2}</p>}
              <p>{order.shipping.city}, {order.shipping.postal}</p>
              <p>{t('orderConfirmation.greece')}</p>
              {order.shipping.phone && (
                <p className="mt-2">{t('orderConfirmation.phone')}: {order.shipping.phone}</p>
              )}
            </div>
          </div>

          {/* Shipping Method & Cost */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('orderConfirmation.shippingCost')}</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {t('orderConfirmation.method')} (<span data-testid="order-shipping-label">{labelFor(order.shippingMethod)}</span>):
                </span>
                <span className="text-sm text-gray-600" data-testid="order-shipping">
                  {fmtEUR.format(Number(order.computedShipping || 0))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={`/orders/track/${order.id}`}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
              data-testid="track-order-btn"
            >
              {t('orderConfirmation.trackOrder')} »
            </Link>

            <Link
              href="/"
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors text-center font-medium"
              data-testid="continue-shopping-btn"
            >
              {t('orderConfirmation.continueShopping')}
            </Link>

            <button
              onClick={() => window.print()}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              data-testid="print-order-btn"
            >
              {t('orderConfirmation.printOrder')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
