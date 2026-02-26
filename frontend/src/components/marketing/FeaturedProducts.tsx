import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProductCard, ProductCardSkeleton } from '@/components/ProductCard';
import { getServerApiUrl } from '@/env';

/**
 * FeaturedProducts — Curated product grid for the homepage
 *
 * Server component with ISR (1 hour). Fetches top-rated in-stock products
 * with images, shows max 8 in a responsive grid.
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
    <section
      className="py-20 sm:py-24 lg:py-28 bg-[#faf8f3]"
      data-testid="featured-products"
    >
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
        {/* Section header — eyebrow + title + "See all" */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 sm:mb-12">
          <div>
            <p className="text-xs font-semibold tracking-wider text-primary/60 uppercase mb-2">
              Επιλεγμένα για Εσάς
            </p>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-[2.5rem] font-normal text-neutral-900 tracking-[-0.01em]">
              Δοκιμάστε τα Αγαπημένα μας
            </h2>
            <p className="text-base text-neutral-500 mt-1">
              Τα καλύτερα προϊόντα από τοπικούς παραγωγούς
            </p>
          </div>
          <Link
            href="/products"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-light transition-colors"
          >
            Δείτε όλα
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Products grid */}
        {hasProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-accent-cream hover:bg-accent-beige text-neutral-800 font-semibold text-sm rounded-full border border-neutral-200 transition-all duration-200 hover:shadow-md active:scale-[0.97] touch-manipulation"
          >
            Εξερευνήστε Περισσότερα Προϊόντα
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
