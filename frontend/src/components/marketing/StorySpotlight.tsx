import { getServerApiUrl } from '@/env';
import StoryRevealClient, { type SpotlightProducer } from './StoryRevealClient';
import ProducerSpotlight from './ProducerSpotlight';

/**
 * StorySpotlight — Server wrapper for the cinematic story → producer reveal.
 *
 * Fetches the spotlight producer (same source as ProducerSpotlight) and feeds
 * it to the scroll-choreographed client component. Falls back to the plain
 * ProducerSpotlight if no producer is available.
 */

async function getSpotlightProducer(): Promise<SpotlightProducer | null> {
  const isCI = process.env.CI === 'true' || process.env.NODE_ENV === 'test';
  const isServer = typeof window === 'undefined';
  let base: string;
  if (isCI && isServer) {
    base = 'http://127.0.0.1:3001/api/v1';
  } else if (isServer) {
    base = getServerApiUrl();
  } else {
    base = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';
  }

  try {
    const res = await fetch(`${base}/public/producers?per_page=100`, {
      next: { revalidate: 120 },
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const producers: SpotlightProducer[] = json?.data ?? [];
    const withImage = producers.find((p) => p.description && p.image_url);
    const withDescription = producers.find((p) => p.description);
    return withImage ?? withDescription ?? producers[0] ?? null;
  } catch {
    return null;
  }
}

export default async function StorySpotlight() {
  const producer = await getSpotlightProducer();
  if (!producer) {
    return <ProducerSpotlight />;
  }
  return <StoryRevealClient producer={producer} />;
}
