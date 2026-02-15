import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from '@/lib/i18n/t';
import type { Metadata } from 'next';
import Add from './ui/Add';
import ReviewSection from '@/components/product/ReviewSection';
import StarRating from '@/components/StarRating';
import { getBaseUrl } from '@/lib/site';
import { getServerApiUrl } from '@/env';
import { getCategoryBySlug } from '@/data/categories';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Helper to fetch product from API
async function getProductById(id: string) {
  // Pass CI-SMOKE-STABILIZE-001: In CI mode, use internal Next.js API
  // which reads from Prisma DB (seeded with ci:seed)
  const isCI = process.env.CI === 'true' || process.env.NODE_ENV === 'test';
  const isServer = typeof window === 'undefined';

  // Determine base URL:
  // 1. CI mode: use localhost:3001 to hit Next.js internal API
  // 2. Server: use INTERNAL_API_URL or NEXT_PUBLIC_API_BASE_URL
  // 3. Client: use NEXT_PUBLIC_API_BASE_URL
  let base: string;
  if (isCI && isServer) {
    // In CI SSR, we need absolute URL to Next.js server
    base = 'http://127.0.0.1:3001/api/v1';
  } else if (isServer) {
    // SSOT: Use centralized env resolution (see src/env.ts)
    base = getServerApiUrl();
  } else {
    base = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';
  }

  try {
    const res = await fetch(`${base}/public/products/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    const raw = json?.data ?? json;
    if (!raw || !raw.id) return null;

    // Map backend API format to expected frontend format
    return {
      id: raw.id,
      title: raw.name,
      description: raw.description,
      price: raw.price,
      unit: raw.unit || 'kg',
      stock: raw.stock,
      isActive: raw.is_active !== false,
      category: raw.category,
      imageUrl: raw.image_url || raw.images?.[0]?.url || null,
      producer: raw.producer ? { name: raw.producer.name } : null,
      // Pass HOTFIX-MP-CHECKOUT-GUARD-01: Include producer_id for multi-producer cart detection
      producerId: raw.producer_id || raw.producer?.id || null,
      producerSlug: raw.producer?.slug || null,
      producerName: raw.producer?.name || null,
      cultivationType: raw.cultivation_type || null,
      cultivationDescription: raw.cultivation_description || null,
      // S1-02: Review stats
      reviewsCount: raw.reviews_count ?? 0,
      reviewsAvgRating: raw.reviews_avg_rating ?? null
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = await getProductById(String(id || ''));

  if (!p) {
    return { title: 'Προϊόν μη διαθέσιμο' };
  }

  const baseUrl = await getBaseUrl();
  const url = `${baseUrl}/products/${id}`;
  const imageUrl = p.imageUrl || `${baseUrl}/og-default.png`;

  return {
    title: p.title,
    description: p.description || `${p.title} - Τοπικά προϊόντα από Έλληνες παραγωγούς`,
    alternates: {
      canonical: url
    },
    openGraph: {
      title: p.title,
      description: p.description || `${p.title} - Τοπικά προϊόντα από Έλληνες παραγωγούς`,
      url,
      siteName: 'Dixis',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: p.title }],
      locale: 'el_GR',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: p.title,
      description: p.description || `${p.title} - Τοπικά προϊόντα από Έλληνες παραγωγούς`,
      images: [imageUrl]
    }
  };
}

export default async function Page({ params }:{ params: Promise<{ id:string }> }){
  const t = await getTranslations();
  const { id } = await params;
  const p = await getProductById(String(id || ''));

  if(!p || !p.isActive) return notFound();

  const fmt=(n:number)=> new Intl.NumberFormat('el-GR',{style:'currency',currency:'EUR'}).format(n);

  // JSON-LD Product Schema
  const baseUrl = await getBaseUrl();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': p.title,
    'description': p.description || `${p.title} - Τοπικά προϊόντα από Έλληνες παραγωγούς`,
    'image': p.imageUrl || `${baseUrl}/og-default.png`,
    'url': `${baseUrl}/products/${id}`,
    'offers': {
      '@type': 'Offer',
      'price': Number(p.price || 0),
      'priceCurrency': 'EUR',
      'availability': Number(p.stock || 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      'url': `${baseUrl}/products/${id}`
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-neutral-500">
          <li>
            <Link href="/" className="hover:text-primary transition-colors">
              {t('nav.home')}
            </Link>
          </li>
          <li aria-hidden="true">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </li>
          <li>
            <Link href="/products" className="hover:text-primary transition-colors">
              {t('products.title')}
            </Link>
          </li>
          <li aria-hidden="true">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </li>
          <li className="text-neutral-900 font-medium truncate max-w-[200px]">{p.title}</li>
        </ol>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-100">
          {p.imageUrl ? (
            <Image
              src={p.imageUrl}
              alt={p.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              data-testid="product-image"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400">
              <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold mb-2" data-testid="product-title">
            {p.title}
          </h1>

          {/* Producer - Pass FIX-MOBILE-CARDS-01: Link to producer page */}
          {p.producer?.name && (
            <p className="text-sm text-primary font-semibold uppercase tracking-wider mb-1" data-testid="product-producer">
              {(p.producerSlug || p.producerId) ? (
                <Link href={`/producers/${p.producerSlug || p.producerId}`} className="hover:underline">
                  {p.producer.name}
                </Link>
              ) : (
                <span>{p.producer.name}</span>
              )}
            </p>
          )}

          {/* S1-02: Star rating summary */}
          {p.reviewsAvgRating && (
            <div className="mb-1">
              <StarRating rating={p.reviewsAvgRating} count={p.reviewsCount} size="sm" />
            </div>
          )}

          {p.category && (
            <p className="text-sm text-neutral-500 mb-2">{getCategoryBySlug(p.category)?.labelEl || p.category}</p>
          )}

          {/* S1-01: Cultivation Type Badge */}
          {p.cultivationType && (
            <div className="mb-4" data-testid="cultivation-badge">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                p.cultivationType === 'organic_certified' ? 'bg-green-100 text-green-800' :
                p.cultivationType === 'organic_transitional' ? 'bg-lime-100 text-lime-800' :
                p.cultivationType === 'biodynamic' ? 'bg-purple-100 text-purple-800' :
                p.cultivationType === 'traditional_natural' ? 'bg-amber-100 text-amber-800' :
                p.cultivationType === 'conventional' ? 'bg-neutral-100 text-neutral-700' :
                'bg-neutral-100 text-neutral-600'
              }`}>
                <span>{
                  p.cultivationType === 'organic_certified' ? '🌿 Βιολογική (Πιστοποιημένη)' :
                  p.cultivationType === 'organic_transitional' ? '🌱 Βιολογική (Μεταβατική)' :
                  p.cultivationType === 'biodynamic' ? '✨ Βιοδυναμική' :
                  p.cultivationType === 'traditional_natural' ? '🌾 Παραδοσιακή / Φυσική' :
                  p.cultivationType === 'conventional' ? 'Συμβατική' :
                  'Άλλο'
                }</span>
              </span>
              {p.cultivationDescription && (
                <p className="mt-1 text-xs text-neutral-500">{p.cultivationDescription}</p>
              )}
            </div>
          )}

          {/* Price + Stock */}
          <div className="mb-6 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-neutral-900" data-testid="product-price">
              {fmt(Number(p.price||0))}
            </span>
            <span className="text-lg text-neutral-500">/ {p.unit}</span>
            <span
              className={`ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                Number(p.stock||0) > 0
                  ? 'bg-primary-pale text-primary'
                  : 'bg-red-100 text-red-600'
              }`}
              data-testid="product-stock"
            >
              {Number(p.stock||0) > 0 ? t('product.inStock') : t('product.outOfStock')}
            </span>
          </div>

          {/* Description */}
          {p.description && (
            <div className="mb-6">
              <h2 className="text-base font-semibold text-neutral-900 mb-2">
                {t('product.description')}
              </h2>
              <p className="text-neutral-600 leading-relaxed whitespace-pre-line">
                {p.description}
              </p>
            </div>
          )}

          {/* Add to Cart — Pass CART-UX-FEEDBACK-01: include imageUrl */}
          <div className="mt-auto">
            <Add
              product={{ ...p, imageUrl: p.imageUrl || null }}
              translations={{
                addToCart: t('product.addToCart'),
                cartAdded: t('cart.added')
              }}
            />
          </div>
        </div>
      </div>

      {/* S1-02: Reviews Section */}
      <ReviewSection productId={p.id} />

      {/* Back to Products */}
      <div className="mt-10 pt-6 border-t border-neutral-200">
        <Link
          href="/products"
          className="inline-flex items-center text-sm text-neutral-500 hover:text-primary transition-colors"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('product.backToProducts')}
        </Link>
      </div>
    </main>
    </>
  );
}
