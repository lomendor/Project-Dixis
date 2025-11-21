import { cache } from 'react';
import { promises as fs } from 'node:fs';
import path from 'node:path';

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
 * 2) demo/products.json file (build-time compatible)
 * 3) MOCK_PRODUCTS (τελική δικλείδα)
 */
async function fetchCandidates(): Promise<any[]> {
  // 1) Δοκίμασε εξωτερικό API
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/products`;
      const res = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' as const });
      if (res.ok) {
        const data = await res.json();
        const arr = Array.isArray(data) ? data : (data?.items ?? data?.data ?? []);
        if (Array.isArray(arr) && arr.length > 0) return arr;
      }
    } catch (_e) {
      // continue
    }
  }

  // 2) Διάβασε demo/products.json file (works at build time)
  try {
    const demoPath = path.join(process.cwd(), 'public', 'demo', 'products.json');
    const raw = await fs.readFile(demoPath, 'utf8');
    const data = JSON.parse(raw);
    if (Array.isArray(data) && data.length > 0) return data;
  } catch (_e) {
    // continue
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
