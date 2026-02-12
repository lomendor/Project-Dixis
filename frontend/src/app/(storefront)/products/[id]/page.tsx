import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from '@/lib/i18n/t';
import type { Metadata } from 'next';
import Add from './ui/Add';
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
      producerName: raw.producer?.name || null
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
    title: `${p.title} - Dixis`,
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
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="text-blue-600 hover:underline">
              {t('nav.home')}
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <Link href="/products" className="text-blue-600 hover:underline">
              {t('products.title')}
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-600">{p.title}</li>
        </ol>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
          {p.imageUrl ? (
            <img
              src={p.imageUrl}
              alt={p.title}
              className="w-full h-full object-cover"
              data-testid="product-image"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
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

          {p.category && (
            <p className="text-gray-600 mb-2">{getCategoryBySlug(p.category)?.labelEl || p.category}</p>
          )}

          {/* Producer */}
          {p.producer?.name && (
            <p className="text-sm text-emerald-700 mb-4" data-testid="product-producer">
              Από τον παραγωγό: <span className="font-medium">{p.producer.name}</span>
            </p>
          )}

          {/* Price */}
          <div className="mb-4">
            <span className="text-sm text-gray-600 block mb-1">
              {t('product.price')}
            </span>
            <span className="text-3xl font-bold" data-testid="product-price">
              {fmt(Number(p.price||0))} / {p.unit}
            </span>
          </div>

          {/* Stock Status */}
          <div className="mb-6" data-testid="product-stock">
            <span className="text-sm text-gray-600 block mb-1">
              {t('product.stock')}
            </span>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                Number(p.stock||0) > 0
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {Number(p.stock||0) > 0 ? t('product.inStock') : t('product.outOfStock')} ({Number(p.stock||0)})
            </span>
          </div>

          {/* Description */}
          {p.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">
                {t('product.description')}
              </h2>
              <p className="text-gray-700 whitespace-pre-line">
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

      {/* Back to Products */}
      <div className="mt-8">
        <Link
          href="/products"
          className="inline-flex items-center text-blue-600 hover:underline"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {t('product.backToProducts')}
        </Link>
      </div>
    </main>
    </>
  );
}
