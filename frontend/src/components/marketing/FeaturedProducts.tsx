import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProductCard, ProductCardSkeleton } from '@/components/ProductCard';
import { getServerApiUrl } from '@/env';
import ScrollableRow from '@/components/ui/ScrollableRow';

/**
 * FeaturedProducts — Horizontal scroll carousel for the homepage
 *
 * Wolt/Skroutz pattern: horizontal scrollable row of product cards.
 * Shows 2.3 cards on mobile (peek effect), 5-6 on desktop.
 * Scrollbar hidden for clean look, touch-scrollable on mobile.
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

    return curated.slice(0, 12);
  } catch {
    return [];
  }
}

export default async function FeaturedProducts() {
  const products = await getFeaturedProducts();
  const hasProducts = products.length > 0;

  return (
    <section
      className="py-6 sm:py-8 bg-white"
      data-testid="featured-products"
    >
      {/* Section header — inside container */}
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 mb-4 sm:mb-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
            Δημοφιλή Προϊόντα
          </h2>
          <Link
            href="/products"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-light transition-colors"
          >
            Δείτε όλα
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* Horizontal scroll container with arrows */}
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
        {hasProducts ? (
          <ScrollableRow>
            <div className="flex gap-1 sm:gap-1.5 pb-2">
              {products.map((product) => {
                const imageUrl = product.image_url || product.images?.[0]?.url || null;
                return (
                  <div
                    key={product.id}
                    className="flex-none w-[48vw] sm:w-[30vw] md:w-[22vw] lg:w-[18vw] xl:w-[15vw]"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <ProductCard
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
                  </div>
                );
              })}
              {/* Right padding spacer */}
              <div className="flex-none w-1" aria-hidden="true" />
            </div>
          </ScrollableRow>
        ) : (
          <ScrollableRow>
            <div className="flex gap-1 sm:gap-1.5 pb-2">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="flex-none w-[48vw] sm:w-[30vw] md:w-[22vw] lg:w-[18vw] xl:w-[15vw]"
                >
                  <ProductCardSkeleton />
                </div>
              ))}
            </div>
          </ScrollableRow>
        )}
      </div>
    </section>
  );
}
