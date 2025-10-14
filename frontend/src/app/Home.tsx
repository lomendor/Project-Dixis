import { Product } from '@/lib/api';
import HomeClient from './HomeClient';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';

async function getBaseUrl() {
  // Prefer explicit ENV variable for dev stability
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env;

  // Fallback to headers for production/proxy scenarios
  const headersList = await headers();
  const host = headersList.get('x-forwarded-host') ?? headersList.get('host') ?? 'localhost:3000';
  const proto = headersList.get('x-forwarded-proto') ?? 'http';
  return `${proto}://${host}`;
}

async function tryFetchProducts(urlPrimary: string): Promise<Product[]> {
  try {
    const res = await fetch(urlPrimary, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    return Array.isArray(data?.data) ? data.data : [];
  } catch (e) {
    // Fallback to ENV base if primary URL fails
    const fallback = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000') + '/api/public/products?per_page=20&sort=created_at';
    if (urlPrimary !== fallback) {
      try {
        const r2 = await fetch(fallback, { cache: 'no-store' });
        if (r2.ok) {
          const d = await r2.json();
          return Array.isArray(d?.data) ? d.data : [];
        }
      } catch {}
    }
    console.error('Error fetching products:', e);
    return [];
  }
}

async function getInitialProducts(): Promise<Product[]> {
  try {
    const base = await getBaseUrl();
    const url = `${base}/api/public/products?per_page=20&sort=created_at`;
    return await tryFetchProducts(url);
  } catch (error) {
    console.error('Error in getInitialProducts:', error);
    return [];
  }
}

export default async function Home() {
  const initialProducts = await getInitialProducts();
  const t = await getTranslations();

  return (
    <>
      {/* LCP Anchor: Raw IMG with eager loading + high priority */}
      <header className="hero" data-lcp-anchor="hero-raster">
        <img
          src="/hero-lcp.png"
          alt={t('home.title')}
          width="1200"
          height="480"
          loading="eager"
          fetchPriority="high"
          style={{display: "block", width: "100%", height: "auto", maxHeight: "60vh", objectFit: "cover"}}
        />
        <h1 className="lcp-hero-title">{t('home.title')}</h1>
      </header>
      <HomeClient initialProducts={initialProducts} />
    </>
  );
}
