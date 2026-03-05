import { notFound } from 'next/navigation';
import Image from 'next/image';
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
  reviews_count?: number;
  reviews_avg_rating?: number | null;
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
  const baseUrl = await getBaseUrl();

  // JSON-LD: LocalBusiness schema for producer
  const localBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${baseUrl}/producers/${producer.slug}`,
    name: producer.name,
    description: producer.description || `${producer.name} — Τοπικός παραγωγός`,
    url: `${baseUrl}/producers/${producer.slug}`,
    ...(producer.image_url ? { image: producer.image_url } : {}),
    ...(producer.region ? {
      address: {
        '@type': 'PostalAddress',
        addressRegion: producer.region,
        addressCountry: 'GR',
      },
    } : {}),
    ...(producer.latitude && producer.longitude ? {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: producer.latitude,
        longitude: producer.longitude,
      },
    } : {}),
  };

  // JSON-LD: BreadcrumbList
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Αρχική', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Παραγωγοί', item: `${baseUrl}/producers` },
      { '@type': 'ListItem', position: 3, name: producer.name },
    ],
  };

  const hasMap = !!(producer.latitude && producer.longitude);
  const hasStory = !!producer.description;
  const hasLeftColumn = hasStory || hasMap;

  return (
    <main className="min-h-screen bg-[#faf9f7]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative bg-[#1b2a1e] text-white overflow-hidden">
        {/* Background image or elegant pattern */}
        {hasImage ? (
          <Image
            src={producer.image_url!}
            alt={producer.name}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
        ) : (
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }} />
        )}

        {/* Content overlay */}
        <div className="relative max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-28">
          {/* Breadcrumbs */}
          <nav className="mb-8 text-xs text-white/40" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5">
              <li><Link href="/" className="hover:text-white/70 transition-colors">Αρχική</Link></li>
              <li className="text-white/20">/</li>
              <li><Link href="/producers" className="hover:text-white/70 transition-colors">Παραγωγοί</Link></li>
              <li className="text-white/20">/</li>
              <li className="text-white/60 truncate max-w-[160px]">{producer.name}</li>
            </ol>
          </nav>

          {producer.category && (
            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#c9a227] mb-4">
              {producer.category}
            </span>
          )}

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 max-w-2xl text-white">
            {producer.name}
          </h1>

          {/* Gold accent line */}
          <div className="w-16 h-0.5 bg-[#c9a227] mb-6" />

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            {producer.region && (
              <span className="inline-flex items-center gap-1.5 text-white/70">
                <svg className="w-3.5 h-3.5 text-[#c9a227]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
                </svg>
                {producer.region}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-white/70">
              <svg className="w-3.5 h-3.5 text-[#c9a227]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              {productCount} {productCount === 1 ? 'προϊόν' : 'προϊόντα'}
            </span>
            {producer.website && (
              <a
                href={producer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[#c9a227] hover:text-[#d4af37] transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Ιστοσελίδα
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── Main content ──────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 py-10 sm:py-14">
        {hasLeftColumn ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14">
            {/* Left column (2/5) — story + map */}
            <div className="lg:col-span-2 space-y-10">
              {hasStory && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-bold text-neutral-900">
                      Η Ιστορία μας
                    </h2>
                  </div>
                  <p className="text-neutral-600 leading-relaxed text-[15px] pl-11">
                    {producer.description}
                  </p>
                </div>
              )}

              {hasMap && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-bold text-neutral-900">
                      Η Τοποθεσία μας
                    </h2>
                  </div>
                  <div className="pl-11">
                    <div className="aspect-[4/3] max-h-[320px]">
                      <ProducerMap
                        latitude={producer.latitude!}
                        longitude={producer.longitude!}
                        name={producer.name}
                        region={producer.region}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right column (3/5) — products */}
            <div className="lg:col-span-3">
              {productCount > 0 ? (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-lg font-bold text-neutral-900">
                      Τα Προϊόντα μας
                    </h2>
                    <span className="text-xs font-bold text-primary bg-primary-pale px-2.5 py-1 rounded-full">
                      {productCount}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
                          reviewsCount={p.reviews_count}
                          reviewsAvgRating={p.reviews_avg_rating}
                        />
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-20 rounded-2xl bg-white border border-neutral-200/60">
                  <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <p className="text-neutral-400 text-sm">
                    Δεν υπάρχουν ακόμα προϊόντα.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Full-width fallback (no story/map) */
          productCount > 0 ? (
            <>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-lg font-bold text-neutral-900">Τα Προϊόντα μας</h2>
                <span className="text-xs font-bold text-primary bg-primary-pale px-2.5 py-1 rounded-full">{productCount}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
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
                      reviewsCount={p.reviews_count}
                      reviewsAvgRating={p.reviews_avg_rating}
                    />
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-20 rounded-2xl bg-white border border-neutral-200/60">
              <p className="text-neutral-400 text-sm">Δεν υπάρχουν ακόμα προϊόντα.</p>
            </div>
          )
        )}

        {/* Back link */}
        <div className="mt-12 pt-8 border-t border-neutral-200/40">
          <Link href="/producers" className="group inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-primary transition-colors">
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Πίσω στους Παραγωγούς
          </Link>
        </div>
      </div>
    </main>
  );
}
