'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import ProductImage from '@/components/product/ProductImage';
import { apiClient, Product } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { greekNormalize, greekTextContains } from '@/lib/utils/greekNormalize';
import StarRating from '@/components/StarRating';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dixis.gr";

interface Filters {
  search: string;
  category: string;
  producer: string;
  minPrice: string;
  maxPrice: string;
  organic: boolean | null;
  cultivationType: string;
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
    cultivationType: '',
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
      setError(err instanceof Error ? err.message : 'Αποτυχία φόρτωσης προϊόντων');
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
      cultivationType: '',
      sort: 'created_at',
      dir: 'desc'
    });
  }, []);

  const hasActiveFilters = useMemo(() =>
    filters.search || filters.category || filters.producer ||
    filters.minPrice || filters.maxPrice || filters.organic !== null || filters.cultivationType,
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
      showSuccess('Προστέθηκε στο καλάθι!');
    } catch {
      showError('Αποτυχία προσθήκης στο καλάθι');
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
      name: 'Αυθεντικά Ελληνικά Προϊόντα',
      description: 'Παραδοσιακά προϊόντα απευθείας από Έλληνες παραγωγούς',
      url: siteUrl,
      numberOfItems: list.length,
      itemListElement: list.slice(0, 10).map((product, index) => ({
        '@type': 'Product',
        position: index + 1,
        name: product?.name || 'Product',
        description: product?.description || 'Αυθεντικό ελληνικό προϊόν από Έλληνα παραγωγό',
        image: product?.images?.[0]?.url || product?.images?.[0]?.image_path || undefined,
        offers: {
          '@type': 'Offer',
          price: product?.price || 0,
          priceCurrency: (product as { currency?: string })?.currency || 'EUR',
          availability: (product?.stock ?? 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: product?.producer?.name || 'Τοπικός Παραγωγός',
          },
        },
        brand: {
          '@type': 'Brand',
          name: (product as { brand?: string })?.brand || product?.producer?.name || 'Dixis',
        },
        category: product?.categories?.[0]?.name || (product as { category?: { name?: string } })?.category?.name || 'Artisan Products',
      })),
    };
  };

  // Defensive: ensure products is always an array
  const safeProducts = Array.isArray(products) ? products : [];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Products JSON-LD */}
      {safeProducts.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateProductsJsonLd()),
          }}
        />
      )}
      
      <main id="main-content" data-testid="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section - Mobile First */}
        <section className="py-12 md:py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary-pale via-primary-pale/30 to-white mb-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1
              data-testid="page-title"
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-primary leading-tight"
            >
              Αυθεντικά Ελληνικά Προϊόντα από Έλληνες Παραγωγούς
            </h1>
            <p className="text-lg md:text-xl text-neutral-700 mb-8 leading-relaxed px-4">
              Ανακαλύψτε ελαιόλαδο, μέλι, βότανα και χειροποίητα προϊόντα απευθείας από Έλληνες παραγωγούς.
              Υποστηρίξτε τους τοπικούς παραγωγούς και απολαύστε την καλύτερη ποιότητα.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="#products"
                className="inline-flex items-center justify-center min-h-[48px] px-8 py-3 bg-primary text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:bg-primary-light transition-all duration-200 touch-manipulation active:scale-95 w-full sm:w-auto"
              >
                Εξερεύνησε Προϊόντα
              </a>
              <Link
                href="/producers"
                className="inline-flex items-center justify-center min-h-[48px] px-8 py-3 bg-white text-primary font-semibold rounded-lg border-2 border-primary hover:bg-primary-pale transition-colors duration-200 touch-manipulation active:scale-95 w-full sm:w-auto"
              >
                Γίνε Παραγωγός
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-10 mb-6">
          <h2 className="text-2xl font-bold text-center text-neutral-800 mb-8">
            Πώς Λειτουργεί
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-primary-pale rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-neutral-800 mb-2">Ανακαλύψτε</h3>
              <p className="text-sm text-neutral-600">Βρείτε τοπικά προϊόντα από πιστοποιημένους Έλληνες παραγωγούς</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-accent-cream rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-accent-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
              </div>
              <h3 className="font-semibold text-neutral-800 mb-2">Παραγγείλτε</h3>
              <p className="text-sm text-neutral-600">Προσθέστε στο καλάθι και πληρώστε με κάρτα</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h3 className="font-semibold text-neutral-800 mb-2">Παραλάβετε</h3>
              <p className="text-sm text-neutral-600">Λάβετε τα προϊόντα στην πόρτα σας, απευθείας από τον παραγωγό</p>
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-6 mb-8 py-4 border-t border-b border-neutral-200">
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Ασφαλείς Πληρωμές</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <svg className="w-5 h-5 text-accent-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Απευθείας από Παραγωγούς</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
            </svg>
            <span>100% Ελληνικά Προϊόντα</span>
          </div>
        </div>

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
                    className="w-full px-4 py-2 pr-10 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {/* Search type indicator */}
                  {filters.search && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                      {searchState.isGreek && (
                        <span className="text-xs text-primary font-medium" title="Ελληνικό κείμενο">ΕΛ</span>
                      )}
                      {searchState.isLatin && (
                        <span className="text-xs text-blue-600 font-medium" title="Λατινικό κείμενο (θα μεταγραφεί)">EN</span>
                      )}
                      {searchState.variants.length > 1 && (
                        <span className="text-xs text-purple-600 font-medium" title={`${searchState.variants.length} παραλλαγές αναζήτησης`}>+{searchState.variants.length - 1}</span>
                      )}
                    </div>
                  )}
                </div>
                {/* Search hints for Greek normalization */}
                {filters.search && searchState.variants.length > 1 && (
                  <div className="mt-2 text-xs text-neutral-600">
                    <span className="font-medium">Αναζήτηση για:</span> {searchState.variants.slice(0, 3).join(', ')}
                    {searchState.variants.length > 3 && ` +${searchState.variants.length - 3} ακόμη παραλλαγές`}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Φίλτρα
                  {hasActiveFilters && (
                    <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                      {Object.values(filters).filter(v => v && v !== 'created_at' && v !== 'desc').length}
                    </span>
                  )}
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 text-neutral-600 hover:text-neutral-800"
                  >
                    Καθαρισμός
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
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Κατηγορία</label>
                    <select
                      value={filters.category}
                      onChange={(e) => updateFilter('category', e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Όλες οι κατηγορίες</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Producer Filter */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Παραγωγός</label>
                    <select
                      value={filters.producer}
                      onChange={(e) => updateFilter('producer', e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Όλοι οι παραγωγοί</option>
                      {producers.map((producer) => (
                        <option key={producer.id} value={producer.id}>
                          {producer.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Εύρος τιμής (€)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Ελάχ."
                        value={filters.minPrice}
                        onChange={(e) => updateFilter('minPrice', e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <span className="self-center text-neutral-500">-</span>
                      <input
                        type="number"
                        placeholder="Μέγ."
                        value={filters.maxPrice}
                        onChange={(e) => updateFilter('maxPrice', e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Sort and Organic */}
                  <div className="space-y-4">
                    {/* Sort Options */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Ταξινόμηση</label>
                      <div className="flex gap-2">
                        <select
                          value={filters.sort}
                          onChange={(e) => updateFilter('sort', e.target.value)}
                          className="flex-1 px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="created_at">Νεότερα</option>
                          <option value="name">Όνομα</option>
                          <option value="price">Τιμή</option>
                        </select>
                        <select
                          value={filters.dir}
                          onChange={(e) => updateFilter('dir', e.target.value)}
                          className="px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="asc">↑</option>
                          <option value="desc">↓</option>
                        </select>
                      </div>
                    </div>

                    {/* S1-01: Cultivation Type Filter */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Καλλιέργεια</label>
                      <select
                        value={filters.cultivationType}
                        onChange={(e) => updateFilter('cultivationType', e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">Όλοι οι τύποι</option>
                        <option value="organic_certified">🌿 Βιολογική (Πιστοποιημένη)</option>
                        <option value="organic_transitional">🌱 Βιολογική (Μεταβατική)</option>
                        <option value="biodynamic">✨ Βιοδυναμική</option>
                        <option value="traditional_natural">🌾 Παραδοσιακή / Φυσική</option>
                        <option value="conventional">Συμβατική</option>
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
          <LoadingSpinner text="Φόρτωση προϊόντων..." />
        ) : error ? (
          <ErrorState
            title="Αδυναμία φόρτωσης προϊόντων"
            message={error}
            onRetry={loadProducts}
          />
        ) : (
          <div id="products" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 scroll-mt-20">
            {safeProducts.map((product) => (
              <div key={product.id} data-testid="product-card" className="relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <ProductImage
                  src={product.images[0]?.url || product.images[0]?.image_path || '/placeholder.jpg'}
                  alt={product.images[0]?.alt_text || product.name}
                  priority={products.indexOf(product) < 4}
                  data-testid="product-image-timeout"
                />

                <div className="p-4">
                  <h3 data-testid="product-title" className="text-lg font-semibold text-neutral-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <p className="text-sm text-neutral-600 mb-1">
                    Από {product.producer.name}
                  </p>

                  {/* S1-02: Star rating on cards */}
                  {product.reviews_avg_rating && (
                    <div className="mb-1">
                      <StarRating rating={product.reviews_avg_rating} count={product.reviews_count} size="xs" />
                    </div>
                  )}

                  {/* S1-01: Cultivation type mini-badge */}
                  {product.cultivation_type && product.cultivation_type !== 'conventional' && (
                    <span className={`inline-block px-2 py-0.5 mb-2 rounded-full text-[10px] font-medium ${
                      product.cultivation_type === 'organic_certified' ? 'bg-green-100 text-green-800' :
                      product.cultivation_type === 'organic_transitional' ? 'bg-lime-100 text-lime-800' :
                      product.cultivation_type === 'biodynamic' ? 'bg-purple-100 text-purple-800' :
                      product.cultivation_type === 'traditional_natural' ? 'bg-amber-100 text-amber-800' :
                      'bg-neutral-100 text-neutral-600'
                    }`}>
                      {product.cultivation_type === 'organic_certified' ? '🌿 Βιολογικό' :
                       product.cultivation_type === 'organic_transitional' ? '🌱 Βιολογικό (Μεταβ.)' :
                       product.cultivation_type === 'biodynamic' ? '✨ Βιοδυναμικό' :
                       product.cultivation_type === 'traditional_natural' ? '🌾 Παραδοσιακό' :
                       product.cultivation_type}
                    </span>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <span data-testid="product-price" className="text-xl font-bold text-primary">
                      €{product.price} / {product.unit}
                    </span>
                    {product.stock !== null && (
                      <span className="text-sm text-neutral-500">
                        Απόθεμα: {product.stock}
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
                            className="px-2 py-1 bg-primary-pale text-primary text-xs rounded-full"
                          >
                            {category.name}
                          </span>
                        ))}
                        {product.categories.length > 2 && (
                          <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-full">
                            +{product.categories.length - 2} ακόμη
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link
                      href={`/products/${product.id}`}
                      data-testid="product-view-details"
                      className="relative z-10 flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-4 py-2 rounded-lg text-center text-sm font-medium"
                    >
                      Λεπτομέρειες
                    </Link>
                    <button
                      data-testid="add-to-cart"
                      onClick={() => handleAddToCart(product.id)}
                      disabled={product.stock === 0 || addingToCart.has(product.id)}
                      className="flex-1 bg-primary hover:bg-primary-light disabled:bg-neutral-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      aria-label={`Προσθήκη ${product.name} στο καλάθι`}
                    >
                      {product.stock === 0
                        ? 'Εξαντλήθηκε'
                        : addingToCart.has(product.id)
                          ? 'Προσθήκη...'
                          : 'Στο καλάθι'
                      }
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {safeProducts.length === 0 && !loading && !error && (
          <div data-testid="home-empty" className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">Δεν βρέθηκαν προϊόντα</h3>
            <p className="text-sm text-neutral-500 mb-4">Δοκιμάστε να αλλάξετε τα φίλτρα ή κάντε ανανέωση.</p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors text-sm font-medium"
              >
                Καθαρισμός Φίλτρων
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { try { window.location.reload(); } catch { /* noop */ } }}
                className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-medium text-neutral-700"
              >
                Ανανέωση
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}