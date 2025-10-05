import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Producer {
  id: string;
  slug: string;
  name: string;
  region: string;
  category: string;
  description?: string;
  phone?: string;
  email?: string;
  products: number;
  rating?: number;
}

async function fetchProducers(): Promise<{ items: Producer[]; total: number; pages: number }> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${baseUrl}/api/producers`, { cache: 'no-store' });
    if (!res.ok) {
      console.error('Failed to fetch producers:', res.status);
      return { items: [], total: 0, pages: 0 };
    }
    return await res.json();
  } catch (error) {
    console.error('Error fetching producers:', error);
    return { items: [], total: 0, pages: 0 };
  }
}

export default async function ProducersPage() {
  const t = await getTranslations();
  const { items, total } = await fetchProducers();

  return (
    <div className="producers-page">
      <header className="page-header">
        <h1>{t('producers.title')}</h1>
        <p>{t('producers.subtitle')}</p>
      </header>

      <div className="producers-list">
        {items.length === 0 ? (
          <p className="no-results">{t('producers.noResults')}</p>
        ) : (
          <div className="producers-grid">
            {items.map((producer) => (
              <Link key={producer.id} href={`/producers/${producer.id}`} className="producer-card">
                <h2>{producer.name}</h2>
                <p className="producer-region">{producer.region}</p>
                <p className="producer-category">{producer.category}</p>
                {producer.rating && (
                  <p className="producer-rating">⭐ {producer.rating.toFixed(1)}</p>
                )}
                <p className="producer-products">{producer.products} {t('producers.products')}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      <p className="producer-total">{t('producers.total')}: {total}</p>
    </div>
  );
}
