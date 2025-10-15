import { Product } from '@/lib/api';
import HomeClient from './HomeClient';
import { getTranslations } from 'next-intl/server';
import { apiPath } from '@/lib/runtime/urls';

async function getInitialProducts(): Promise<Product[]> {
  try {
    const url = apiPath('/api/public/products?per_page=20&sort=created_at');
    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) {
      console.error('Failed to fetch products:', res.status);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data?.data) ? data.data : [];
  } catch (error) {
    console.error('Error fetching products:', error);
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
