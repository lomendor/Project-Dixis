'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import Navigation from '@/components/Navigation';
import ProductGrid from '../components/ProductGrid';
import { adminApi, ProductWithProducer } from '@/lib/admin/adminApi';
import { useToast } from '@/contexts/ToastContext';

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductWithProducer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const { showToast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
      showToast('error', 'Απέτυχε η φόρτωση των προϊόντων');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (productId: number, isActive: boolean) => {
    try {
      const updatedProduct = await adminApi.toggleProductStatus(productId, isActive);
      setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));
    } catch (error) {
      console.error('Failed to toggle product status:', error);
      throw error; // Re-throw for ProductGrid to handle
    }
  };

  // Filter products based on selected status filter
  const filteredProducts = products.filter(product => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return product.is_active;
    if (statusFilter === 'inactive') return !product.is_active;
    return true;
  });

  const getStatusCounts = () => {
    const active = products.filter(p => p.is_active).length;
    const inactive = products.filter(p => !p.is_active).length;
    
    return {
      total: products.length,
      active,
      inactive
    };
  };

  const counts = getStatusCounts();

  return (
    <AuthGuard requireAuth={true} requireRole="admin">
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <div className="py-10">
          <header>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div>
                  <nav className="flex" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-4">
                      <li>
                        <div>
                          <Link href="/admin" className="text-gray-400 hover:text-gray-500">
                            <svg className="flex-shrink-0 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                            </svg>
                            <span className="sr-only">Αρχική</span>
                          </Link>
                        </div>
                      </li>
                      <li>
                        <div className="flex items-center">
                          <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="ml-4 text-sm font-medium text-gray-500">Προϊόντα</span>
                        </div>
                      </li>
                    </ol>
                  </nav>
                  <h1 className="mt-2 text-3xl font-bold leading-tight text-gray-900">
                    Διαχείριση Προϊόντων
                  </h1>
                  <p className="mt-2 text-sm text-gray-600">
                    Επισκόπηση και διαχείριση όλων των προϊόντων στην πλατφόρμα
                  </p>
                </div>
              </div>
            </div>
          </header>

          <main>
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
              {/* Status Filter Tabs */}
              <div className="px-4 py-6 sm:px-0">
                <div className="bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
                      <div className="bg-white overflow-hidden">
                        <div className="p-5">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                              <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">Σύνολο Προϊόντων</dt>
                                <dd className="text-lg font-medium text-gray-900">{counts.total}</dd>
                              </dl>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white overflow-hidden">
                        <div className="p-5">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <svg className="h-8 w-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                              <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">Ενεργά Προϊόντα</dt>
                                <dd className="text-lg font-medium text-green-600">{counts.active}</dd>
                              </dl>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white overflow-hidden">
                        <div className="p-5">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                              <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">Ανενεργά Προϊόντα</dt>
                                <dd className="text-lg font-medium text-gray-600">{counts.inactive}</dd>
                              </dl>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="sm:hidden">
                      <label htmlFor="product-filter" className="sr-only">
                        Επιλέξτε φίλτρο προϊόντων
                      </label>
                      <select
                        id="product-filter"
                        name="product-filter"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                      >
                        <option value="all">Όλα τα προϊόντα ({counts.total})</option>
                        <option value="active">Ενεργά ({counts.active})</option>
                        <option value="inactive">Ανενεργά ({counts.inactive})</option>
                      </select>
                    </div>
                    
                    <div className="hidden sm:block">
                      <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                          {[
                            { key: 'all', name: `Όλα (${counts.total})` },
                            { key: 'active', name: `Ενεργά (${counts.active})` },
                            { key: 'inactive', name: `Ανενεργά (${counts.inactive})` }
                          ].map((tab) => (
                            <button
                              key={tab.key}
                              onClick={() => setStatusFilter(tab.key as any)}
                              className={`${
                                statusFilter === tab.key
                                  ? 'border-green-500 text-green-600'
                                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
                            >
                              {tab.name}
                            </button>
                          ))}
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              <div className="px-4 pb-8 sm:px-0">
                <ProductGrid 
                  products={filteredProducts}
                  loading={loading}
                  onToggleStatus={handleToggleStatus}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}