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
      showSuccess('Added to cart!');
    } catch {
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
      name: 'Φρέσκα τοπικά προϊόντα',
      description: 'Βιολογικά προϊόντα από τοπικούς Έλληνες παραγωγούς',
      url: siteUrl,
      numberOfItems: list.length,
      itemListElement: list.slice(0, 10).map((product, index) => ({
        '@type': 'Product',
        position: index + 1,
        name: product?.name || 'Product',
        description: product?.description || 'Φρέσκο προϊόν από τοπικό παραγωγό',
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
        category: product?.categories?.[0]?.name || (product as { category?: { name?: string } })?.category?.name || 'Fresh Produce',
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
              Φρέσκα Προϊόντα από Τοπικούς Παραγωγούς
            </h1>
            <p className="text-lg md:text-xl text-neutral-700 mb-8 leading-relaxed px-4">
              Ανακαλύψτε βιολογικά λαχανικά, τοπικά προϊόντα και φρέσκα φρούτα απευθείας από Έλληνες παραγωγούς.
              Υποστηρίξτε τη βιώσιμη γεωργία και απολαύστε την καλύτερη ποιότητα.
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