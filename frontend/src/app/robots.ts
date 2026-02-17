import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/auth', '/producer', '/account', '/ops', '/my', '/checkout', '/internal'],
      },
    ],
    sitemap: 'https://dixis.gr/sitemap.xml',
  }
}
