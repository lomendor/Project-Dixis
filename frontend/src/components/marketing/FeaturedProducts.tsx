import Link from 'next/link';
import { ProductCard, ProductCardSkeleton } from '@/components/ProductCard';
import { getServerApiUrl } from '@/env';

/**
 * Featured Products Section - Mobile-first product showcase
 *
 * Features:
 * - Server component for optimal performance
 * - Fetches latest products from API
 * - Mobile-first grid (2-col mobile, 3-col tablet, 4-col desktop)
 * - Generous whitespace and touch-friendly cards
 * - Fallback UI for loading/error states
 */

interface ApiProduct {
  id: string | number;
  name: string;
  slug: string;
  price: number;
  unit: string;
  stock: number;
  image_url?: string | null;
  images?: { id: number; url: string; is_primary: boolean }[];
  producer_id?: string | number;
  producer?: { id: string; name: string; slug: string } | null;
}

async function getProducts(): Promise<ApiProduct[]> {
  try {
    const base = getServerApiUrl();
    const res = await fetch(`${base}/public/products?limit=8`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!res.ok) {
      console.error('Failed to fetch products:', res.status);
      return [];
    }

    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export default async function FeaturedProducts() {
  const products = await getProducts();
  const hasProducts = products.length > 0;

  return (
    <section className="bg-neutral-50 py-12 sm:py-16 lg:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section header - mobile-optimized */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900 mb-2 sm:text-4xl">
              Προτεινόμενα Προϊόντα
            </h2>
            <p className="text-lg text-neutral-600">
              Ανακαλύψτε τα πιο δημοφιλή προϊόντα από τοπικούς παραγωγούς
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

        {/* Products grid - mobile-first */}
        {hasProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
                />
              );
            })}
          </div>
        ) : (
          /* Loading skeletons */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* CTA below products - mobile-optimized */}
        <div className="text-center mt-10 sm:mt-12">
          <Link
            href="/products"
            className="inline-flex items-center justify-center min-h-[48px] px-8 py-3 bg-white hover:bg-neutral-50 text-primary font-semibold rounded-lg border-2 border-primary transition-all duration-200 active:scale-[0.98] touch-manipulation"
          >
            Εξερευνήστε Περισσότερα Προϊόντα
          </Link>
        </div>
      </div>
    </section>
  );
}
