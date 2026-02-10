import { Suspense } from 'react';
import Link from 'next/link';
import { ProducerCard } from '@/components/ProducerCard';
import { FilterStrip } from '@/components/FilterStrip';
import { getServerApiUrl } from '@/env';

export const metadata = { title: 'Παραγωγοί | Dixis' };

type ApiProducer = {
  id: string | number;
  slug: string;
  name: string;
  region: string;
  category: string;
  description?: string | null;
  image_url?: string | null;
  products_count: number;
};

/**
 * Fetch approved producers from Next.js API route (Prisma → Neon DB).
 * Pattern follows (storefront)/products/page.tsx.
 */
async function getData(search?: string): Promise<{ items: ApiProducer[]; total: number }> {
  const isServer = typeof window === 'undefined';
  const base = isServer
    ? getServerApiUrl()
    : (process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1');

  try {
    const qs = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
    const res = await fetch(`${base}/public/producers${qs}`, {
      next: { revalidate: 60 },
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      console.error('[Producers] API fetch failed:', res.status);
      return { items: [], total: 0 };
    }

    const json = await res.json();
    const items: ApiProducer[] = json?.data ?? [];
    return { items, total: items.length };
  } catch (err) {
    console.error('[Producers] Fetch error:', err);
    return { items: [], total: 0 };
  }
}

interface PageProps {
  searchParams: Promise<{ search?: string; region?: string }>;
}

export default async function ProducersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const searchQuery = params.search || null;
  const regionFilter = params.region || null;
  const { items: allItems } = await getData(searchQuery || undefined);

  // Extract unique filter options from ALL fetched items (pre-filter)
  const allRegions = [...new Set(allItems.map((p) => p.region))].sort();

  // Apply client-side filters
  const filtered = allItems
    .filter((p) => !regionFilter || p.region === regionFilter);
  const total = filtered.length;

  const getEmptyMessage = () => {
    const parts: string[] = [];
    if (searchQuery) parts.push(`αναζήτηση "${searchQuery}"`);
    if (regionFilter) parts.push(`περιοχή "${regionFilter}"`);
    if (parts.length > 0) {
      return `Δεν βρέθηκαν παραγωγοί για ${parts.join(' και ')}.`;
    }
    return 'Δεν υπάρχουν παραγωγοί αυτή τη στιγμή.';
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Παραγωγοί</h1>
            <p className="mt-1 text-sm text-gray-600">
              {searchQuery
                ? `${total} αποτέλεσμα${total !== 1 ? 'τα' : ''} για "${searchQuery}"`
                : `Γνώρισε τους τοπικούς παραγωγούς μας — ${total} συνολικά.`}
            </p>
          </div>

          {/* Search Form */}
          <Suspense fallback={<div className="h-10 w-full max-w-md bg-gray-100 rounded-lg animate-pulse" />}>
            <ProducerSearchForm defaultValue={searchQuery || ''} />
          </Suspense>
        </div>

        {/* CTA banner */}
        <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm flex items-center justify-between">
          <span>Είσαι παραγωγός; Γίνε μέλος του Dixis!</span>
          <Link href="/producers/join" className="font-medium underline hover:text-green-900">
            Μάθε περισσότερα →
          </Link>
        </div>

        {/* Filter strips */}
        <Suspense fallback={null}>
          <div className="flex flex-col gap-2 mb-6">
            <FilterStrip label="Περιοχή" options={allRegions} selected={regionFilter} paramName="region" basePath="/producers" />
          </div>
        </Suspense>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map((p) => (
              <ProducerCard
                key={p.id}
                id={p.id}
                slug={p.slug}
                name={p.name}
                region={p.region}
                category={p.category}
                description={p.description}
                imageUrl={p.image_url}
                productsCount={p.products_count}
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

/**
 * Simple server-rendered search form (no client JS needed for basic HTML form).
 */
function ProducerSearchForm({ defaultValue }: { defaultValue: string }) {
  return (
    <form action="/producers" method="GET" className="w-full max-w-md">
      <div className="relative">
        <input
          name="search"
          type="search"
          defaultValue={defaultValue}
          placeholder="Αναζήτηση παραγωγού..."
          className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </form>
  );
}
