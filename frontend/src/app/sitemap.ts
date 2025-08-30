import { MetadataRoute } from 'next';
import { SITE_URL } from '@/env';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date().toISOString();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/auth/login`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/auth/register`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // TODO: Add dynamic product and producer pages when available
  // This would typically fetch from your API:
  // const products = await apiClient.getProducts({ per_page: 1000 });
  // const productPages = products.data.map(product => ({
  //   url: `${SITE_URL}/products/${product.id}`,
  //   lastModified: product.updated_at || currentDate,
  //   changeFrequency: 'weekly' as const,
  //   priority: 0.8,
  // }));

  // Placeholder for future dynamic pages
  const futurePlaceholders: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/products`,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/producers`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  return [...staticPages, ...futurePlaceholders];
}