import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8001/api/v1';

interface Producer {
  id: number;
  name: string;
  region?: string;
  category?: string;
  description?: string;
  email?: string;
  phone?: string;
}

async function getProducer(id: string): Promise<Producer | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/public/producers/${id}`, {
      next: { revalidate: 60 },
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.data ?? null;
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
          {producer.region && (
            <p className="producer-meta">
              <span className="meta-label">{t('producers.region')}:</span>{' '}
              {producer.region}
            </p>
          )}
          {producer.category && (
            <p className="producer-meta">
              <span className="meta-label">{t('producers.category')}:</span>{' '}
              {producer.category}
            </p>
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
          <a
            href={`mailto:${producer.email ?? 'info@example.com'}`}
            className="btn btn-primary"
            aria-label={`${t('producers.contact')} - ${producer.name}`}
          >
            {t('producers.contact')}
          </a>
        </section>

        <section className="detail-section">
          <h2>{t('producers.detail.products')}</h2>
          <p className="text-muted">{t('common.loading')}</p>
        </section>
      </article>
    </div>
  );
}
