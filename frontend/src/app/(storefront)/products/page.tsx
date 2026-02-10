import { Suspense } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { CategoryStrip } from '@/components/CategoryStrip';
import { ProductSearchInput } from '@/components/ProductSearchInput';
import { DEMO_PRODUCTS } from '@/data/demoProducts';
import { getServerApiUrl } from '@/env';

/**
 * Pass FIX-STOCK-GUARD-01: Added stock field for OOS awareness
 */
type ApiItem = {
  id: string | number;
  title: string;
  producerId?: string | number;
  producerName?: string;
  priceCents: number;
  priceFormatted?: string;
  imageUrl?: string;
  categorySlug?: string;
  stock?: number | null;
};

/**
 * Pass SEARCH-FTS-01: Fetch products with optional search parameter.
 * Uses FTS ranking on PostgreSQL backend, ILIKE fallback on others.
 *
 * Pass PERF-PRODUCTS-CACHE-01: Added time-based revalidation.
 * - revalidate: 60 = cache for 60 seconds, then revalidate in background
 * - Each unique search query gets its own cache entry (Next.js caches by full URL)
 * - Balance: fresh enough for inventory changes, fast enough for good UX
 */
async function getData(search?: string): Promise<{ items: ApiItem[]; total: number; isDemo: boolean }> {
  // Use internal URL for SSR to avoid external round-trip timeout (Pass 26 fix)
  // CRITICAL: No localhost fallback - use relative URL if not configured
  // SSOT: Use centralized env resolution (see src/env.ts)
  const isServer = typeof window === 'undefined';
  const base = isServer
    ? getServerApiUrl()
    : (process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1');

  try {
    // Build URL with search param if provided
    const url = new URL(`${base}/public/products`, 'http://localhost');
    if (search?.trim()) {
      url.searchParams.set('search', search.trim());
    }
    const endpoint = url.pathname + url.search;

    const res = await fetch(`${base}/public/products${search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''}`, {
      // Pass PERF-PRODUCTS-CACHE-01: Cache response for 60s, revalidate in background
      next: { revalidate: 60 },
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      console.error('[Products] API fetch failed:', res.status, res.statusText);
      // Fall back to demo products (filtered client-side if search provided)
      const demoItems = mapDemoToApiItems(DEMO_PRODUCTS);
      const filtered = search ? filterDemoBySearch(demoItems, search) : demoItems;
      return { items: filtered, total: filtered.length, isDemo: true };
    }

    const json = await res.json();
    const products = json?.data ?? [];

    if (products.length === 0 && !search) {
      console.log('[Products] API returned empty, using demo fallback');
      return { items: mapDemoToApiItems(DEMO_PRODUCTS), total: DEMO_PRODUCTS.length, isDemo: true };
    }

    // Map backend format to frontend format
    // Pass FIX-STOCK-GUARD-01: Include stock for OOS check
    const items = products.map((p: any) => ({
      id: p.id,
      title: p.name,
      producerId: p.producer?.id || null,
      producerName: p.producer?.name || null,
      priceCents: Math.round(parseFloat(p.price) * 100),
      imageUrl: p.image_url,
      categorySlug: p.category || null,
      stock: typeof p.stock === 'number' ? p.stock : null,
    }));

    return { items, total: items.length, isDemo: false };
  } catch (err) {
    console.error('[Products] Fetch error (falling back to demo):', err);
    const demoItems = mapDemoToApiItems(DEMO_PRODUCTS);
    const filtered = search ? filterDemoBySearch(demoItems, search) : demoItems;
    return { items: filtered, total: filtered.length, isDemo: true };
  }
}

// Convert demo products to API item format
function mapDemoToApiItems(demoProducts: typeof DEMO_PRODUCTS): ApiItem[] {
  return demoProducts.map((p) => ({
    id: p.id,
    title: p.name,
    producerId: p.producerId,
    producerName: p.producerName,
    priceCents: p.priceCents,
    imageUrl: p.imageUrl,
    categorySlug: p.categorySlug,
  }));
}

// Filter demo products by search term (client-side fallback)
function filterDemoBySearch(items: ApiItem[], search: string): ApiItem[] {
  const term = search.toLowerCase().trim();
  if (!term) return items;
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(term) ||
      (item.producerName && item.producerName.toLowerCase().includes(term))
  );
}

// Filter items by category
function filterByCategory(items: ApiItem[], categorySlug: string | null): ApiItem[] {
  if (!categorySlug) return items;
  return items.filter((item) => item.categorySlug === categorySlug);
}

interface PageProps {
  searchParams: Promise<{ cat?: string; search?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const categoryFilter = params.cat || null;
  const searchQuery = params.search || null;

  const { items: allItems = [], isDemo } = await getData(searchQuery || undefined);
  const items = filterByCategory(allItems, categoryFilter);
  const total = items.length;

  // Determine appropriate message for empty state
  const getEmptyMessage = () => {
    if (searchQuery && categoryFilter) {
      return `Δεν βρέθηκαν προϊόντα για "${searchQuery}" σε αυτή την κατηγορία.`;
    }
    if (searchQuery) {
      return `Δεν βρέθηκαν προϊόντα για "${searchQuery}".`;
    }
    if (categoryFilter) {
      return 'Δεν υπάρχουν προϊόντα σε αυτή την κατηγορία.';
    }
    return 'Δεν υπάρχουν διαθέσιμα προϊόντα αυτή τη στιγμή.';
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Demo mode banner */}
        {isDemo && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
            <span className="font-medium">Λειτουργία demo:</span> Περιορισμένα δεδομένα (DB offline).
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Προϊόντα</h1>
            <p className="mt-1 text-sm text-gray-600">
              {searchQuery
                ? `${total} αποτέλεσμα${total !== 1 ? 'τα' : ''} για "${searchQuery}"`
                : `Απευθείας από παραγωγούς — ${total} ${categoryFilter ? 'στην κατηγορία' : 'συνολικά'}.`}
            </p>
          </div>

          {/* Search Input */}
          <Suspense fallback={<div className="h-10 w-full max-w-md bg-gray-100 rounded-lg animate-pulse" />}>
            <ProductSearchInput />
          </Suspense>
        </div>

        {/* Category Strip */}
        <div className="mb-6">
          <Suspense fallback={<div className="h-10 bg-gray-100 rounded animate-pulse" />}>
            <CategoryStrip selectedCategory={categoryFilter} />
          </Suspense>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Pass FIX-STOCK-GUARD-01: Include stock for OOS check */}
            {items.map((p: ApiItem) => (
              <ProductCard
                key={p.id}
                id={p.id}
                title={p.title}
                producer={p.producerName || null}
                producerId={p.producerId}
                priceCents={p.priceCents}
                image={p.imageUrl}
                stock={p.stock}
              />
            ))}
          </div>
        ) : (
          <div
            className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300"
            data-testid="no-results"
          >
            <p className="text-gray-500 text-lg">{getEmptyMessage()}</p>
          </div>
        )}
      </div>
    </main>
  );
}
