'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient, ProducerStats, Product } from '@/lib/api';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

interface StatsCard {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
}

export default function ProducerDashboard() {
  const [stats, setStats] = useState<ProducerStats | null>(null);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<number | null>(null);
  const [editingStock, setEditingStock] = useState<number | null>(null);
  const [tempPrice, setTempPrice] = useState('');
  const [tempStock, setTempStock] = useState('');
  const [actionLoading, setActionLoading] = useState<{ [key: number]: string }>({});
  const { isAuthenticated, isProducer, user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (isAuthenticated && !isProducer) {
      router.push('/'); // Redirect consumers to home page
      return;
    }

    loadDashboardData();
  }, [isAuthenticated, isProducer, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [statsData, productsData] = await Promise.all([
        apiClient.getProducerStats(),
        apiClient.getProducerTopProducts()
      ]);
      
      setStats(statsData);
      setTopProducts(productsData.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !isProducer) {
    return null; // Will redirect in useEffect
  }

  const formatCurrency = (amount: string | number) => {
    return `€${parseFloat(amount.toString()).toFixed(2)}`;
  };

  // Admin action handlers
  const handleToggleActive = async (productId: number) => {
    setActionLoading(prev => ({ ...prev, [productId]: 'toggle' }));
    
    try {
      const result = await apiClient.toggleProductActive(productId);
      
      // Update the product in the list
      setTopProducts(prev => prev.map(product => 
        product.id === productId 
          ? { ...product, is_active: result.is_active }
          : product
      ));
      
      showToast('success', result.message);
      
      // Refresh stats since active product count may have changed
      await loadDashboardData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to toggle product status';
      showToast('error', message);
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      });
    }
  };

  const startEditPrice = (productId: number, currentPrice: string) => {
    setEditingPrice(productId);
    setTempPrice(currentPrice);
  };

  const cancelEditPrice = () => {
    setEditingPrice(null);
    setTempPrice('');
  };

  const handleUpdatePrice = async (productId: number) => {
    if (!tempPrice || isNaN(parseFloat(tempPrice))) {
      showToast('error', 'Please enter a valid price');
      return;
    }

    setActionLoading(prev => ({ ...prev, [productId]: 'price' }));
    
    try {
      const result = await apiClient.updateProductPrice(productId, parseFloat(tempPrice));
      
      // Update the product in the list
      setTopProducts(prev => prev.map(product => 
        product.id === productId 
          ? { ...product, price: result.new_price }
          : product
      ));
      
      showToast('success', `Price updated from ${result.old_price} to ${result.new_price}`);
      
      setEditingPrice(null);
      setTempPrice('');
      
      // Refresh stats
      await loadDashboardData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update price';
      showToast('error', message);
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      });
    }
  };

  const startEditStock = (productId: number, currentStock: number | null) => {
    setEditingStock(productId);
    setTempStock(currentStock?.toString() || '0');
  };

  const cancelEditStock = () => {
    setEditingStock(null);
    setTempStock('');
  };

  const handleUpdateStock = async (productId: number) => {
    if (!tempStock || isNaN(parseInt(tempStock))) {
      showToast('error', 'Please enter a valid stock number');
      return;
    }

    setActionLoading(prev => ({ ...prev, [productId]: 'stock' }));
    
    try {
      const result = await apiClient.updateProductStock(productId, parseInt(tempStock));
      
      // Update the product in the list
      setTopProducts(prev => prev.map(product => 
        product.id === productId 
          ? { ...product, stock: result.new_stock }
          : product
      ));
      
      showToast('success', `Stock updated from ${result.old_stock} to ${result.new_stock} ${result.unit}(s)`);
      
      setEditingStock(null);
      setTempStock('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update stock';
      showToast('error', message);
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      });
    }
  };

  const statsCards: StatsCard[] = stats ? [
    {
      title: 'Total Orders',
      value: stats.total_orders.toString(),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.total_revenue),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
    },
    {
      title: 'Active Products',
      value: stats.active_products.toString(),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      title: 'Average Order Value',
      value: formatCurrency(stats.average_order_value),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Producer Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.name}! Here&rsquo;s an overview of your business.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadDashboardData}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsCards.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
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
                    Top Performing Products
                  </h2>
                  <Link
                    href="/producer/products"
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    View All Products →
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
                      No products yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Start by adding your first product to begin selling.
                    </p>
                    <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg">
                      Add Product
                    </button>
                  </div>
                ) : (
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Stock
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
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
                                      <span className="text-xs text-gray-400">No Image</span>
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
                              {editingPrice === product.id ? (
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={tempPrice}
                                    onChange={(e) => setTempPrice(e.target.value)}
                                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') handleUpdatePrice(product.id);
                                      if (e.key === 'Escape') cancelEditPrice();
                                    }}
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleUpdatePrice(product.id)}
                                    disabled={actionLoading[product.id] === 'price'}
                                    className="text-green-600 hover:text-green-800"
                                  >
                                    ✓
                                  </button>
                                  <button
                                    onClick={cancelEditPrice}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <div className="text-sm font-medium text-gray-900">
                                  {formatCurrency(product.price)} / {product.unit}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {editingStock === product.id ? (
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="number"
                                    min="0"
                                    value={tempStock}
                                    onChange={(e) => setTempStock(e.target.value)}
                                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') handleUpdateStock(product.id);
                                      if (e.key === 'Escape') cancelEditStock();
                                    }}
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleUpdateStock(product.id)}
                                    disabled={actionLoading[product.id] === 'stock'}
                                    className="text-green-600 hover:text-green-800"
                                  >
                                    ✓
                                  </button>
                                  <button
                                    onClick={cancelEditStock}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <div className="text-sm text-gray-900">
                                  {product.stock !== null ? (
                                    `${product.stock} ${product.unit}(s)`
                                  ) : (
                                    'In Stock'
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                product.is_active 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {product.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                {/* Toggle Active Status */}
                                <button
                                  onClick={() => handleToggleActive(product.id)}
                                  disabled={actionLoading[product.id] === 'toggle'}
                                  className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded transition-colors ${
                                    product.is_active
                                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                                  } disabled:opacity-50`}
                                  title={product.is_active ? 'Deactivate product' : 'Activate product'}
                                >
                                  {actionLoading[product.id] === 'toggle' ? (
                                    <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                  ) : product.is_active ? (
                                    '🔴'
                                  ) : (
                                    '🟢'
                                  )}
                                  <span className="ml-1">
                                    {product.is_active ? 'Deactivate' : 'Activate'}
                                  </span>
                                </button>
                                
                                {/* Edit Price */}
                                <button
                                  onClick={() => startEditPrice(product.id, product.price)}
                                  disabled={editingPrice === product.id || actionLoading[product.id] === 'price'}
                                  className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors disabled:opacity-50"
                                  title="Edit price"
                                >
                                  💰 Price
                                </button>
                                
                                {/* Edit Stock */}
                                <button
                                  onClick={() => startEditStock(product.id, product.stock)}
                                  disabled={editingStock === product.id || actionLoading[product.id] === 'stock'}
                                  className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors disabled:opacity-50"
                                  title="Edit stock"
                                >
                                  📦 Stock
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">Add Product</span>
                </button>
                
                <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">View Orders</span>
                </button>
                
                <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">Settings</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}