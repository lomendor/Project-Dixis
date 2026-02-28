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

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* Producer hero */}
      <div className="bg-neutral-50 border-b border-neutral-100">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px] lg:min-h-[500px]">
          {/* Image — full bleed */}
          <div className="relative aspect-[4/3] lg:aspect-auto bg-neutral-100 overflow-hidden">
            {hasImage ? (
              <Image
                src={producer.image_url!}
                alt={producer.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full min-h-[280px] flex items-center justify-center bg-gradient-to-br from-primary-pale to-[#edf6f0] text-primary/20">
                <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
          </div>

          {/* Content — editorial */}
          <div className="px-8 py-10 sm:px-12 sm:py-14 lg:px-16 xl:px-20 lg:py-0 flex flex-col justify-center">
            {/* Breadcrumbs */}
            <nav className="mb-6 text-xs text-neutral-400" aria-label="Breadcrumb">
              <ol className="flex items-center gap-1.5">
                <li><Link href="/" className="hover:text-primary transition-colors">Αρχική</Link></li>
                <li>/</li>
                <li><Link href="/producers" className="hover:text-primary transition-colors">Παραγωγοί</Link></li>
                <li>/</li>
                <li className="text-neutral-600 truncate max-w-[120px]">{producer.name}</li>
              </ol>
            </nav>

            {producer.category && (
              <p className="text-xs font-medium text-primary mb-2">
                {producer.category}
              </p>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-3">
              {producer.name}
            </h1>
            {producer.region && (
              <div className="inline-flex items-center gap-1.5 text-sm text-neutral-500 mb-5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {producer.region}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-sm text-neutral-600 bg-white/60 px-3 py-1.5 rounded-full">
                {productCount} {productCount === 1 ? 'προϊόν' : 'προϊόντα'}
              </span>
              {producer.website && (
                <a
                  href={producer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  Ιστοσελίδα &rarr;
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 py-8 sm:py-10">

        {/* Story / Description section */}
        {producer.description && (
          <div className="mb-10">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-4">
              Η Ιστορία μας
            </h2>
            <p className="text-neutral-600 leading-relaxed text-[15px] max-w-2xl">{producer.description}</p>
          </div>
        )}

        {/* Map section — only if coordinates exist */}
        {producer.latitude && producer.longitude && (
          <div className="mb-10">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-4">
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
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
                Τα Προϊόντα μας
              </h2>
              <span className="text-xs font-semibold text-primary/70 bg-primary-pale px-2.5 py-1 rounded-full">
                {productCount}
              </span>
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
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-neutral-300">
            <p className="text-neutral-500 text-lg">
              Δεν υπάρχουν ακόμα προϊόντα από αυτόν τον παραγωγό.
            </p>
          </div>
        )}

        {/* Back link */}
        <div className="mt-10 pt-6 border-t border-neutral-200/50">
          <Link href="/producers" className="inline-flex items-center text-sm text-neutral-500 hover:text-primary transition-colors">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Πίσω στους Παραγωγούς
          </Link>
        </div>
      </div>
    </main>
  );
}
