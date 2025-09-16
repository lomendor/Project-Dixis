'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient, Product } from '@/lib/api';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/env';

const LOW_STOCK_THRESHOLD = 5;

interface StockUpdateModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (productId: number, newStock: number) => Promise<void>;
}

function StockUpdateModal({ product, isOpen, onClose, onUpdate }: StockUpdateModalProps) {
  const [stock, setStock] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product && isOpen) {
      setStock(product.stock?.toString() || '0');
      setError(null);
    }
  }, [product, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    const stockValue = parseInt(stock);
    if (isNaN(stockValue) || stockValue < 0) {
      setError('Παρακαλώ εισάγετε έναν έγκυρο αριθμό απόθεμα');
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      await onUpdate(product.id, stockValue);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Αποτυχία ενημέρωσης απόθεμα');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Ενημέρωση Απόθεμα: {product.name}
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                Νέο Απόθεμα ({product.unit})
              </label>
              <input
                type="number"
                id="stock"
                min="0"
                max="99999"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                disabled={isUpdating}
              />
              {product.stock !== null && (
                <p className="text-sm text-gray-500 mt-1">
                  Τρέχον απόθεμα: {product.stock} {product.unit}(s)
                </p>
              )}
            </div>

            {error && (
              <div className="mb-4 text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isUpdating}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50"
              >
                Ακύρωση
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Ενημέρωση...' : 'Ενημέρωση'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ProducerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const { isAuthenticated, isProducer, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (isAuthenticated && !isProducer) {
      router.push('/');
      return;
    }

    loadProducts();
  }, [isAuthenticated, isProducer, router, search, statusFilter, currentPage]);

  const loadProducts = async () => {
    try {
      setLoading(true);

      const response = await apiClient.getProducerProducts({
        page: currentPage,
        per_page: 20,
        search: search || undefined,
        status: statusFilter,
      });

      setProducts(response.data);
      setTotalPages(response.last_page);
      setTotal(response.total);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Αποτυχία φόρτωσης προϊόντων');
    } finally {
      setLoading(false);
    }
  };

  const handleStockUpdate = async (productId: number, newStock: number) => {
    try {
      await apiClient.updateProductStock(productId, newStock);

      // Update the product in the local state
      setProducts(prevProducts =>
        prevProducts.map(product =>
          product.id === productId
            ? { ...product, stock: newStock }
            : product
        )
      );
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Αποτυχία ενημέρωσης απόθεμα');
    }
  };

  const openStockModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeStockModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

  const isLowStock = (product: Product): boolean => {
    return product.stock !== null && product.stock <= LOW_STOCK_THRESHOLD && product.stock > 0;
  };

  const isOutOfStock = (product: Product): boolean => {
    return product.stock !== null && product.stock === 0;
  };

  if (!isAuthenticated || !isProducer) {
    return null;
  }

  const getStockStatusClass = (product: Product): string => {
    if (isOutOfStock(product)) {
      return 'bg-red-100 text-red-800';
    }
    if (isLowStock(product)) {
      return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-green-100 text-green-800';
  };

  const getStockStatusText = (product: Product): string => {
    if (isOutOfStock(product)) {
      return 'Εξαντλημένο';
    }
    if (isLowStock(product)) {
      return 'Χαμηλό Απόθεμα';
    }
    return 'Σε Απόθεμα';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Διαχείριση Προϊόντων
              </h1>
              <p className="text-gray-600">
                Διαχειριστείτε το απόθεμα και την κατάσταση των προϊόντων σας
              </p>
            </div>
            <Link
              href="/producer/dashboard"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Επιστροφή στο Ταμπλό
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Αναζήτηση
              </label>
              <input
                type="text"
                id="search"
                placeholder="Αναζήτηση ανά όνομα προϊόντος..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Κατάσταση
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">Όλα τα Προϊόντα</option>
                <option value="active">Ενεργά Προϊόντα</option>
                <option value="inactive">Ανενεργά Προϊόντα</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Προϊόντα ({total} συνολικά)
              </h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={loadProducts}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  Δοκιμάστε Ξανά
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Δεν βρέθηκαν προϊόντα
                </h3>
                <p className="text-gray-600 mb-4">
                  {search ? 'Δοκιμάστε διαφορετικούς όρους αναζήτησης.' : 'Δεν έχετε ακόμη προϊόντα.'}
                </p>
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Προϊόν
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Τιμή
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Απόθεμα
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Κατάσταση
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ενέργειες
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        className={`hover:bg-gray-50 ${isLowStock(product) ? 'bg-yellow-50' : ''} ${isOutOfStock(product) ? 'bg-red-50' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {product.images.length > 0 ? (
                                <img
                                  className="h-10 w-10 rounded-lg object-cover"
                                  src={product.images[0].image_path || product.images[0].url}
                                  alt={product.images[0].alt_text || product.name}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <span className="text-xs text-gray-400">Χωρίς Εικόνα</span>
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
                            {formatCurrency(parseFloat(product.price))} / {product.unit}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className="text-sm text-gray-900">
                              {product.stock !== null ? (
                                `${product.stock} ${product.unit}(s)`
                              ) : (
                                'Απεριόριστο'
                              )}
                            </div>
                            {(isLowStock(product) || isOutOfStock(product)) && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                ⚠️ {isOutOfStock(product) ? 'Εξαντλημένο' : 'Χαμηλό'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {product.is_active ? 'Ενεργό' : 'Ανενεργό'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => openStockModal(product)}
                            className="text-green-600 hover:text-green-900 mr-4"
                          >
                            Ενημέρωση Απόθεμα
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Σελίδα {currentPage} από {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Προηγούμενη
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Επόμενη
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Stock Update Modal */}
      <StockUpdateModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={closeStockModal}
        onUpdate={handleStockUpdate}
      />
    </div>
  );
}