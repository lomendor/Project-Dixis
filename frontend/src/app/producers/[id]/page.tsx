import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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

async function getProducer(id: string): Promise<Producer | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${baseUrl}/api/producers/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Error fetching producer:', error);
    return null;
  }
}

export default async function ProducerDetailPage({ params }: { params: { id: string } }) {
  const t = await getTranslations();
  const producer = await getProducer(params.id);

  if (!producer) {
    notFound();
  }

  return (
    <div className="producer-detail-page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/producers">&larr; {t('producers.title')}</Link>
      </nav>

      <article className="producer-detail card">
        <header className="detail-header">
          <h1>{producer.name}</h1>
          <p className="producer-meta">
            <span className="meta-label">{t('producers.region')}:</span> {producer.region}
          </p>
          <p className="producer-meta">
            <span className="meta-label">{t('producers.category')}:</span> {producer.category}
          </p>
          {producer.rating && (
            <p className="producer-rating">⭐ {producer.rating.toFixed(1)}</p>
          )}
        </header>

        {producer.description && (
          <section className="detail-section">
            <p className="producer-description">{producer.description}</p>
          </section>
        )}

        <section className="detail-section">
          <h2>{t('producers.detail.contact')}</h2>
          {producer.email && (
            <p>
              <strong>Email:</strong> <a href={`mailto:${producer.email}`}>{producer.email}</a>
            </p>
          )}
          {producer.phone && (
            <p>
              <strong>Phone:</strong> <a href={`tel:${producer.phone}`}>{producer.phone}</a>
            </p>
          )}
        </section>

        <section className="detail-section">
          <h2>{t('producers.detail.products')}</h2>
          <p className="text-muted">{producer.products} {t('producers.products')}</p>
        </section>
      </article>
    </div>
  );
}
