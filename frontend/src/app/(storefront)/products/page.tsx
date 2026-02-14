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
  producerSlug?: string;
  priceCents: number;
  priceFormatted?: string;
  imageUrl?: string;
  categorySlug?: string;
  categorySlugs?: string[];
  stock?: number | null;
};

/**
 * FIX-PRODUCTS-PAGINATION: Fetch ALL products with server-side filtering.
 *
 * Key fixes:
 * - per_page=100 to avoid hiding products (was default 15, hid 2 of 17)
 * - category filter sent server-side via ?category=slug (was client-side only)
 * - Extract dynamic categories from API response (no more stale hardcoded slugs)
 *
 * Pass PERF-PRODUCTS-CACHE-01: 60s revalidation still applies.
 */
async function getData(
  search?: string,
  category?: string
): Promise<{ items: ApiItem[]; total: number; isDemo: boolean; apiTotal: number }> {
  const isServer = typeof window === 'undefined';
  const base = isServer
    ? getServerApiUrl()
    : (process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1');

  try {
    // Build URL with all params — let the backend handle filtering
    const params = new URLSearchParams();
    params.set('per_page', '100');
    if (search?.trim()) {
      params.set('search', search.trim());
    }
    if (category) {
      params.set('category', category);
    }

    const res = await fetch(`${base}/public/products?${params.toString()}`, {
      next: { revalidate: 60 },
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      const demoItems = mapDemoToApiItems(DEMO_PRODUCTS);
      const filtered = search ? filterDemoBySearch(demoItems, search) : demoItems;
      return { items: filtered, total: filtered.length, isDemo: true, apiTotal: 0 };
    }

    const json = await res.json();
    const products = json?.data ?? [];
    const apiTotal = json?.total ?? products.length;

    if (products.length === 0 && !search && !category) {
      return {
        items: mapDemoToApiItems(DEMO_PRODUCTS),
        total: DEMO_PRODUCTS.length,
        isDemo: true,
        apiTotal: 0,
      };
    }

    // Map backend format to frontend format
    const items = products.map((p: any) => ({
      id: p.id,
      title: p.name,
      producerId: p.producer?.id || null,
      producerName: p.producer?.name || null,
      producerSlug: p.producer?.slug || null,
      priceCents: Math.round(parseFloat(p.price) * 100),
      imageUrl: p.image_url || p.images?.[0]?.url || null,
      categorySlug: p.categories?.[0]?.slug || p.category || null,
      categorySlugs: p.categories?.map((c: any) => c.slug) || [],
      stock: typeof p.stock === 'number' ? p.stock : null,
    }));

    return { items, total: items.length, isDemo: false, apiTotal };
  } catch {
    const demoItems = mapDemoToApiItems(DEMO_PRODUCTS);
    const filtered = search ? filterDemoBySearch(demoItems, search) : demoItems;
    return { items: filtered, total: filtered.length, isDemo: true, apiTotal: 0 };
  }
}

/**
 * Fetch all products (unfiltered) to extract dynamic categories.
 * Only called when NOT filtering by category, to build the strip.
 * Cached at the same 60s interval.
 */
async function getActiveCategories(): Promise<{ slug: string; name: string; count: number }[]> {
  const isServer = typeof window === 'undefined';
  const base = isServer
    ? getServerApiUrl()
    : (process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1');

  try {
    const res = await fetch(`${base}/public/products?per_page=100`, {
      next: { revalidate: 60 },
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) return [];

    const json = await res.json();
    const products = json?.data ?? [];

    // Extract unique categories from products and count them
    const catMap = new Map<string, { slug: string; name: string; count: number }>();
    for (const p of products) {
      const cats = p.categories ?? [];
      for (const c of cats) {
        if (c.slug && c.name) {
          const existing = catMap.get(c.slug);
          if (existing) {
            existing.count++;
          } else {
            catMap.set(c.slug, { slug: c.slug, name: c.name, count: 1 });
          }
        }
      }
    }

    // Sort by count descending (most popular categories first)
    return Array.from(catMap.values()).sort((a, b) => b.count - a.count);
  } catch {
    return [];
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

interface PageProps {
  searchParams: Promise<{ cat?: string; search?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const categoryFilter = params.cat || null;
  const searchQuery = params.search || null;

  // Fetch products (server-side filtering for category + search)
  const { items, isDemo, apiTotal } = await getData(
    searchQuery || undefined,
    categoryFilter || undefined
  );
  const total = items.length;

  // Fetch active categories from real data (for the strip)
  const activeCategories = await getActiveCategories();

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
                : `Απευθείας από παραγωγούς — ${categoryFilter ? `${total} στην κατηγορία` : `${apiTotal || total} συνολικά`}.`}
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
            <CategoryStrip
              selectedCategory={categoryFilter}
              dynamicCategories={activeCategories}
            />
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
                producerSlug={p.producerSlug}
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
