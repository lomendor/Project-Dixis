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
  isB2bOnly?: boolean;
};

/**
 * FIX-PRODUCTS-PAGINATION: Fetch ALL products with server-side filtering.
 */
async function getData(
  search?: string,
  category?: string,
  cultivationType?: string,
  sort?: string,
  dir?: string
): Promise<{ items: ApiItem[]; total: number; isDemo: boolean; apiTotal: number }> {
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
      params.set('dir', dir);
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
      isB2bOnly: !!p.is_b2b_only,
    }));

    return { items, total: items.length, isDemo: false, apiTotal };
  } catch {
    const demoItems = mapDemoToApiItems(DEMO_PRODUCTS);
    const filtered = search ? filterDemoBySearch(demoItems, search) : demoItems;
    return { items: filtered, total: filtered.length, isDemo: true, apiTotal: 0 };
  }
}

async function getActiveCategories(): Promise<{ slug: string; name: string; count: number }[]> {
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

    return Array.from(catMap.values()).sort((a, b) => b.count - a.count);
  } catch {
    return [];
  }
}

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

function filterDemoBySearch(items: ApiItem[], search: string): ApiItem[] {
  const term = search.toLowerCase().trim();
  if (!term) return items;
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(term) ||
      (item.producerName && item.producerName.toLowerCase().includes(term))
  );
}

const cultivationLabels: Record<string, string> = {
  organic_certified: 'Βιολογικά',
  biodynamic: 'Βιοδυναμικά',
  traditional_natural: 'Παραδοσιακά',
  conventional: 'Συμβατικά',
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dixis.gr';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; search?: string; cult?: string; sort?: string; dir?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const hasFilters = params.cult || params.search || params.cat;
  const parts: string[] = [];
  if (params.cult && cultivationLabels[params.cult]) parts.push(cultivationLabels[params.cult]);
  if (params.search) parts.push(`"${params.search}"`);
  const suffix = parts.length > 0 ? ` — ${parts.join(', ')}` : '';

  const title = hasFilters
    ? `Προϊόντα${suffix}`
    : 'Αυθεντικά Ελληνικά Προϊόντα από Έλληνες παραγωγούς';
  const description = hasFilters
    ? `Ανακαλύψτε τοπικά ελληνικά προϊόντα${suffix} απευθείας από Έλληνες παραγωγούς.`
    : 'Ανακαλύψτε αυθεντικά ελληνικά προϊόντα απευθείας από Έλληνες παραγωγούς. Ελαιόλαδο, μέλι, βότανα και χειροποίητα προϊόντα — από τον παραγωγό στην πόρτα σας.';

  return {
    title,
    description,
    keywords: [
      'τοπικά προϊόντα Ελλάδα',
      'Έλληνες παραγωγοί',
      'αυθεντικά ελληνικά προϊόντα',
      'ελληνικό μέλι',
      'ελαιόλαδο',
      'βότανα',
      'παραδοσιακά ελληνικά προϊόντα',
    ],
    openGraph: {
      title: 'Dixis — Αυθεντικά Ελληνικά Προϊόντα από Έλληνες παραγωγούς',
      description: 'Ανακαλύψτε αυθεντικά ελληνικά προϊόντα απευθείας από Έλληνες παραγωγούς.',
      url: `${siteUrl}/products`,
      images: [{ url: `${siteUrl}/og-products.jpg`, width: 1200, height: 630, alt: 'Dixis — Ελληνικά Προϊόντα' }],
    },
    twitter: {
      title: 'Dixis — Αυθεντικά Ελληνικά Προϊόντα',
      description: 'Ανακαλύψτε αυθεντικά ελληνικά προϊόντα απευθείας από Έλληνες παραγωγούς.',
      images: [`${siteUrl}/twitter-products.jpg`],
    },
  };
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

  const { items, isDemo, apiTotal } = await getData(
    searchQuery || undefined,
    categoryFilter || undefined,
    cultivationFilter || undefined,
    sortField,
    sortDir
  );

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

  const activeCategories = await getActiveCategories();

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
    <main className="min-h-screen bg-white">
      {/* Categories — full-width, light gray bg strip */}
      <div className="bg-neutral-50 border-b border-neutral-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <Suspense
            fallback={
              <div className="flex gap-3 sm:gap-5 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap sm:overflow-visible">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 min-w-[84px] sm:min-w-[108px]">
                    <div className="w-[76px] h-[76px] sm:w-[100px] sm:h-[100px] rounded-2xl bg-neutral-100 animate-pulse" />
                    <div className="h-3.5 w-14 bg-neutral-100 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            }
          >
            <CategoryStrip
              selectedCategory={categoryFilter}
              dynamicCategories={activeCategories}
            />
          </Suspense>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6">
        {/* Demo mode banner */}
        {isDemo && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
            <span className="font-medium">Λειτουργία demo:</span> Περιορισμένα δεδομένα (DB offline).
          </div>
        )}

        {/* Search heading — only when filtered */}
        {searchQuery && (
          <h1 className="text-lg sm:text-xl font-semibold text-neutral-900 mb-4">
            Αποτελέσματα για &ldquo;{searchQuery}&rdquo;
            <span className="text-neutral-400 font-normal text-base ml-2">({items.length})</span>
          </h1>
        )}

        {/* Filter bar — clean, minimal */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="flex-1">
            <Suspense fallback={<div className="h-10 w-full bg-neutral-50 rounded-lg animate-pulse" />}>
              <ProductSearchInput />
            </Suspense>
          </div>
          <div className="flex items-center gap-2">
            <div className="sm:w-44">
              <Suspense fallback={<div className="h-10 w-full bg-neutral-50 rounded-lg animate-pulse" />}>
                <ProductSort />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Cultivation pills */}
        {hasCultivationData && (
          <div className="flex items-center gap-2 overflow-x-auto sm:flex-wrap sm:overflow-visible pb-2 sm:pb-0 mb-5 scrollbar-hide">
            <Suspense fallback={null}>
              <CultivationFilter
                selectedCultivation={cultivationFilter}
                availableCounts={cultivationCounts}
              />
            </Suspense>
          </div>
        )}

        {/* Product count */}
        {!searchQuery && items.length > 0 && (
          <p className="text-sm text-neutral-400 mb-4">{items.length} προϊόντα</p>
        )}

        {/* Product grid — 2 mobile, 3 tablet, 4 laptop, 5 desktop */}
        {items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-[6px] sm:gap-3 lg:gap-4" data-testid="products-grid">
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
                cultivationType={p.cultivationType}
                isB2bOnly={p.isB2bOnly}
                priority={index < 4}
              />
            ))}
          </div>
        ) : (
          <div
            className="text-center py-20 bg-neutral-50 rounded-xl border border-dashed border-neutral-200"
            data-testid="no-results"
          >
            <p className="text-neutral-500 text-lg">{getEmptyMessage()}</p>
          </div>
        )}
      </div>
    </main>
  );
}
