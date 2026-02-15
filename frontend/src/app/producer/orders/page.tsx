'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient, ProducerOrder } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatCurrency } from '@/env';
import { useTranslations } from '@/contexts/LocaleContext';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-teal-100 text-teal-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

interface ShippingAddress {
  name?: string;
  phone?: string;
  email?: string;
  line1?: string;
  city?: string;
  postal_code?: string;
  country?: string;
}

interface OrderCounts {
  total: number;
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
}

export default function ProducerOrdersPage() {
  const t = useTranslations();
  const [orders, setOrders] = useState<ProducerOrder[]>([]);
  const [counts, setCounts] = useState<OrderCounts>({
    total: 0,
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
  });
  const [activeFilter, setActiveFilter] = useState<OrderStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Hydration fix: defer date rendering until client-side mount
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    loadOrders();
  }, [activeFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProducerOrders(
        activeFilter === 'all' ? undefined : activeFilter
      );
      setOrders(response.orders);
      setCounts(response.meta);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: OrderStatus): string => {
    return t(`producerOrders.${status}`);
  };

  const FilterTab = ({
    status,
    label,
    count,
  }: {
    status: OrderStatus | 'all';
    label: string;
    count: number;
  }) => {
    const isActive = activeFilter === status;
    return (
      <button
        onClick={() => setActiveFilter(status)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-primary text-white'
            : 'bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-300'
        }`}
      >
        {label} ({count})
      </button>
    );
  };

  const OrderCard = ({ order }: { order: ProducerOrder }) => {
    return (
      <Link href={`/producer/orders/${order.id}`} className="block">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">
              {t('producerOrders.orderNumber').replace('{id}', String(order.id))}
            </h3>
            <p className="text-sm text-neutral-600 mt-1">
              {order.user?.name || t('producerOrders.guest')}
            </p>
            <time
              dateTime={order.created_at}
              suppressHydrationWarning
              className="block text-sm text-neutral-500"
            >
              {mounted
                ? new Date(order.created_at).toLocaleString('el-GR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : ''}
            </time>
          </div>
          <div className="text-right">
            <span
              className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                statusColors[order.status]
              }`}
            >
              {getStatusLabel(order.status)}
            </span>
            <p className="text-xl font-bold text-neutral-900 mt-2">
              {formatCurrency(parseFloat(order.total))}
            </p>
          </div>
        </div>

        {/* Order Items */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-neutral-700 mb-2">
            {t('producerOrders.products')} ({(order.orderItems ?? []).length})
          </h4>
          <div className="space-y-2">
            {(order.orderItems ?? []).map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-neutral-700">
                  {item.product_name || item.product?.name}
                </span>
                <span className="text-neutral-600">
                  {item.quantity} × {formatCurrency(parseFloat(item.unit_price))}
                  {' = '}
                  <span className="font-medium text-neutral-900">
                    {formatCurrency(parseFloat(item.total_price))}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address */}
        {(order as ProducerOrder & { shipping_address?: ShippingAddress }).shipping_address && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
            <p className="font-medium text-amber-900 mb-1">{t('producerOrders.shippingDetails')}</p>
            {(() => {
              const addr = (order as ProducerOrder & { shipping_address?: ShippingAddress }).shipping_address!;
              return (
                <>
                  {addr.name && <p className="text-amber-800">{addr.name}</p>}
                  {addr.line1 && <p className="text-amber-800">{addr.line1}</p>}
                  {(addr.city || addr.postal_code) && (
                    <p className="text-amber-800">{addr.city} {addr.postal_code}</p>
                  )}
                  {addr.phone && <p className="text-amber-800">{addr.phone}</p>}
                </>
              );
            })()}
          </div>
        )}
        </div>
      </Link>
    );
  };

  return (
    <AuthGuard requireAuth={true} requireRole="producer">
      <div className="min-h-screen bg-neutral-50" data-testid="producer-orders-page">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-neutral-900" data-testid="producer-orders-title">{t('producerOrders.title')}</h1>
            <p className="text-neutral-600 mt-2">
              {t('producerOrders.subtitle')}
            </p>
          </div>

          {/* Status Filter Tabs */}
          <nav className="flex flex-wrap gap-2 mb-6">
            <FilterTab status="all" label={t('producerOrders.all')} count={counts.total} />
            <FilterTab
              status="confirmed"
              label={t('producerOrders.confirmed')}
              count={counts.confirmed}
            />
            <FilterTab
              status="pending"
              label={t('producerOrders.pending')}
              count={counts.pending}
            />
            <FilterTab
              status="processing"
              label={t('producerOrders.processing')}
              count={counts.processing}
            />
            <FilterTab
              status="shipped"
              label={t('producerOrders.shipped')}
              count={counts.shipped}
            />
            <FilterTab
              status="delivered"
              label={t('producerOrders.delivered')}
              count={counts.delivered}
            />
          </nav>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : error ? (
            /* Error State */
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
                onClick={loadOrders}
                className="bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg transition-colors"
              >
                {t('producerOrders.tryAgain')}
              </button>
            </div>
          ) : orders.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12">
              <div className="text-neutral-400 mb-4">
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
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                {t('producerOrders.noOrders')}
              </h3>
              <p className="text-neutral-600">
                {activeFilter === 'all'
                  ? t('producerOrders.noOrdersYet')
                  : t('producerOrders.noOrdersStatus').replace('{status}', getStatusLabel(activeFilter as OrderStatus))}
              </p>
            </div>
          ) : (
            /* Order Cards */
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
