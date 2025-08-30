'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient, Product } from '@/lib/api';
import Navigation from '@/components/Navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { normalizeGreekText, formatGreekCurrency } from '@/lib/greekUtils';

interface Filters {
  search: string;
  category: string;
  producer: string;
  minPrice: string;
  maxPrice: string;
  organic: boolean | null;
  sort: string;
  dir: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [producers, setProducers] = useState<{id: number, name: string}[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    category: '',
    producer: '',
    minPrice: '',
    maxPrice: '',
    organic: null,
    sort: 'created_at',
    dir: 'desc'
  });
  const { isAuthenticated } = useAuth();
  const { addToCart, isLoading: cartLoading } = useCart();

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number | boolean> = {
        per_page: 20,
      };
      
      // Only add parameters if they have values
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.producer) params.producer = filters.producer;
      if (filters.minPrice) params.min_price = parseFloat(filters.minPrice);
      if (filters.maxPrice) params.max_price = parseFloat(filters.maxPrice);
      if (filters.organic !== null) params.organic = filters.organic;
      if (filters.sort) params.sort = filters.sort;
      if (filters.dir) params.dir = filters.dir;
      
      const response = await apiClient.getProducts(params);
      setProducts(response.data);
      
      // Extract unique categories and producers for filter dropdowns
      const uniqueCategories = Array.from(
        new Set(response.data.flatMap(product => 
          product.categories.map(cat => cat.name)
        ))
      );
      setCategories(uniqueCategories);
      
      const uniqueProducers = Array.from(
        new Set(response.data.map(product => ({
          id: product.producer.id,
          name: product.producer.name
        })).filter((producer, index, self) => 
          index === self.findIndex(p => p.id === producer.id)
        ))
      );
      setProducers(uniqueProducers);
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: keyof Filters, value: Filters[keyof Filters]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      category: '',
      producer: '',
      minPrice: '',
      maxPrice: '',
      organic: null,
      sort: 'created_at',
      dir: 'desc'
    });
  };

  const hasActiveFilters = filters.search || filters.category || filters.producer ||
                          filters.minPrice || filters.maxPrice || filters.organic !== null;

  const updateFilter = (key: keyof Filters, value: Filters[keyof Filters]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      category: '',
      producer: '',
      minPrice: '',
      maxPrice: '',
      organic: null,
      sort: 'created_at',
      dir: 'desc'
    });
  };

  const handleAddToCart = async (productId: number) => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = '/auth/login';
      return;
    }

<<<<<<< HEAD
    try {
      await apiClient.addToCart(productId, 1);
      // Show a better success message
      const successDiv = document.createElement('div');
      successDiv.innerHTML = `
        <div class="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2" data-testid="cart-success">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span>Added to cart!</span>
        </div>
      `;
      document.body.appendChild(successDiv);
      setTimeout(() => {
        document.body.removeChild(successDiv);
      }, 3000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // Show a better error message
      const errorDiv = document.createElement('div');
      errorDiv.innerHTML = `
        <div class="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <span>Failed to add to cart</span>
        </div>
      `;
      document.body.appendChild(errorDiv);
      setTimeout(() => {
        document.body.removeChild(errorDiv);
      }, 3000);
    }
=======
    await addToCart(productId, 1);
>>>>>>> 6a6890f (feat: Greek-insensitive search with full localization - PR-B MVP Polish Pack 01)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
<<<<<<< HEAD
          <h1 data-testid="page-title" className="text-3xl font-bold text-gray-900 mb-4">
            Fresh Products from Local Producers
          </h1>
=======
          <div className="flex items-center justify-between mb-4">
            <h1 data-testid="page-title" className="text-3xl font-bold text-gray-900">
              Φρέσκα Προϊόντα από Τοπικούς Παραγωγούς
            </h1>
            {searchTerms.length > 0 && (
              <div className="text-sm text-gray-600">
                {totalResults} αποτελέσματα για "{filters.search}"
              </div>
            )}
          </div>
>>>>>>> 6a6890f (feat: Greek-insensitive search with full localization - PR-B MVP Polish Pack 01)
          
          {/* Enhanced Search and Filters */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
<<<<<<< HEAD
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
=======
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder={getGreekLabel('search.placeholder', 'Αναζήτηση προϊόντων...')}
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {searchTerms.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 text-xs text-gray-500 bg-white px-3 py-1 border border-gray-200 rounded-md shadow-sm z-10">
                    Αναζήτηση για: {searchTerms.slice(0, 3).join(', ')}
                    {searchTerms.length > 3 && ` +${searchTerms.length - 3} ακόμη`}
                  </div>
                )}
>>>>>>> 6a6890f (feat: Greek-insensitive search with full localization - PR-B MVP Polish Pack 01)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
<<<<<<< HEAD
                  Filters
=======
                  {getGreekLabel('search.filters', 'Φίλτρα')}
>>>>>>> 6a6890f (feat: Greek-insensitive search with full localization - PR-B MVP Polish Pack 01)
                  {hasActiveFilters && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      {Object.values(filters).filter(v => v && v !== 'created_at' && v !== 'desc').length}
                    </span>
                  )}
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
<<<<<<< HEAD
                    Clear All
=======
                    {getGreekLabel('search.clearAll', 'Καθαρισμός όλων')}
>>>>>>> 6a6890f (feat: Greek-insensitive search with full localization - PR-B MVP Polish Pack 01)
                  </button>
                )}
              </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="bg-white p-6 rounded-lg shadow-md border">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Category Filter */}
                  <div>
<<<<<<< HEAD
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
=======
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {getGreekLabel('search.category', 'Κατηγορία')}
                    </label>
>>>>>>> 6a6890f (feat: Greek-insensitive search with full localization - PR-B MVP Polish Pack 01)
                    <select
                      value={filters.category}
                      onChange={(e) => updateFilter('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
<<<<<<< HEAD
                      <option value="">All Categories</option>
=======
                      <option value="">{getGreekLabel('search.allCategories', 'Όλες οι κατηγορίες')}</option>
>>>>>>> 6a6890f (feat: Greek-insensitive search with full localization - PR-B MVP Polish Pack 01)
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Producer Filter */}
                  <div>
<<<<<<< HEAD
                    <label className="block text-sm font-medium text-gray-700 mb-2">Producer</label>
=======
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {getGreekLabel('search.producer', 'Παραγωγός')}
                    </label>
>>>>>>> 6a6890f (feat: Greek-insensitive search with full localization - PR-B MVP Polish Pack 01)
                    <select
                      value={filters.producer}
                      onChange={(e) => updateFilter('producer', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
<<<<<<< HEAD
                      <option value="">All Producers</option>
=======
                      <option value="">{getGreekLabel('search.allProducers', 'Όλοι οι παραγωγοί')}</option>
>>>>>>> 6a6890f (feat: Greek-insensitive search with full localization - PR-B MVP Polish Pack 01)
                      {producers.map((producer) => (
                        <option key={producer.id} value={producer.id}>
                          {producer.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range */}
                  <div>
<<<<<<< HEAD
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (€)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
=======
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {getGreekLabel('search.priceRange', 'Εύρος Τιμών')} (€)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Ελάχιστο"
>>>>>>> 6a6890f (feat: Greek-insensitive search with full localization - PR-B MVP Polish Pack 01)
                        value={filters.minPrice}
                        onChange={(e) => updateFilter('minPrice', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <span className="self-center text-gray-500">-</span>
                      <input
                        type="number"
<<<<<<< HEAD
                        placeholder="Max"
=======
                        placeholder="Μέγιστο"
>>>>>>> 6a6890f (feat: Greek-insensitive search with full localization - PR-B MVP Polish Pack 01)
                        value={filters.maxPrice}
                        onChange={(e) => updateFilter('maxPrice', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Sort and Organic */}
                  <div className="space-y-4">
                    {/* Sort Options */}
                    <div>
<<<<<<< HEAD
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
=======
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {getGreekLabel('search.sortBy', 'Ταξινόμηση')}
                      </label>
>>>>>>> 6a6890f (feat: Greek-insensitive search with full localization - PR-B MVP Polish Pack 01)
                      <div className="flex gap-2">
                        <select
                          value={filters.sort}
                          onChange={(e) => updateFilter('sort', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
<<<<<<< HEAD
                          <option value="created_at">Newest</option>
                          <option value="name">Name</option>
                          <option value="price">Price</option>
=======
                          <option value="created_at">{getGreekLabel('sort.newest', 'Νεότερα πρώτα')}</option>
                          <option value="name">{getGreekLabel('sort.nameAsc', 'Όνομα')}</option>
                          <option value="price">{getGreekLabel('sort.priceAsc', 'Τιμή')}</option>
>>>>>>> 6a6890f (feat: Greek-insensitive search with full localization - PR-B MVP Polish Pack 01)
                        </select>
                        <select
                          value={filters.dir}
                          onChange={(e) => updateFilter('dir', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="asc">↑</option>
                          <option value="desc">↓</option>
                        </select>
                      </div>
                    </div>

                    {/* Organic Filter */}
                    <div>
<<<<<<< HEAD
                      <label className="block text-sm font-medium text-gray-700 mb-2">Organic</label>
=======
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {getGreekLabel('search.organic', 'Βιολογικό')}
                      </label>
>>>>>>> 6a6890f (feat: Greek-insensitive search with full localization - PR-B MVP Polish Pack 01)
                      <select
                        value={filters.organic === null ? '' : filters.organic.toString()}
                        onChange={(e) => updateFilter('organic', e.target.value === '' ? null : e.target.value === 'true')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
<<<<<<< HEAD
                        <option value="">All Products</option>
                        <option value="true">Organic Only</option>
                        <option value="false">Non-Organic</option>
=======
                        <option value="">{getGreekLabel('search.allProducts', 'Όλα τα προϊόντα')}</option>
                        <option value="true">{getGreekLabel('search.organicOnly', 'Μόνο βιολογικά')}</option>
                        <option value="false">{getGreekLabel('search.nonOrganic', 'Μη βιολογικά')}</option>
>>>>>>> 6a6890f (feat: Greek-insensitive search with full localization - PR-B MVP Polish Pack 01)
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
<<<<<<< HEAD
          <LoadingSpinner text="Loading fresh products..." />
        ) : error ? (
          <ErrorState
            title="Unable to load products"
            message={error}
            onRetry={loadProducts}
=======
          <LoadingSpinner text="Φόρτωση φρέσκων προϊόντων..." />
        ) : error ? (
          <ErrorState
            title="Αδυναμία φόρτωσης προϊόντων"
            message={error}
            onRetry={refreshProducts}
>>>>>>> 6a6890f (feat: Greek-insensitive search with full localization - PR-B MVP Polish Pack 01)
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} data-testid="product-card" className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Product Image Placeholder */}
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  {product.images.length > 0 ? (
                    <img
                      data-testid="product-image"
                      src={product.images[0].url || product.images[0].image_path}
                      alt={product.images[0].alt_text || product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">No Image</span>
                  )}
                </div>

                <div className="p-4">
                  <h3 data-testid="product-title" className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-2">
<<<<<<< HEAD
                    By {product.producer.name}
=======
                    Από τον {product.producer.name}
>>>>>>> 6a6890f (feat: Greek-insensitive search with full localization - PR-B MVP Polish Pack 01)
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span data-testid="product-price" className="text-xl font-bold text-green-600">
<<<<<<< HEAD
                      €{product.price} / {product.unit}
                    </span>
                    {product.stock !== null && (
                      <span className="text-sm text-gray-500">
                        Stock: {product.stock}
=======
                      {formatGreekCurrency(parseFloat(product.price))} / {product.unit}
                    </span>
                    {product.stock !== null && (
                      <span className="text-sm text-gray-500">
                        {getGreekLabel('product.stock', 'Απόθεμα')}: {product.stock}
>>>>>>> 6a6890f (feat: Greek-insensitive search with full localization - PR-B MVP Polish Pack 01)
                      </span>
                    )}
                  </div>

                  {/* Categories */}
                  {product.categories.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {product.categories.slice(0, 2).map((category) => (
                          <span
                            key={category.id}
                            className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                          >
                            {category.name}
                          </span>
                        ))}
                        {product.categories.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{product.categories.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link
                      href={`/products/${product.id}`}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-center text-sm font-medium"
                    >
<<<<<<< HEAD
                      View Details
=======
                      {getGreekLabel('product.viewDetails', 'Δείτε λεπτομέρειες')}
>>>>>>> 6a6890f (feat: Greek-insensitive search with full localization - PR-B MVP Polish Pack 01)
                    </Link>
                    <button
                      data-testid="add-to-cart"
                      onClick={() => handleAddToCart(product.id)}
<<<<<<< HEAD
                      disabled={product.stock === 0}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
=======
                      disabled={product.stock === 0 || cartLoading}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {cartLoading ? (
                        <span className="flex items-center justify-center gap-1">
                          <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          ...
                        </span>
                      ) : product.stock === 0 ? 
                        getGreekLabel('product.outOfStock', 'Μη διαθέσιμο') : 
                        getGreekLabel('product.addToCart', 'Προσθήκη στο καλάθι')
                      }
>>>>>>> 6a6890f (feat: Greek-insensitive search with full localization - PR-B MVP Polish Pack 01)
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {products.length === 0 && !loading && !error && (
          <EmptyState
            icon={
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
<<<<<<< HEAD
            title="No products found"
            description={hasActiveFilters ? 
              "We couldn't find any products matching your search criteria. Try adjusting your filters or search terms." :
              "No products are currently available. Check back soon for fresh local produce!"
            }
            actionLabel={hasActiveFilters ? "Clear Filters" : undefined}
=======
            title={getGreekLabel('search.noResults', 'Δεν βρέθηκαν προϊόντα')}
            description={hasActiveFilters ? 
              "Δεν μπορέσαμε να βρούμε προϊόντα που να ταιριάζουν με τα κριτήρια αναζήτησης. Δοκιμάστε να προσαρμόσετε τα φίλτρα ή τους όρους αναζήτησης." :
              "Δεν υπάρχουν διαθέσιμα προϊόντα αυτή τη στιγμή. Επιστρέψτε σύντομα για φρέσκα τοπικά προϊόντα!"
            }
            actionLabel={hasActiveFilters ? getGreekLabel('search.clearAll', 'Καθαρισμός φίλτρων') : undefined}
>>>>>>> 6a6890f (feat: Greek-insensitive search with full localization - PR-B MVP Polish Pack 01)
            onAction={hasActiveFilters ? clearAllFilters : undefined}
          />
        )}
      </main>
    </div>
  );
}
