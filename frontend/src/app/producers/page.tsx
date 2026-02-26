import { Suspense } from 'react';
import Link from 'next/link';
import { ProducerCard } from '@/components/ProducerCard';
import { FilterStrip } from '@/components/FilterStrip';
import { getServerApiUrl } from '@/env';

export const metadata = { title: 'Παραγωγοί' };

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

/** Raw shape from Laravel API — uses 'location' not 'region' */
type RawApiProducer = Omit<ApiProducer, 'region'> & {
  location?: string;
  region?: string;
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
      return { items: [], total: 0 };
    }

    const json = await res.json();
    const raw: RawApiProducer[] = json?.data ?? [];
    // Map 'location' (Laravel) to 'region' (frontend)
    const items: ApiProducer[] = raw.map((p) => ({
      ...p,
      region: p.region || p.location || '',
    }));
    return { items, total: items.length };
  } catch {
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
    <main className="min-h-screen bg-[#faf8f3] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest text-primary/50 uppercase mb-2">
              Κοινότητα
            </p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-normal text-neutral-900 tracking-[-0.01em]">
              {searchQuery
                ? `Αποτελέσματα για "${searchQuery}"`
                : 'Οι Παραγωγοί μας'}
            </h1>
            <p className="mt-2 text-sm text-neutral-500 max-w-md">
              {searchQuery
                ? `${total} αποτέλεσμα${total !== 1 ? 'τα' : ''}`
                : 'Πίσω από κάθε προϊόν υπάρχει ένας Έλληνας παραγωγός με πάθος και ιστορία.'}
            </p>
          </div>

          {/* Search Form */}
          <Suspense fallback={<div className="h-10 w-full max-w-md bg-neutral-100/60 rounded-lg animate-pulse" />}>
            <ProducerSearchForm defaultValue={searchQuery || ''} />
          </Suspense>
        </div>

        {/* CTA banner */}
        <div className="mb-8 p-4 bg-white rounded-xl border border-neutral-200/60 text-sm flex items-center justify-between">
          <span className="text-neutral-600">Είσαι παραγωγός; Γίνε μέλος του Dixis!</span>
          <Link href="/producers/join" className="font-semibold text-primary hover:text-primary-light transition-colors">
            Μάθε περισσότερα &rarr;
          </Link>
        </div>

        {/* Filter strips */}
        <Suspense fallback={null}>
          <div className="flex flex-col gap-2 mb-6">
            <FilterStrip label="Περιοχή" options={allRegions} selected={regionFilter} paramName="region" basePath="/producers" />
          </div>
        </Suspense>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
            {filtered.map((p) => (
              <ProducerCard
                key={p.id}
                id={p.id}
                slug={p.slug}
                name={p.name}
                region={p.region}
                description={p.description}
                imageUrl={p.image_url}
                productsCount={p.products_count}
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
          className="w-full h-10 pl-10 pr-4 rounded-lg border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </form>
  );
}
