import { Suspense } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { CategoryStrip } from '@/components/CategoryStrip';
import { DEMO_PRODUCTS, filterProductsByCategory } from '@/data/demoProducts';

type ApiItem = {
  id: string | number;
  title: string;
  producerName?: string;
  priceCents: number;
  priceFormatted?: string;
  imageUrl?: string;
  categorySlug?: string;
};

async function getData(): Promise<{ items: ApiItem[]; total: number; isDemo: boolean }> {
  // Use internal URL for SSR to avoid external round-trip timeout (Pass 26 fix)
  // Same pattern as product detail page (Pass 19)
  const isServer = typeof window === 'undefined';
  const base = isServer
    ? process.env.API_INTERNAL_URL || 'http://127.0.0.1:8001/api/v1'
    : process.env.NEXT_PUBLIC_API_BASE_URL || 'https://dixis.gr/api/v1';

  try {
    const res = await fetch(`${base}/public/products`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      console.error('[Products] API fetch failed:', res.status, res.statusText);
      // Fall back to demo products
      return { items: mapDemoToApiItems(DEMO_PRODUCTS), total: DEMO_PRODUCTS.length, isDemo: true };
    }

    const json = await res.json();
    const products = json?.data ?? [];

    if (products.length === 0) {
      console.log('[Products] API returned empty, using demo fallback');
      return { items: mapDemoToApiItems(DEMO_PRODUCTS), total: DEMO_PRODUCTS.length, isDemo: true };
    }

    // Map backend format to frontend format
    const items = products.map((p: any) => ({
      id: p.id,
      title: p.name,
      producerName: p.producer?.name || null,
      priceCents: Math.round(parseFloat(p.price) * 100),
      imageUrl: p.image_url,
      categorySlug: p.category?.slug || null,
    }));

    return { items, total: items.length, isDemo: false };
  } catch (err) {
    console.error('[Products] Fetch error (falling back to demo):', err);
    return { items: mapDemoToApiItems(DEMO_PRODUCTS), total: DEMO_PRODUCTS.length, isDemo: true };
  }
}

// Convert demo products to API item format
function mapDemoToApiItems(demoProducts: typeof DEMO_PRODUCTS): ApiItem[] {
  return demoProducts.map((p) => ({
    id: p.id,
    title: p.name,
    producerName: p.producerName,
    priceCents: p.priceCents,
    imageUrl: p.imageUrl,
    categorySlug: p.categorySlug,
  }));
}

// Filter items by category
function filterByCategory(items: ApiItem[], categorySlug: string | null): ApiItem[] {
  if (!categorySlug) return items;
  return items.filter((item) => item.categorySlug === categorySlug);
}

interface PageProps {
  searchParams: Promise<{ cat?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const categoryFilter = params.cat || null;

  const { items: allItems = [], isDemo } = await getData();
  const items = filterByCategory(allItems, categoryFilter);
  const total = items.length;

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Demo mode banner */}
        {isDemo && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
            <span className="font-medium">Λειτουργία demo:</span> Περιορισμένα δεδομένα (DB offline).
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Προϊόντα</h1>
            <p className="mt-1 text-sm text-gray-600">
              Απευθείας από παραγωγούς — {total} {categoryFilter ? 'στην κατηγορία' : 'συνολικά'}.
            </p>
          </div>
        </div>

        {/* Category Strip */}
        <div className="mb-6">
          <Suspense fallback={<div className="h-10 bg-gray-100 rounded animate-pulse" />}>
            <CategoryStrip selectedCategory={categoryFilter} />
          </Suspense>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {items.map((p: ApiItem) => (
              <ProductCard
                key={p.id}
                id={p.id}
                title={p.title}
                producer={p.producerName || null}
                priceCents={p.priceCents}
                image={p.imageUrl}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">
              {categoryFilter
                ? 'Δεν υπάρχουν προϊόντα σε αυτή την κατηγορία.'
                : 'Δεν υπάρχουν διαθέσιμα προϊόντα αυτή τη στιγμή.'}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
