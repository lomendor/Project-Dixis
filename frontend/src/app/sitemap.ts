import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://dixis.io';
  const now = new Date().toISOString();
  // Μπορούμε αργότερα να προσθέσουμε dynamic products.
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/products`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
  ];
}
