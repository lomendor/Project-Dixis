import { cache } from 'react';

export interface Product {
  id: string | number;
  title: string;
  producer: string;
  priceFormatted: string;
  priceCents: number | null;
  imageUrl: string;
  isAvailable: boolean;
}

const MOCK_PRODUCTS: Product[] = Array.from({ length: 8 }).map((_, i) => {
  const cents = Math.round((2 + i * 0.4) * 100);
  return {
    id: `mock-${i}`,
    title: `Δείγμα Προϊόντος ${i + 1}`,
    producer: 'Demo Παραγωγός',
    priceFormatted: `${(cents / 100).toFixed(2)}€`,
    priceCents: cents,
    imageUrl: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&h=800&fit=crop',
    isAvailable: true,
  };
});

const fmtPrice = (item: any): string => {
  if (item.price_text) return item.price_text;
  if (typeof item.price === 'number') return `${item.price}€`;
  if (typeof item.price_cents === 'number') return `${(item.price_cents / 100).toFixed(2)}€`;
  return '—';
};

const imgUrl = (item: any): string => item.image || item.img || 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&h=800&fit=crop';

const centsFrom = (item: any): number | null => {
  if (typeof item.price_cents === 'number') return item.price_cents;
  if (typeof item.price === 'number') return Math.round(item.price * 100);
  return null;
};

export const getProducts = cache(async (): Promise<Product[]> => {
  // 1) Προσπάθησε REAL API (εάν υπάρχει NEXT_PUBLIC_API_BASE_URL)
  try {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (base) {
      const res = await fetch(`${base}/products`, { headers: { 'Accept': 'application/json' }, next: { revalidate: 30 } });
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data.data || []);
        if (items.length > 0) {
          return items.map((it: any) => ({
            id: it.id,
            title: it.title || it.name || 'Άγνωστο Προϊόν',
            producer: it.producer_name || it.producer?.name || 'Άγνωστος Παραγωγός',
            priceFormatted: fmtPrice(it),
            priceCents: centsFrom(it),
            imageUrl: imgUrl(it),
            isAvailable: true
          }));
        }
      }
    }
  } catch {}

  // 2) Fallback: demo API του Next
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/demo-products`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const items = data.items || [];
      if (items.length > 0) {
        return items.map((it: any) => ({
          id: it.id,
          title: it.title || it.name || 'Άγνωστο Προϊόν',
          producer: it.producer_name || it.producer?.name || 'Άγνωστος Παραγωγός',
          priceFormatted: fmtPrice(it),
          priceCents: centsFrom(it),
          imageUrl: imgUrl(it),
          isAvailable: true
        }));
      }
    }
  } catch {}

  // 3) Τελικό fallback: MOCKS
  return MOCK_PRODUCTS;
});
