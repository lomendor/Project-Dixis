import type { MetadataRoute } from 'next';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = process.env.NEXT_PUBLIC_SITE_URL || 'https://dixis.io';
  const now = new Date().toISOString();
  return [
    { url: `${host}/`, lastModified: now },
    { url: `${host}/products`, lastModified: now },
    { url: `${host}/legal/terms`, lastModified: now },
    { url: `${host}/legal/privacy`, lastModified: now }
  ];
}
