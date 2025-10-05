import { getTranslations } from 'next-intl/server';
import ProducersClient from './ProducersClient';

export const dynamic = 'force-dynamic';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8001/api/v1';

interface Producer {
  id: number;
  name: string;
  region?: string;
  category?: string;
  description?: string;
  created_at?: string;
}

async function getInitialProducers(): Promise<Producer[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/public/producers`, {
      next: { revalidate: 60 },
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) {
      console.error('Failed to fetch producers:', res.status);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    console.error('Error fetching producers:', error);
    return [];
  }
}

export default async function ProducersPage() {
  const t = await getTranslations();
  const initialProducers = await getInitialProducers();

  return (
    <div className="producers-page">
      <header className="page-header">
        <h1>{t('producers.title')}</h1>
      </header>
      <ProducersClient initialProducers={initialProducers} />
    </div>
  );
}
