import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { getServerApiUrl } from '@/env';

type ApiProduct = {
  id: number;
  name: string;
  price: string | number;
  stock: number;
  image_url?: string | null;
  images?: { url: string }[];
  producer_id?: number;
  producer?: { id: number; name: string; slug?: string } | null;
};

/**
 * Pass RELATED-PRODUCTS-01: "You might also like" section on product detail page.
 *
 * Strategy: fetch products from same producer. If not enough, fill with
 * other products. Excludes the current product. Shows up to 4.
 */
export default async function RelatedProducts({
  productId,
  producerId,
}: {
  productId: number;
  producerId?: number | null;
}) {
  const products = await getRelated(productId, producerId);
  if (products.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-neutral-200" data-testid="related-products">
      <h2 className="text-2xl font-bold text-neutral-900 mb-6">
        Μπορεί να σας αρέσουν
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {products.map((p) => {
          const imageUrl = p.image_url || p.images?.[0]?.url || null;
          return (
            <ProductCard
              key={p.id}
              id={p.id}
              title={p.name}
              producer={p.producer?.name || null}
              producerId={p.producer_id || p.producer?.id}
              producerSlug={p.producer?.slug || null}
              priceCents={Math.round(parseFloat(String(p.price)) * 100)}
              image={imageUrl}
              stock={p.stock}
            />
          );
        })}
      </div>
      <div className="text-center mt-6">
        <Link
          href="/products"
          className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-light transition-colors"
        >
          Δείτε όλα τα προϊόντα
          <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </section>
  );
}

async function getRelated(
  productId: number,
  producerId?: number | null
): Promise<ApiProduct[]> {
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
    const res = await fetch(`${base}/public/products?per_page=20`, {
      next: { revalidate: 300 },
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const all: ApiProduct[] = json?.data ?? [];

    // Exclude current product
    const others = all.filter((p) => p.id !== productId);

    // Prioritize same producer
    const sameProducer = producerId
      ? others.filter((p) => (p.producer_id || p.producer?.id) === producerId)
      : [];
    const rest = others.filter((p) => !sameProducer.includes(p));

    // Take up to 4: prefer same producer, then fill with others
    const result = [...sameProducer, ...rest].slice(0, 4);
    return result;
  } catch {
    return [];
  }
}
