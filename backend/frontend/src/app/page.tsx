'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { getGreekLabel, formatGreekCurrency } from '@/lib/greekUtils';
import { useGreekSearch } from '@/hooks/useGreekSearch';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const {
    filteredProducts,
    loading,
    error,
    categories,
    producers,
    totalResults,
    filters,
    updateFilter,
    clearAllFilters,
    hasActiveFilters,
    searchTerms,
    refreshProducts
  } = useGreekSearch();

  const [showFilters, setShowFilters] = useState(false);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = '/auth/login';
      return;
    }

    // Simple cart implementation for this PR
    alert('Προστέθηκε στο καλάθι!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 data-testid="page-title" className="text-3xl font-bold text-gray-900">
              Φρέσκα Προϊόντα από Τοπικούς Παραγωγούς
            </h1>
            {searchTerms.length > 0 && (
              <div className="text-sm text-gray-600">
                {totalResults} αποτελέσματα για &ldquo;{filters.search}&rdquo;
              </div>
            )}
          </div>

          {/* Enhanced Search and Filters */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <input
                  type="text"
                  data-testid="search-input"
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
              </div>
              <div className="flex gap-2">
                <button
                  data-testid="filters-button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  {getGreekLabel('search.filters', 'Φίλτρα')}
                  {hasActiveFilters && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      {Object.values(filters).filter(v => v && v !== 'created_at' && v !== 'desc').length}
                    </span>
                  )}
                </button>
                {hasActiveFilters && (
                  <button
                    data-testid="clear-all-button"
                    onClick={clearAllFilters}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    {getGreekLabel('search.clearAll', 'Καθαρισμός όλων')}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {getGreekLabel('search.category', 'Κατηγορία')}
                    </label>
                    <select
                      data-testid="category-select"
                      value={filters.category}
                      onChange={(e) => updateFilter('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">{getGreekLabel('search.allCategories', 'Όλες οι κατηγορίες')}</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Producer Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {getGreekLabel('search.producer', 'Παραγωγός')}
                    </label>
                    <select
                      value={filters.producer}
                      onChange={(e) => updateFilter('producer', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">{getGreekLabel('search.allProducers', 'Όλοι οι παραγωγοί')}</option>
                      {producers.map((producer) => (
                        <option key={producer.id} value={producer.id}>
                          {producer.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {getGreekLabel('search.priceRange', 'Εύρος Τιμών')} (€)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        data-testid="min-price-input"
                        placeholder="Ελάχιστο"
                        value={filters.minPrice}
                        onChange={(e) => updateFilter('minPrice', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <span className="self-center text-gray-500">-</span>
                      <input
                        type="number"
                        data-testid="max-price-input"
                        placeholder="Μέγιστο"
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {getGreekLabel('search.sortBy', 'Ταξινόμηση')}
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={filters.sort}
                          onChange={(e) => updateFilter('sort', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="created_at">{getGreekLabel('sort.newest', 'Νεότερα πρώτα')}</option>
                          <option value="name">{getGreekLabel('sort.nameAsc', 'Όνομα')}</option>
                          <option value="price">{getGreekLabel('sort.priceAsc', 'Τιμή')}</option>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {getGreekLabel('search.organic', 'Βιολογικό')}
                      </label>
                      <select
                        value={filters.organic === null ? '' : filters.organic.toString()}
                        onChange={(e) => updateFilter('organic', e.target.value === '' ? null : e.target.value === 'true')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">{getGreekLabel('search.allProducts', 'Όλα τα προϊόντα')}</option>
                        <option value="true">{getGreekLabel('search.organicOnly', 'Μόνο βιολογικά')}</option>
                        <option value="false">{getGreekLabel('search.nonOrganic', 'Μη βιολογικά')}</option>
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
          <LoadingSpinner text="Φόρτωση φρέσκων προϊόντων..." />
        ) : error ? (
          <ErrorState
            title="Αδυναμία φόρτωσης προϊόντων"
            message={error}
            onRetry={refreshProducts}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
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
                    Από τον {product.producer.name}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <span data-testid="product-price" className="text-xl font-bold text-green-600">
                      {formatGreekCurrency(parseFloat(product.price))} / {product.unit}
                    </span>
                    {product.stock !== null && (
                      <span className="text-sm text-gray-500">
                        {getGreekLabel('product.stock', 'Απόθεμα')}: {product.stock}
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
                      {getGreekLabel('product.viewDetails', 'Δείτε λεπτομέρειες')}
                    </Link>
                    <button
                      data-testid="add-to-cart"
                      onClick={handleAddToCart}
                      disabled={product.stock === 0}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {product.stock === 0 ?
                        getGreekLabel('product.outOfStock', 'Μη διαθέσιμο') :
                        getGreekLabel('product.addToCart', 'Προσθήκη στο καλάθι')
                      }
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && !loading && !error && (
          <EmptyState
            icon={
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
            title={getGreekLabel('search.noResults', 'Δεν βρέθηκαν προϊόντα')}
            description={hasActiveFilters ?
              "Δεν μπορέσαμε να βρούμε προϊόντα που να ταιριάζουν με τα κριτήρια αναζήτησης. Δοκιμάστε να προσαρμόσετε τα φίλτρα ή τους όρους αναζήτησης." :
              "Δεν υπάρχουν διαθέσιμα προϊόντα αυτή τη στιγμή. Επιστρέψτε σύντομα για φρέσκα τοπικά προϊόντα!"
            }
            actionLabel={hasActiveFilters ? getGreekLabel('search.clearAll', 'Καθαρισμός φίλτρων') : undefined}
            onAction={hasActiveFilters ? clearAllFilters : undefined}
          />
        )}
      </main>
    </div>
  );
}