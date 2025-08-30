export function GET(): Response {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://projectdixis.com';
  
  const robotsTxt = `User-agent: *
Allow: /
Allow: /products
Allow: /producers
Allow: /auth/login
Allow: /auth/register

# Disallow admin and internal paths
Disallow: /admin
Disallow: /api
Disallow: /producer/dashboard
Disallow: /b2b
Disallow: /test-error
Disallow: /_next
Disallow: /checkout
Disallow: /cart

# Allow search engines to crawl product images
Allow: /*.jpg$
Allow: /*.png$
Allow: /*.webp$

# Crawl delay (be respectful)
Crawl-delay: 1

# Sitemap location
Sitemap: ${siteUrl}/sitemap.xml`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}