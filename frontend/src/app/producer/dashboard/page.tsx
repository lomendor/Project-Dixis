'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient, ProducerStats, Product } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from '@/contexts/LocaleContext';
import { formatCurrency } from '@/env';

interface StatsCard {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  testId: string;
}

export default function ProducerDashboard() {
  const router = useRouter();
  const t = useTranslations();
  const [stats, setStats] = useState<ProducerStats | null>(null);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [statsData, productsData] = await Promise.all([
        apiClient.getProducerStats(),
        apiClient.getProducerTopProducts().catch(() => ({ data: [] as Product[] }))
      ]);

      setStats(statsData);
      let products = productsData.data || [];

      // FIX-DASHBOARD-LEAK: If top-products is empty but stats show active products,
      // fallback to producer's own products (scoped by auth), never the public API
      if (products.length === 0 && statsData.active_products > 0) {
        try {
          const ownProducts = await apiClient.getProducerProducts({ per_page: 5 });
          products = (ownProducts.data || []).map((p: Product) => ({
            ...p,
            categories: p.categories || [],
            images: p.images || [],
          }));
        } catch {
          // Fallback silently — dashboard will show empty state
        }
      }

      setTopProducts(products);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };



  const statsCards: StatsCard[] = stats ? [
    {
      title: t('producerDashboard.totalOrders'),
      value: stats.total_orders.toString(),
      testId: 'kpi-total-orders',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      title: t('producerDashboard.totalRevenue'),
      value: formatCurrency(parseFloat(stats.total_revenue)),
      testId: 'kpi-total-revenue',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
    },
    {
      title: t('producerDashboard.activeProducts'),
      value: stats.active_products.toString(),
      testId: 'kpi-active-products',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      title: t('producerDashboard.averageOrderValue'),
      value: formatCurrency(parseFloat(stats.average_order_value)),
      testId: 'kpi-avg-order-value',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ] : [];

  return (
    <AuthGuard requireAuth={true} requireRole="producer">
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="producer-dashboard">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="dashboard-title">
            {t('producerDashboard.title')}
          </h1>
          <p className="text-gray-600">
            {t('producerDashboard.welcome').replace('{name}', user?.name || '')}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadDashboardData}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              data-testid="retry-button"
            >
              {t('producerDashboard.tryAgain')}
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="kpi-cards">
              {statsCards.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6" data-testid={stat.testId}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">
                        {stat.value}
                      </p>
                    </div>
                    <div className="text-green-600">
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {t('producerDashboard.topProducts')}
                  </h2>
                  <Link
                    href="/producer/products"
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    {t('producerDashboard.viewAllProducts')} →
                  </Link>
                </div>

                {topProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('producerDashboard.noProductsYet')}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {t('producerDashboard.startSelling')}
                    </p>
                    <button
                      onClick={() => router.push('/my/products/create')}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
                    >
                      {t('producerDashboard.addProduct')}
                    </button>
                  </div>
                ) : (
                  <>
                  {/* Mobile card layout */}
                  <div className="md:hidden space-y-3">
                    {topProducts.slice(0, 5).map((product) => (
                      <div key={product.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="flex-shrink-0 h-12 w-12">
                          {product.images.length > 0 ? (
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={product.images[0].image_path}
                              alt={product.images[0].alt_text || product.name}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                              <span className="text-xs text-gray-400">{t('producerDashboard.noImage')}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(parseFloat(product.price || product.current_price))} / {product.unit}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {product.stock !== null ? `${product.stock} ${product.unit}(s)` : t('producerDashboard.inStock')}
                            </span>
                            <span className="inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              {t('producerDashboard.active')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop table layout */}
                  <div className="hidden md:block overflow-x-auto -mx-6">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('producerDashboard.product')}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('producerDashboard.price')}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('producerDashboard.stock')}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('producerDashboard.status')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {topProducts.slice(0, 5).map((product) => (
                          <tr key={product.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  {product.images.length > 0 ? (
                                    <img
                                      className="h-10 w-10 rounded-lg object-cover"
                                      src={product.images[0].image_path}
                                      alt={product.images[0].alt_text || product.name}
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                      <span className="text-xs text-gray-400">{t('producerDashboard.noImage')}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {product.name}
                                  </div>
                                  {product.categories.length > 0 && (
                                    <div className="text-sm text-gray-500">
                                      {product.categories[0].name}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {formatCurrency(parseFloat(product.price || product.current_price))} / {product.unit}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {product.stock !== null ? (
                                  `${product.stock} ${product.unit}(s)`
                                ) : (
                                  t('producerDashboard.inStock')
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                {t('producerDashboard.active')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  </>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {t('producerDashboard.quickActions')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button
                  onClick={() => router.push('/my/products/create')}
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  data-testid="quick-action-add-product"
                >
                  <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">{t('producerDashboard.addProduct')}</span>
                </button>

                <button
                  onClick={() => router.push('/my/orders')}
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  data-testid="quick-action-view-orders"
                >
                  <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">{t('producerDashboard.viewOrders')}</span>
                </button>

                <button
                  onClick={() => router.push('/account/notifications')}
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  data-testid="quick-action-notifications"
                >
                  <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">{t('producerDashboard.notifications')}</span>
                </button>

                <button
                  onClick={() => router.push('/producer/settings')}
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  data-testid="quick-action-settings"
                >
                  <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">{t('producerDashboard.settings')}</span>
                </button>
              </div>
            </div>
          </div>
        )}
        </main>
      </div>
    </AuthGuard>
  );
}
