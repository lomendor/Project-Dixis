import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://dixis.gr';

// Use internal API during build (SSR), external for runtime
const API_BASE = process.env.INTERNAL_API_URL || 'https://dixis.gr/api/v1';

interface ProductForSitemap {
  id: number;
  updated_at: string;
  is_active: boolean;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/producers`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/legal/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/legal/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Dynamic product pages from Laravel API (single source of truth)
  let productPages: MetadataRoute.Sitemap = [];

  try {
    const response = await fetch(`${API_BASE}/public/products?per_page=100`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (response.ok) {
      const data = await response.json();
      const products: ProductForSitemap[] = data.data || [];

      productPages = products
        .filter((p) => p.is_active)
        .map((product) => ({
          url: `${BASE_URL}/products/${product.id}`,
          lastModified: new Date(product.updated_at),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }));
    }
  } catch (error) {
    console.error('[Sitemap] Error fetching products from API:', error);
    // Continue with static pages only - graceful degradation
  }

  return [...staticPages, ...productPages];
}
