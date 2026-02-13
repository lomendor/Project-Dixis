import { MetadataRoute } from 'next';
import { getServerApiUrl, SITE_URL } from '@/env';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || SITE_URL;

// SSOT: Use centralized env resolution for SSR API calls (see src/env.ts)
const API_BASE = getServerApiUrl();

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
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/producers/join`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
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
        .map((product) => {
          const date = new Date(product.updated_at);
          const lastModified = isNaN(date.getTime()) ? new Date() : date;
          return {
            url: `${BASE_URL}/products/${product.id}`,
            lastModified,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
          };
        });
    }
  } catch (error) {
    console.error('[Sitemap] Error fetching products from API:', error);
    // Continue with static pages only - graceful degradation
  }

  return [...staticPages, ...productPages];
}
