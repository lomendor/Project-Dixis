'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import ProductImage from '@/components/product/ProductImage';
import { apiClient, Product } from '@/lib/api';
import Navigation from '@/components/Navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { greekNormalize, greekTextContains } from '@/lib/utils/greekNormalize';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dixis.gr";

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

interface HomeClientProps {
  initialProducts: Product[];
}

export default function HomeClient({ initialProducts }: HomeClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [producers, setProducers] = useState<{id: number, name: string}[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
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

  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      // Extract categories and producers from initial data
      const uniqueCategories = Array.from(new Set(
        initialProducts.flatMap(p => p.categories.map(c => c.name))
      )).sort();
      setCategories(uniqueCategories);

      const uniqueProducers = Array.from(
        new Map(
          initialProducts.map(p => [
            p.producer.id,
            { id: p.producer.id, name: p.producer.name || p.producer.business_name }
          ])
        ).values()
      ).sort((a, b) => a.name.localeCompare(b.name));
      setProducers(uniqueProducers);
      return;
    }
    loadProducts();
  }, [filters, loadProducts, isInitialLoad, initialProducts]);

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

  // Generate JSON-LD for products with safe-guards  
  const generateProductsJsonLd = () => {
    const list = Array.isArray(products) ? products : [];
    if (list.length === 0) return null; // skip script when empty
    
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Fresh Local Products',
      description: 'Premium organic products from local Greek producers',
      url: siteUrl,
      numberOfItems: list.length,
      itemListElement: list.slice(0, 10).map((product, index) => ({
        '@type': 'Product',
        position: index + 1,
        name: product?.name || 'Product',
        description: product?.description || `Fresh product from local producer`,
        image: product?.images?.[0]?.url || product?.images?.[0]?.image_path || undefined,
        offers: {
          '@type': 'Offer',
          price: product?.price || 0,
          priceCurrency: (product as { currency?: string })?.currency || 'EUR',
          availability: (product?.stock ?? 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: product?.producer?.name || 'Local Producer',
          },
        },
        brand: {
          '@type': 'Brand',
          name: (product as { brand?: string })?.brand || product?.producer?.name || 'Dixis',
        },
        category: product?.categories?.[0]?.name || (product as { category?: { name?: string } })?.category?.name || 'Fresh Produce',
      })),
    };
  };

  // Defensive: ensure products is always an array
  const safeProducts = Array.isArray(products) ? products : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Products JSON-LD */}
      {safeProducts.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateProductsJsonLd()),
          }}
        />
      )}
      
      <Navigation />
      
      <main id="main-content" data-testid="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section - Mobile First */}
        <section className="py-12 md:py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-green-50 via-emerald-50/30 to-white mb-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1
              data-testid="page-title"
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-green-800 via-emerald-700 to-green-600 bg-clip-text text-transparent leading-tight"
            >
              Φρέσκα Προϊόντα από Τοπικούς Παραγωγούς
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed px-4">
              Ανακαλύψτε βιολογικά λαχανικά, τοπικά προϊόντα και φρέσκα φρούτα απευθείας από Έλληνες παραγωγούς.
              Υποστηρίξτε τη βιώσιμη γεωργία και απολαύστε την καλύτερη ποιότητα.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="#products"
                className="inline-flex items-center justify-center min-h-[48px] px-8 py-3 bg-gradient-to-r from-green-700 to-emerald-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:from-green-800 hover:to-emerald-700 transition-all duration-200 touch-manipulation active:scale-95 w-full sm:w-auto"
              >
                Εξερεύνησε Προϊόντα
              </a>
              <Link
                href="/producers"
                className="inline-flex items-center justify-center min-h-[48px] px-8 py-3 bg-white text-green-700 font-semibold rounded-lg border-2 border-green-700 hover:bg-green-50 transition-colors duration-200 touch-manipulation active:scale-95 w-full sm:w-auto"
              >
                Γίνε Παραγωγός
              </Link>
            </div>
          </div>
        </section>

        {/* Search & Filters Section */}
        <div className="py-6">
          
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
          <div id="products" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 scroll-mt-20">
            {safeProducts.map((product) => (
              <div
                key={product.id}
                data-testid="product-card"
                className="relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:-translate-y-1"
              >
                {/* Product Image with Aspect Ratio */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <ProductImage
                    src={product.images[0]?.url || product.images[0]?.image_path || '/placeholder.jpg'}
                    alt={product.images[0]?.alt_text || product.name}
                    priority={products.indexOf(product) < 4}
                    data-testid="product-image-timeout"
                  />
                </div>

                <div className="p-5 md:p-6">
                  <h3 data-testid="product-title" className="text-lg md:text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-700 transition-colors">
                    {product.name}
                  </h3>

                  <p className="text-sm text-gray-600 mb-3">
                    από {product.producer.name}
                  </p>

                  <div className="flex items-baseline justify-between mb-4">
                    <div>
                      <span data-testid="product-price" className="text-2xl font-bold text-green-700">
                        €{product.price}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">/ {product.unit}</span>
                    </div>
                    {product.stock !== null && (
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {product.stock > 0 ? `${product.stock} διαθέσιμα` : 'Εξαντλημένο'}
                      </span>
                    )}
                  </div>

                  {/* Categories - Larger badges */}
                  {product.categories.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {product.categories.slice(0, 2).map((category) => (
                          <span
                            key={category.id}
                            className="px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-xs font-medium rounded-full"
                          >
                            {category.name}
                          </span>
                        ))}
                        {product.categories.length > 2 && (
                          <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                            +{product.categories.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Touch-Friendly Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href={`/products/${product.id}`}
                      data-testid="product-view-details"
                      className="relative z-10 flex-1 inline-flex items-center justify-center min-h-[48px] bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-3 rounded-lg text-center text-sm font-semibold transition-all active:scale-95 touch-manipulation"
                    >
                      Προβολή
                    </Link>
                    <button
                      data-testid="add-to-cart"
                      onClick={() => handleAddToCart(product.id)}
                      disabled={product.stock === 0 || addingToCart.has(product.id)}
                      className="flex-1 inline-flex items-center justify-center min-h-[48px] bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 active:scale-95 touch-manipulation shadow-md hover:shadow-lg"
                      aria-label={`Add ${product.name} to cart`}
                    >
                      {product.stock === 0
                        ? 'Μη Διαθέσιμο'
                        : addingToCart.has(product.id)
                          ? 'Προσθήκη...'
                          : 'Στο Καλάθι'
                      }
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {safeProducts.length === 0 && !loading && !error && (
  <div data-testid="home-empty" style={{padding:24, textAlign:'center'}}>
    <h3 style={{fontWeight:600, fontSize:16, marginBottom:8}}>Δεν υπάρχουν προϊόντα</h3>
    <p style={{color:'#666', fontSize:12, marginBottom:12}}>Προσθέστε προϊόντα ή αλλάξτε φίλτρα.</p>
    <button type="button" onClick={()=>{ try { window.location.reload(); } catch(_) {} }} style={{padding:'6px 12px', border:'1px solid #ddd', borderRadius:6, background:'#fff', cursor:'pointer'}}>
      Ανανέωση
    </button>
  </div>
)}
      </main>
    </div>
  );
}