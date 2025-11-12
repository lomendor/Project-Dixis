import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const isStaging = process.env.NEXT_PUBLIC_ENV === 'staging';
  return {
    rules: isStaging
      ? [{ userAgent: '*', disallow: '/' }]
      : [{ userAgent: '*', allow: '/' }],
    sitemap: 'https://dixis.io/sitemap.xml',
    host: 'https://dixis.io',
  };
}
