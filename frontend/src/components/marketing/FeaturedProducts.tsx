import Link from 'next/link';
import { ProductCard, ProductCardSkeleton } from '@/components/ProductCard';
import { getServerApiUrl } from '@/env';

/**
 * Pass FEATURED-PRODUCTS-01: Curated featured products section for homepage.
 *
 * Strategy: fetch all products, sort by rating (best first), then by newest.
 * Shows up to 8 products that have images and stock — creating a curated feel.
 *
 * Features:
 * - Server component for optimal performance
 * - Smart product ranking: rated products first, then newest
 * - Only shows in-stock products with images (curated quality)
 * - Mobile-first grid (2-col mobile, 3-col tablet, 4-col desktop)
 * - CI/test environment fallback
 */

interface ApiProduct {
  id: string | number;
  name: string;
  slug: string;
  price: number;
  discount_price?: number | null;
  is_seasonal?: boolean;
  unit: string;
  stock: number;
  image_url?: string | null;
  images?: { id: number; url: string; is_primary: boolean }[];
  producer_id?: string | number;
  producer?: { id: string; name: string; slug: string } | null;
  reviews_count?: number;
  reviews_avg_rating?: number | null;
}

async function getFeaturedProducts(): Promise<ApiProduct[]> {
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
    const res = await fetch(`${base}/public/products?per_page=50`, {
      next: { revalidate: 3600 },
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) return [];

    const json = await res.json();
    const all: ApiProduct[] = json?.data ?? [];

    // Curate: only products with stock and an image
    const curated = all.filter((p) => {
      const hasImage = p.image_url || (p.images && p.images.length > 0);
      return p.stock > 0 && hasImage;
    });

    // Sort: best-rated first, then newest (by id desc as proxy)
    curated.sort((a, b) => {
      const ratingA = a.reviews_avg_rating ?? 0;
      const ratingB = b.reviews_avg_rating ?? 0;
      if (ratingB !== ratingA) return ratingB - ratingA;
      return Number(b.id) - Number(a.id);
    });

    return curated.slice(0, 8);
  } catch {
    return [];
  }
}

export default async function FeaturedProducts() {
  const products = await getFeaturedProducts();
  const hasProducts = products.length > 0;

  return (
    <section className="bg-gradient-to-b from-white to-accent-cream/30 py-16 sm:py-20 lg:py-24" data-testid="featured-products">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <p className="text-sm font-medium text-accent-gold uppercase tracking-wider mb-2">Επιλεγμένα για Εσάς</p>
            <h2 className="text-3xl font-bold text-neutral-900 mb-2 sm:text-4xl">
              Προτεινόμενα Προϊόντα
            </h2>
            <p className="text-lg text-neutral-600">
              Τα καλύτερα προϊόντα από τοπικούς παραγωγούς
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center justify-center sm:justify-start gap-2 text-primary font-semibold hover:text-primary-light transition-colors min-h-[44px] touch-manipulation"
          >
            Δείτε όλα
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Products grid */}
        {hasProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 sm:gap-7">
            {products.map((product) => {
              const imageUrl = product.image_url || product.images?.[0]?.url || null;
              return (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.name}
                  producer={product.producer?.name || null}
                  producerId={product.producer_id}
                  producerSlug={product.producer?.slug || null}
                  priceCents={Math.round(product.price * 100)}
                  image={imageUrl}
                  stock={product.stock}
                  reviewsCount={product.reviews_count}
                  reviewsAvgRating={product.reviews_avg_rating}
                />
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 sm:gap-7">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-10 sm:mt-12">
          <Link
            href="/products"
            className="inline-flex items-center justify-center min-h-[48px] px-8 py-3 bg-white hover:bg-accent-cream text-accent-gold font-semibold rounded-lg border-2 border-accent-gold transition-all duration-200 active:scale-[0.98] touch-manipulation"
          >
            Εξερευνήστε Περισσότερα Προϊόντα
          </Link>
        </div>
      </div>
    </section>
  );
}
