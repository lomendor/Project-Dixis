'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Product {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  price_cents: number;
  currency: string;
  unit: string;
  stock: number;
  is_organic: boolean;
  is_seasonal: boolean;
  producer: {
    id: number;
    name: string;
    business_name: string;
    location: string;
  };
  images: Array<{
    id: number;
    url: string;
    alt_text: string;
    is_primary: boolean;
  }>;
}

interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function ProductsCatalogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Get current page and search from URL params
  const currentPage = parseInt(searchParams.get('page') || '1');
  const currentSearch = searchParams.get('search') || '';

  useEffect(() => {
    setSearchQuery(currentSearch);
    loadProducts(currentPage, currentSearch);
  }, [currentPage, currentSearch]);

  const loadProducts = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/products?${params.toString()}`);

      if (response.ok) {
        const data: ProductsResponse = await response.json();
        setProducts(data.products);
        setPagination(data.pagination);
      } else {
        setError('Αποτυχία φόρτωσης προϊόντων');
      }
    } catch (err) {
      setError('Σφάλμα δικτύου κατά τη φόρτωση προϊόντων');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.append('search', searchQuery.trim());
    }
    params.append('page', '1'); // Reset to page 1 on new search

    router.push(`/products?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams();
    params.append('page', newPage.toString());
    if (currentSearch) {
      params.append('search', currentSearch);
    }

    router.push(`/products?${params.toString()}`);
  };

  const formatPrice = (price: number, currency: string): string => {
    return `€${price.toFixed(2)}`;
  };

  const getProductImageUrl = (product: Product): string => {
    const primaryImage = product.images.find(img => img.is_primary);
    return primaryImage?.url || '/images/product-placeholder.jpg';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900" data-testid="page-title">
                Κατάλογος Προϊόντων
              </h1>
              <p className="mt-1 text-gray-600">
                Ανακαλύψτε φρέσκα προϊόντα από Έλληνες παραγωγούς
              </p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex items-center space-x-2" data-testid="search-form">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Αναζήτηση προϊόντων..."
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                data-testid="search-input"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                data-testid="search-btn"
              >
                Αναζήτηση
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6" data-testid="error-message">
            {error}
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12" data-testid="no-products-message">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {currentSearch ? 'Δεν βρέθηκαν προϊόντα' : 'Κανένα προϊόν διαθέσιμο'}
            </h3>
            <p className="text-gray-600 mb-4">
              {currentSearch
                ? `Δοκιμάστε διαφορετικούς όρους αναζήτησης για "${currentSearch}"`
                : 'Δεν υπάρχουν διαθέσιμα προϊόντα αυτή τη στιγμή'
              }
            </p>
            {currentSearch && (
              <button
                onClick={() => router.push('/products')}
                className="text-green-600 hover:text-green-500 underline"
                data-testid="clear-search-btn"
              >
                Εμφάνιση όλων των προϊόντων
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Results Info */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600" data-testid="results-info">
                Βρέθηκαν {pagination.total} προϊόντα
                {currentSearch && ` για "${currentSearch}"`}
              </p>
              <p className="text-sm text-gray-500">
                Σελίδα {pagination.page} από {pagination.totalPages}
              </p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <Link href={`/products/${product.slug}`} data-testid={`product-card-${product.id}`}>
                    <div className="aspect-square relative rounded-t-lg overflow-hidden">
                      <img
                        src={getProductImageUrl(product)}
                        alt={product.title}
                        className="w-full h-full object-cover"
                        data-testid={`product-image-${product.id}`}
                      />

                      {/* Badges */}
                      <div className="absolute top-2 left-2 space-y-1">
                        {product.is_organic && (
                          <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                            Βιολογικό
                          </span>
                        )}
                        {product.is_seasonal && (
                          <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full">
                            Εποχιακό
                          </span>
                        )}
                      </div>

                      {/* Stock Indicator */}
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <span className="text-white font-medium">Εξαντλημένο</span>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-1 line-clamp-2" data-testid={`product-title-${product.id}`}>
                        {product.title}
                      </h3>

                      <p className="text-sm text-gray-600 mb-2" data-testid={`producer-name-${product.id}`}>
                        {product.producer.business_name}
                      </p>

                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-green-600" data-testid={`product-price-${product.id}`}>
                            {formatPrice(product.price, product.currency)}
                          </span>
                          <span className="text-sm text-gray-500 ml-1">
                            / {product.unit}
                          </span>
                        </div>

                        <div className="text-sm text-gray-500">
                          {product.stock > 0 ? `${product.stock} διαθέσιμα` : 'Εξαντλημένο'}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2" data-testid="pagination">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="prev-page-btn"
                >
                  Προηγούμενη
                </button>

                {/* Page Numbers */}
                {[...Array(pagination.totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  const isCurrentPage = pageNum === pagination.page;

                  // Show only nearby pages
                  if (pageNum === 1 || pageNum === pagination.totalPages ||
                      (pageNum >= pagination.page - 2 && pageNum <= pagination.page + 2)) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 rounded-lg ${
                          isCurrentPage
                            ? 'bg-green-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                        data-testid={`page-${pageNum}-btn`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (pageNum === 2 && pagination.page > 4) {
                    return <span key="start-ellipsis" className="px-2">...</span>;
                  } else if (pageNum === pagination.totalPages - 1 && pagination.page < pagination.totalPages - 3) {
                    return <span key="end-ellipsis" className="px-2">...</span>;
                  }
                  return null;
                })}

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="next-page-btn"
                >
                  Επόμενη
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}