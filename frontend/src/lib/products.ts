import { cache } from 'react';

export interface Product {
  id: string | number;
  title: string;
  producer: string;
  priceFormatted: string;
  imageUrl: string;
  isAvailable: boolean;
}

const MOCK_PRODUCTS: Product[] = Array.from({ length: 8 }).map((_, i) => ({
  id: `mock-${i}`,
  title: `Φρέσκες Τομάτες Βιολογικές ${i + 1}`,
  producer: 'Κτήμα Παπαδόπουλου',
  priceFormatted: `${(2.5 + i * 0.5).toFixed(2)}€ / kg`,
  imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&h=500&fit=crop',
  isAvailable: true,
}));

function formatPrice(item: any): string {
  if (item?.price_text) return item.price_text;
  if (typeof item?.price === 'number') return `${item.price}€`;
  if (typeof item?.price_cents === 'number') return `${(item.price_cents / 100).toFixed(2)}€`;
  return 'Κατόπιν συνεννόησης';
}

function getImageUrl(item: any): string {
  if (item?.image) return item.image;
  if (item?.img) return item.img;
  return 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=500&h=500&fit=crop';
}

/**
 * Δοκιμάζει σειρά endpoints:
 * 1) NEXT_PUBLIC_API_BASE_URL/products (αν υπάρχει)
 * 2) /api/demo-products (το demo feed μας)
 * 3) MOCK_PRODUCTS (τελική δικλείδα)
 */
async function fetchCandidates(): Promise<any[]> {
  const candidates: (string | null)[] = [
    process.env.NEXT_PUBLIC_API_BASE_URL ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/products` : null,
    '/api/demo-products',
  ].filter(Boolean) as string[];

  for (const url of candidates) {
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' as const });
      if (!res.ok) continue;
      const data = await res.json();
      // Μπορεί να είναι είτε array είτε { items: [...] } είτε { data: [...] }
      const arr = Array.isArray(data) ? data : (data?.items ?? data?.data ?? []);
      if (Array.isArray(arr)) return arr;
    } catch (_e) {
      // συνέχισε στον επόμενο candidate
    }
  }
  return [];
}

export const getProducts = cache(async (): Promise<Product[]> => {
  const raw = await fetchCandidates();
  if (!raw.length) return MOCK_PRODUCTS;

  return raw.map((item: any) => ({
    id: item?.id ?? crypto.randomUUID(),
    title: item?.title ?? item?.name ?? 'Άγνωστο Προϊόν',
    producer: item?.producer_name ?? item?.producer?.name ?? 'Άγνωστος Παραγωγός',
    priceFormatted: formatPrice(item),
    imageUrl: getImageUrl(item),
    isAvailable: item?.is_available ?? true,
  }));
});
