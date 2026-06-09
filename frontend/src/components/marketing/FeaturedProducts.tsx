import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getServerApiUrl } from '@/env';
import FeaturedCarousel, { type FeaturedItem } from '@/components/marketing/FeaturedCarousel';

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
      next: { revalidate: 120 },
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(8000),
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

  const items: FeaturedItem[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    producer: p.producer?.name || null,
    producerId: p.producer_id != null ? String(p.producer_id) : null,
    producerSlug: p.producer?.slug || null,
    priceCents: Math.round(p.price * 100),
    discountPriceCents:
      typeof p.discount_price === 'number' ? Math.round(p.discount_price * 100) : null,
    image: p.image_url || p.images?.[0]?.url || null,
    rating: p.reviews_avg_rating ?? null,
    reviewsCount: p.reviews_count,
    stock: p.stock,
  }));

  return (
    <section
      className="py-6 sm:py-8 bg-white"
      data-testid="featured-products"
    >
      {/* Section header — inside container */}
      <div className="max-w-[1800px] mx-auto px-5 sm:px-8 lg:px-12 mb-4 sm:mb-5">
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

      {/* Large image-forward cards with glass info panel + one-card arrows */}
      <div className="max-w-[1800px] mx-auto px-5 sm:px-8 lg:px-12">
        {hasProducts ? (
          <FeaturedCarousel items={items} />
        ) : (
          <div className="flex gap-4 overflow-hidden pb-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="shrink-0 w-[78vw] sm:w-[300px] aspect-[3/4] rounded-3xl bg-neutral-100 animate-pulse"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
