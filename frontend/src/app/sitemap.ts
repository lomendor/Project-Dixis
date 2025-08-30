import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://projectdixis.com';
  const currentDate = new Date().toISOString();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/auth/login`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/auth/register`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // TODO: Add dynamic product and producer pages when available
  // This would typically fetch from your API:
  // const products = await apiClient.getProducts({ per_page: 1000 });
  // const productPages = products.data.map(product => ({
  //   url: `${siteUrl}/products/${product.id}`,
  //   lastModified: product.updated_at || currentDate,
  //   changeFrequency: 'weekly' as const,
  //   priority: 0.8,
  // }));

  // Placeholder for future dynamic pages
  const futurePlaceholders: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/products`,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/producers`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  return [...staticPages, ...futurePlaceholders];
}