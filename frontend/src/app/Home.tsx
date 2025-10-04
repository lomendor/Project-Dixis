import { Product } from '@/lib/api';
import HomeClient from './HomeClient';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8001/api/v1';

async function getInitialProducts(): Promise<Product[]> {
  try {
    const url = `${API_BASE_URL}/public/products?per_page=20&sort=created_at`;
    const res = await fetch(url, {
      next: { revalidate: 3600 }, // ISR: revalidate every hour
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

export default async function Home() {
  const initialProducts = await getInitialProducts();

  return <HomeClient initialProducts={initialProducts} />;
}
