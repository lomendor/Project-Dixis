import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from '@/lib/i18n/t';
import type { Metadata } from 'next';
import Add from './ui/Add';
import ReviewSection from '@/components/product/ReviewSection';
import RelatedProducts from '@/components/product/RelatedProducts';
import StarRating from '@/components/StarRating';
import ImageGallery from '@/components/product/ImageGallery';
import { getBaseUrl } from '@/lib/site';
import { getServerApiUrl } from '@/env';
import { getCategoryBySlug } from '@/data/categories';

// T3-01: ISR — regenerate every 5 minutes (was force-dynamic + revalidate=0)
export const revalidate = 300;

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
    const res = await fetch(`${base}/public/products/${id}`, { next: { revalidate: 300 } });
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
      images: (raw.images || []).map((img: any) => ({
        id: img.id,
        url: img.url || img.image_path,
        altText: img.alt_text || null,
        isPrimary: !!img.is_primary,
      })),
      producer: raw.producer ? { name: raw.producer.name } : null,
      // Pass HOTFIX-MP-CHECKOUT-GUARD-01: Include producer_id for multi-producer cart detection
      producerId: raw.producer_id || raw.producer?.id || null,
      producerSlug: raw.producer?.slug || null,
      producerName: raw.producer?.name || null,
      cultivationType: raw.cultivation_type || null,
      cultivationDescription: raw.cultivation_description || null,
      // S1-02: Review stats
      reviewsCount: raw.reviews_count ?? 0,
      reviewsAvgRating: raw.reviews_avg_rating ?? null,
      // Pass SEASONAL-DISCOUNT-01: Discount + seasonal data
      discountPrice: raw.discount_price ? parseFloat(raw.discount_price) : null,
      isSeasonal: !!raw.is_seasonal,
      // EU 1169/2011: Allergens + Ingredients
      allergens: Array.isArray(raw.allergens) ? raw.allergens : [],
      ingredients: raw.ingredients || null,
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
    },
    // S1-02 SEO: Show star ratings in Google search results
    ...(p.reviewsAvgRating ? {
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': p.reviewsAvgRating,
        'reviewCount': p.reviewsCount || 1
      }
    } : {})
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* T3-03: BreadcrumbList JSON-LD for Google rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Αρχική', 'item': baseUrl },
            { '@type': 'ListItem', 'position': 2, 'name': 'Προϊόντα', 'item': `${baseUrl}/products` },
            { '@type': 'ListItem', 'position': 3, 'name': p.title, 'item': `${baseUrl}/products/${id}` },
          ],
        }) }}
      />
      <main className="min-h-screen bg-gradient-to-b from-accent-cream via-accent-cream/30 to-white py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
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

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Image Gallery — Pass IMAGE-GALLERY-01 */}
        <ImageGallery images={p.images} fallbackUrl={p.imageUrl} alt={p.title} />

        {/* Product Info */}
        <div className="flex flex-col">
          {/* Producer ABOVE title (provenance-first, Natoora pattern) */}
          {p.producer?.name && (
            <p className="text-sm font-medium text-accent-gold uppercase tracking-wider mb-2" data-testid="product-producer">
              {(p.producerSlug || p.producerId) ? (
                <Link href={`/producers/${p.producerSlug || p.producerId}`} className="hover:underline transition-colors">
                  {p.producer.name}
                </Link>
              ) : (
                <span>{p.producer.name}</span>
              )}
            </p>
          )}

          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2" data-testid="product-title">
            {p.title}
          </h1>

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

          {/* Pass SEASONAL-DISCOUNT-01: Seasonal badge on detail page */}
          {p.isSeasonal && (
            <div className="mb-3" data-testid="seasonal-badge">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                🍊 Εποχιακό Προϊόν
              </span>
            </div>
          )}

          {/* Price + Stock */}
          <div className="mb-6 flex items-baseline gap-3">
            {p.discountPrice != null && p.discountPrice < Number(p.price || 0) ? (
              <>
                <span className="text-3xl font-bold text-red-600" data-testid="product-price">
                  {fmt(p.discountPrice)}
                </span>
                <span className="text-lg text-neutral-400 line-through" data-testid="product-original-price">
                  {fmt(Number(p.price || 0))}
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold text-neutral-900" data-testid="product-price">
                {fmt(Number(p.price||0))}
              </span>
            )}
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

          {/* EU 1169/2011: Allergens display */}
          {p.allergens && p.allergens.length > 0 && (
            <div className="mb-6" data-testid="allergens-section">
              <h2 className="text-base font-semibold text-neutral-900 mb-2">
                Αλλεργιογόνα
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {p.allergens.map((a: string) => {
                  const labels: Record<string, string> = {
                    gluten: 'Γλουτένη', crustaceans: 'Καρκινοειδή', eggs: 'Αβγά',
                    fish: 'Ψάρια', peanuts: 'Αράπικα φιστίκια', soybeans: 'Σόγια',
                    milk: 'Γάλα', nuts: 'Ξηροί καρποί', celery: 'Σέλινο',
                    mustard: 'Μουστάρδα', sesame: 'Σουσάμι', sulphites: 'Θειώδη',
                    lupin: 'Λούπινα', molluscs: 'Μαλάκια',
                  };
                  return (
                    <span key={a} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                      {labels[a] || a}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ingredients display */}
          {p.ingredients && (
            <div className="mb-6" data-testid="ingredients-section">
              <h2 className="text-base font-semibold text-neutral-900 mb-2">
                Συστατικά
              </h2>
              <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-line">
                {p.ingredients}
              </p>
            </div>
          )}

          {/* S3-01: Cost Transparency — show where the money goes */}
          <div className="mb-6 rounded-lg border border-accent-gold/20 bg-accent-cream p-3" data-testid="cost-transparency">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 text-accent-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  88¢ από κάθε €1 πάνε στον παραγωγό
                </p>
                <p className="text-xs text-neutral-600 mt-0.5">
                  Ασφαλείς πληρωμές · Υποστήριξη · Ποιοτικός έλεγχος
                </p>
              </div>
            </div>
          </div>

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

      {/* RELATED-PRODUCTS-01: "You might also like" section */}
      <RelatedProducts productId={p.id} producerId={p.producerId} />

      {/* Back to Products */}
      <div className="mt-10 pt-6 border-t border-accent-gold/10">
        <Link
          href="/products"
          className="inline-flex items-center text-sm text-neutral-500 hover:text-accent-gold transition-colors"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('product.backToProducts')}
        </Link>
      </div>
      </div>
    </main>
    </>
  );
}
