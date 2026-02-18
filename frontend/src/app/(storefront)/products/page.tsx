import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ProductCard } from '@/components/ProductCard';
import { CategoryStrip } from '@/components/CategoryStrip';
import { CultivationFilter } from '@/components/CultivationFilter';
import { ProductSearchInput } from '@/components/ProductSearchInput';
import { ProductSort } from '@/components/ProductSort';
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
  cultivationType?: string | null;
  reviewsCount?: number;
  reviewsAvgRating?: number | null;
  discountPriceCents?: number | null;
  isSeasonal?: boolean;
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
  category?: string,
  cultivationType?: string,
  sort?: string,
  dir?: string
): Promise<{ items: ApiItem[]; total: number; isDemo: boolean; apiTotal: number }> {
  // Pass CI-SMOKE-STABILIZE-002: In CI mode, use internal Next.js API
  // which reads from Prisma DB (seeded with ci:seed) — same pattern as products/[id]/page.tsx
  const isCI = process.env.CI === 'true' || process.env.NODE_ENV === 'test';
  const isServer = typeof window === 'undefined';
  let base: string;
  if (isCI && isServer) {
    base = 'http://127.0.0.1:3001/api/v1';
  } else if (isServer) {
    base = getServerApiUrl();
  } else {
    base = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';
  }

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
    if (cultivationType) {
      params.set('cultivation_type', cultivationType);
    }
    if (sort) {
      params.set('sort', sort);
    }
    if (dir) {
      params.set('direction', dir);
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
      cultivationType: p.cultivation_type || null,
      reviewsCount: p.reviews_count ?? 0,
      reviewsAvgRating: p.reviews_avg_rating ?? null,
      discountPriceCents: p.discount_price ? Math.round(parseFloat(p.discount_price) * 100) : null,
      isSeasonal: !!p.is_seasonal,
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
  // Pass CI-SMOKE-STABILIZE-002: CI fallback (same as getData above)
  const isCI = process.env.CI === 'true' || process.env.NODE_ENV === 'test';
  const isServer = typeof window === 'undefined';
  let base: string;
  if (isCI && isServer) {
    base = 'http://127.0.0.1:3001/api/v1';
  } else if (isServer) {
    base = getServerApiUrl();
  } else {
    base = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';
  }

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

// SEO: Dynamic metadata for filtered product views
const cultivationLabels: Record<string, string> = {
  organic_certified: 'Βιολογικά',
  biodynamic: 'Βιοδυναμικά',
  traditional_natural: 'Παραδοσιακά',
  conventional: 'Συμβατικά',
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; search?: string; cult?: string; sort?: string; dir?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const parts: string[] = [];
  if (params.cult && cultivationLabels[params.cult]) parts.push(cultivationLabels[params.cult]);
  if (params.search) parts.push(`"${params.search}"`);
  const suffix = parts.length > 0 ? ` — ${parts.join(', ')}` : '';
  const title = `Προϊόντα${suffix} | Dixis`;
  const description = `Ανακαλύψτε τοπικά ελληνικά προϊόντα${suffix} απευθείας από Έλληνες παραγωγούς.`;
  return { title, description };
}

interface PageProps {
  searchParams: Promise<{ cat?: string; search?: string; cult?: string; sort?: string; dir?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const categoryFilter = params.cat || null;
  const searchQuery = params.search || null;
  const cultivationFilter = params.cult || null;
  const sortField = params.sort || undefined;
  const sortDir = params.dir || undefined;

  // Fetch products (server-side filtering for category + search + cultivation + sort)
  const { items, isDemo, apiTotal } = await getData(
    searchQuery || undefined,
    categoryFilter || undefined,
    cultivationFilter || undefined,
    sortField,
    sortDir
  );
  const total = items.length;

  // Fetch ALL products (without cult filter) to build cultivation counts for the strip
  const allForCounts = cultivationFilter
    ? await getData(searchQuery || undefined, categoryFilter || undefined)
    : { items };
  const cultivationCounts: Record<string, number> = {};
  for (const item of allForCounts.items) {
    if (item.cultivationType) {
      cultivationCounts[item.cultivationType] = (cultivationCounts[item.cultivationType] || 0) + 1;
    }
  }
  const hasCultivationData = Object.keys(cultivationCounts).length > 0;

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
    if (cultivationFilter) {
      return 'Δεν υπάρχουν προϊόντα με αυτόν τον τρόπο καλλιέργειας.';
    }
    if (categoryFilter) {
      return 'Δεν υπάρχουν προϊόντα σε αυτή την κατηγορία.';
    }
    return 'Δεν υπάρχουν διαθέσιμα προϊόντα αυτή τη στιγμή.';
  };

  return (
    <main className="min-h-screen bg-neutral-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Demo mode banner */}
        {isDemo && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
            <span className="font-medium">Λειτουργία demo:</span> Περιορισμένα δεδομένα (DB offline).
          </div>
        )}

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">Προϊόντα</h1>
          <p className="mt-1 text-sm text-neutral-600">
            {searchQuery
              ? `${total} αποτέλεσμα${total !== 1 ? 'τα' : ''} για "${searchQuery}"`
              : `Απευθείας από παραγωγούς — ${categoryFilter ? `${total} στην κατηγορία` : `${apiTotal || total} συνολικά`}.`}
          </p>
        </div>

        {/* Category Grid — standalone section above filters */}
        <section className="mb-6" aria-label="Κατηγορίες">
          <Suspense
            fallback={
              <div>
                <div className="h-10 w-24 bg-neutral-100 rounded-full animate-pulse mb-3" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="h-36 sm:h-44 bg-neutral-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              </div>
            }
          >
            <CategoryStrip
              selectedCategory={categoryFilter}
              dynamicCategories={activeCategories}
            />
          </Suspense>
        </section>

        {/* Filter Card — search + sort + cultivation */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-card p-5 mb-6 space-y-4">
          {/* Search + Sort */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Suspense fallback={<div className="h-10 w-full bg-neutral-100 rounded-lg animate-pulse" />}>
                <ProductSearchInput />
              </Suspense>
            </div>
            <div className="sm:w-52">
              <Suspense fallback={<div className="h-10 w-full bg-neutral-100 rounded-lg animate-pulse" />}>
                <ProductSort />
              </Suspense>
            </div>
          </div>

          {/* Cultivation (conditional) */}
          {hasCultivationData && (
            <Suspense fallback={null}>
              <CultivationFilter
                selectedCultivation={cultivationFilter}
                availableCounts={cultivationCounts}
              />
            </Suspense>
          )}
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6" data-testid="products-grid">
            {/* Pass FIX-STOCK-GUARD-01: Include stock for OOS check */}
            {items.map((p: ApiItem, index: number) => (
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
                reviewsCount={p.reviewsCount}
                reviewsAvgRating={p.reviewsAvgRating}
                discountPriceCents={p.discountPriceCents}
                isSeasonal={p.isSeasonal}
                priority={index < 4}
              />
            ))}
          </div>
        ) : (
          <div
            className="text-center py-20 bg-white rounded-xl border border-dashed border-neutral-300"
            data-testid="no-results"
          >
            <p className="text-neutral-500 text-lg">{getEmptyMessage()}</p>
          </div>
        )}
      </div>
    </main>
  );
}
