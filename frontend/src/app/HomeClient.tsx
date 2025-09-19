'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { apiClient, Product } from '@/lib/api';
import Navigation from '@/components/Navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { greekNormalize, greekTextContains } from '@/lib/utils/greekNormalize';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://projectdixis.com";

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

interface SearchState {
  query: string;
  normalizedQuery: string;
  variants: string[];
  isGreek: boolean;
  isLatin: boolean;
}

export default function HomeClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [producers, setProducers] = useState<{id: number, name: string}[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [addingToCart, setAddingToCart] = useState<Set<number>>(new Set());
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
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    normalizedQuery: '',
    variants: [],
    isGreek: false,
    isLatin: false
  });
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params: {
        per_page?: number;
        search?: string;
        category?: string;
        sort?: string;
        page?: number;
      } = {
        per_page: 20,
      };
      
      // Don't pass search to API - do all filtering client-side for Greek normalization
      if (filters.category) params.category = filters.category;
      if (filters.sort) params.sort = filters.sort;
      
      const response = await apiClient.getProducts(params);
      let products = response.data;
      
      // Apply client-side Greek-aware filtering if search query exists
      if (filters.search) {
        products = products.filter(product => {
          // Search in product name, description, categories, and producer name
          const searchableText = [
            product.name,
            product.description || '',
            ...product.categories.map(cat => cat.name),
            product.producer.name || product.producer.business_name
          ].join(' ');
          
          return greekTextContains(searchableText, filters.search);
        });
      }
      
      setProducts(products);
      
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
  }, [filters]);

  const updateFilter = useCallback((key: keyof Filters, value: Filters[keyof Filters]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
    // Update search state when search filter changes
    if (key === 'search' && typeof value === 'string') {
      const normalized = greekNormalize(value);
      setSearchState({
        query: value,
        normalizedQuery: normalized.normalized,
        variants: normalized.variants,
        isGreek: /[\u0370-\u03FF\u1F00-\u1FFF]/.test(value),
        isLatin: /[a-zA-Z]/.test(value) && !/[\u0370-\u03FF\u1F00-\u1FFF]/.test(value)
      });
    }
  }, []);

  const clearAllFilters = useCallback(() => {
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
  }, []);

  const hasActiveFilters = useMemo(() => 
    filters.search || filters.category || filters.producer || 
    filters.minPrice || filters.maxPrice || filters.organic !== null,
    [filters]
  );

  const handleAddToCart = useCallback(async (productId: number) => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = '/auth/login';
      return;
    }

    if (addingToCart.has(productId)) {
      return; // Prevent double-clicking
    }

    setAddingToCart(prev => new Set(prev).add(productId));

    try {
      await apiClient.addToCart(productId, 1);
      showSuccess('Added to cart!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      showError('Failed to add to cart');
    } finally {
      setAddingToCart(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  }, [isAuthenticated, addingToCart, showSuccess, showError]);

  // Generate JSON-LD for products
  const generateProductsJsonLd = () => {
    if (products.length === 0) return null;
    
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Fresh Local Products',
      description: 'Premium organic products from local Greek producers',
      url: siteUrl,
      numberOfItems: products.length,
      itemListElement: products.slice(0, 10).map((product, index) => ({
        '@type': 'Product',
        position: index + 1,
        name: product.name,
        description: product.description || `Fresh ${product.name} from ${product.producer.name}`,
        image: product.images[0]?.url || product.images[0]?.image_path,
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'EUR',
          availability: (product.stock ?? 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: product.producer.name,
          },
        },
        brand: {
          '@type': 'Brand',
          name: product.producer.name,
        },
        category: product.categories[0]?.name || 'Fresh Produce',
      })),
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Products JSON-LD */}
      {products.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateProductsJsonLd()),
          }}
        />
      )}
      
      <Navigation />
      
      <main id="main-content" data-testid="page-root" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 data-testid="page-title" className="text-3xl font-bold text-gray-900 mb-4">
            Fresh Products from Local Producers
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Discover premium organic vegetables, artisanal products, and fresh fruits directly from passionate Greek producers. 
            Support sustainable agriculture while enjoying the finest quality produce delivered fresh to your door.
          </p>
          
          {/* Enhanced Search and Filters */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Αναζήτηση προϊόντων (π.χ. πορτοκάλια, portokalia, Πορτοκάλια)..."
                    value={filters.search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  {/* Search type indicator */}
                  {filters.search && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                      {searchState.isGreek && (
                        <span className="text-xs text-green-600 font-medium" title="Greek text detected">ΕΛ</span>
                      )}
                      {searchState.isLatin && (
                        <span className="text-xs text-blue-600 font-medium" title="Latin text detected (will be transliterated)">EN</span>
                      )}
                      {searchState.variants.length > 1 && (
                        <span className="text-xs text-purple-600 font-medium" title={`${searchState.variants.length} search variants`}>+{searchState.variants.length - 1}</span>
                      )}
                    </div>
                  )}
                </div>
                {/* Search hints for Greek normalization */}
                {filters.search && searchState.variants.length > 1 && (
                  <div className="mt-2 text-xs text-gray-600">
                    <span className="font-medium">Searching for:</span> {searchState.variants.slice(0, 3).join(', ')}
                    {searchState.variants.length > 3 && ` +${searchState.variants.length - 3} more variants`}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
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
                    Clear All
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => updateFilter('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Producer Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Producer</label>
                    <select
                      value={filters.producer}
                      onChange={(e) => updateFilter('producer', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">All Producers</option>
                      {producers.map((producer) => (
                        <option key={producer.id} value={producer.id}>
                          {producer.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (€)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(e) => updateFilter('minPrice', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <span className="self-center text-gray-500">-</span>
                      <input
                        type="number"
                        placeholder="Max"
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                      <div className="flex gap-2">
                        <select
                          value={filters.sort}
                          onChange={(e) => updateFilter('sort', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="created_at">Newest</option>
                          <option value="name">Name</option>
                          <option value="price">Price</option>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Organic</label>
                      <select
                        value={filters.organic === null ? '' : filters.organic.toString()}
                        onChange={(e) => updateFilter('organic', e.target.value === '' ? null : e.target.value === 'true')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">All Products</option>
                        <option value="true">Organic Only</option>
                        <option value="false">Non-Organic</option>
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
          <LoadingSpinner text="Loading fresh products..." />
        ) : error ? (
          <ErrorState
            title="Unable to load products"
            message={error}
            onRetry={loadProducts}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} data-testid="product-card" className="relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Product Image Placeholder */}
                <div className="h-48 bg-gray-200 flex items-center justify-center relative">
                  {product.images.length > 0 ? (
                    <Image
                      data-testid="product-image"
                      src={product.images[0].url || product.images[0].image_path || '/placeholder.jpg'}
                      alt={product.images[0].alt_text || product.name}
                      fill
                      className="object-cover pointer-events-none"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      priority={products.indexOf(product) < 4}
                    />
                  ) : (
                    <div className="flex items-center justify-center text-gray-400 text-sm" role="img" aria-label="No image available">
                      No Image
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 data-testid="product-title" className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    By {product.producer.name}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span data-testid="product-price" className="text-xl font-bold text-green-600">
                      €{product.price} / {product.unit}
                    </span>
                    {product.stock !== null && (
                      <span className="text-sm text-gray-500">
                        Stock: {product.stock}
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
                      data-testid="product-view-details"
                      className="relative z-10 flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-center text-sm font-medium"
                    >
                      View Details
                    </Link>
                    <button
                      data-testid="add-to-cart"
                      onClick={() => handleAddToCart(product.id)}
                      disabled={product.stock === 0 || addingToCart.has(product.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      aria-label={`Add ${product.name} to cart`}
                    >
                      {product.stock === 0 
                        ? 'Out of Stock' 
                        : addingToCart.has(product.id) 
                          ? 'Adding...' 
                          : 'Add to Cart'
                      }
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
            title="No products found"
            description={hasActiveFilters ? 
              "We couldn't find any products matching your search criteria. Try adjusting your filters or search terms." :
              "No products are currently available. Check back soon for fresh local produce!"
            }
            actionLabel={hasActiveFilters ? "Clear Filters" : undefined}
            onAction={hasActiveFilters ? clearAllFilters : undefined}
          />
        )}
      </main>
    </div>
  );
}