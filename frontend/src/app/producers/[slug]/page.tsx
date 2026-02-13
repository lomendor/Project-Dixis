import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ProductCard } from '@/components/ProductCard';
import ProducerMap from '@/components/ProducerMapWrapper';
import { getServerApiUrl } from '@/env';
import { getBaseUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

type ApiImage = {
  id: number;
  url: string;
  is_primary: boolean;
  sort_order: number;
};

type ApiProduct = {
  id: string | number;
  slug?: string;
  name: string;
  price: string | number;
  unit: string;
  stock: number;
  image_url?: string | null;
  images?: ApiImage[];
  category?: string;
  categories?: { id: number; name: string; slug: string }[];
};

type ApiProducer = {
  id: string | number;
  slug: string;
  name: string;
  region?: string;
  location?: string;
  city?: string;
  category?: string;
  description: string | null;
  image_url: string | null;
  latitude?: number | null;
  longitude?: number | null;
  website?: string | null;
  products: ApiProduct[];
};

async function getProducer(slug: string): Promise<ApiProducer | null> {
  const base = getServerApiUrl();
  try {
    const res = await fetch(`${base}/public/producers/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    // Pass FIX-MOBILE-CARDS-01: API returns data directly (no .data wrapper)
    // Also map 'location' to 'region' for frontend compatibility
    const raw = json?.data ?? json;
    if (!raw || !raw.id) return null;
    return {
      ...raw,
      region: raw.region || raw.location || '',
      category: raw.category || '',
    };
  } catch {
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProducer(slug);
  if (!p) return { title: 'Παραγωγός μη διαθέσιμος' };

  const baseUrl = await getBaseUrl();
  const url = `${baseUrl}/producers/${p.slug}`;
  const imageUrl = p.image_url || `${baseUrl}/og-default.png`;

  return {
    title: `${p.name} — Παραγωγός`,
    description: p.description || `${p.name} — Τοπικός παραγωγός από ${p.region}`,
    alternates: { canonical: url },
    openGraph: {
      title: p.name,
      description: p.description || `${p.name} — Τοπικός παραγωγός από ${p.region}`,
      url,
      siteName: 'Dixis',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: p.name }],
      locale: 'el_GR',
      type: 'profile',
    },
  };
}

export default async function ProducerProfilePage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const producer = await getProducer(slug);
  if (!producer) return notFound();

  const hasImage = producer.image_url && producer.image_url.length > 0;
  const productCount = producer.products.length;

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="text-primary hover:underline">Αρχική</Link></li>
            <li className="text-gray-400">/</li>
            <li><Link href="/producers" className="text-primary hover:underline">Παραγωγοί</Link></li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-600">{producer.name}</li>
          </ol>
        </nav>

        {/* Producer Hero */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden mb-6">
          <div className="grid md:grid-cols-3 gap-0">
            {/* Image */}
            <div className="aspect-[4/3] md:aspect-auto bg-neutral-100 overflow-hidden">
              {hasImage ? (
                <img
                  src={producer.image_url!}
                  alt={producer.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full min-h-[240px] flex items-center justify-center text-gray-400">
                  <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="md:col-span-2 p-6 sm:p-8 flex flex-col justify-center">
              {producer.category && (
                <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                  {producer.category}
                </span>
              )}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                {producer.name}
              </h1>
              {producer.region && (
                <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-4">
                  <svg className="w-4 h-4 text-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {producer.region}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 bg-neutral-100 px-3 py-1 rounded-full">
                  <svg className="w-4 h-4 text-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  {productCount} {productCount === 1 ? 'προϊόν' : 'προϊόντα'}
                </span>
                {producer.website && (
                  <a
                    href={producer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Story / Description section */}
        {producer.description && (
          <div className="bg-primary/5 rounded-xl border border-primary/10 p-6 sm:p-8 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Η Ιστορία μας
            </h2>
            <p className="text-gray-700 leading-relaxed">{producer.description}</p>
          </div>
        )}

        {/* Map section — only if coordinates exist */}
        {producer.latitude && producer.longitude && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Η Τοποθεσία μας
            </h2>
            <ProducerMap
              latitude={producer.latitude}
              longitude={producer.longitude}
              name={producer.name}
              region={producer.region}
            />
          </div>
        )}

        {/* Products Section */}
        {productCount > 0 ? (
          <>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Τα Προϊόντα μας
              </h2>
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                {productCount}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {producer.products.map((p) => {
                const imageUrl = p.image_url || p.images?.[0]?.url || null;
                const price = typeof p.price === 'string' ? parseFloat(p.price) : p.price;
                return (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    title={p.name}
                    producer={producer.name}
                    producerId={producer.id}
                    producerSlug={producer.slug}
                    priceCents={Math.round(price * 100)}
                    image={imageUrl}
                    stock={p.stock}
                    hideProducerLink
                  />
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">
              Δεν υπάρχουν ακόμα προϊόντα από αυτόν τον παραγωγό.
            </p>
          </div>
        )}

        {/* Back link */}
        <div className="mt-8">
          <Link href="/producers" className="inline-flex items-center text-primary hover:underline">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Πίσω στους Παραγωγούς
          </Link>
        </div>
      </div>
    </main>
  );
}
