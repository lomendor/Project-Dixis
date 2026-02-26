import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ArrowRight, Users } from 'lucide-react';
import { getServerApiUrl } from '@/env';

/**
 * ProducerSpotlight — Full-width magazine-style producer feature
 *
 * Inspired by Wildfarmed and Food52: edge-to-edge image + generous text column.
 * No rounded corners, no card shadow — editorial gravitas.
 * Server component with ISR (1 hour).
 */

interface Producer {
  id: string | number;
  slug: string;
  name: string;
  region: string;
  description: string;
  image_url: string | null;
  products_count: number;
}

async function getSpotlightProducer(): Promise<Producer | null> {
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
      next: { revalidate: 3600 },
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) return null;

    const json = await res.json();
    const producers: Producer[] = json?.data ?? [];

    const withImage = producers.find((p) => p.description && p.image_url);
    const withDescription = producers.find((p) => p.description);
    return withImage ?? withDescription ?? producers[0] ?? null;
  } catch {
    return null;
  }
}

export default async function ProducerSpotlight() {
  const producer = await getSpotlightProducer();

  // Fallback: generic CTA to become a producer
  if (!producer) {
    return (
      <section className="py-20 sm:py-24 bg-[#f5f0e6]">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 text-center">
          <Users className="w-10 h-10 text-primary/40 mx-auto mb-4" />
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-normal text-neutral-900 mb-3 tracking-[-0.01em]">
            Γνωρίστε τους Παραγωγούς μας
          </h2>
          <p className="text-base text-neutral-500 max-w-md mx-auto mb-6">
            Πίσω από κάθε προϊόν υπάρχει ένας Έλληνας παραγωγός με πάθος και ιστορία.
          </p>
          <Link
            href="/producers"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-light text-white font-semibold text-sm rounded-full transition-all duration-200"
          >
            Δείτε τους Παραγωγούς
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    );
  }

  const shortDesc =
    producer.description.length > 200
      ? producer.description.slice(0, 195).trim() + '...'
      : producer.description;

  return (
    <section className="bg-[#f5f0e6]">
      {/* Full-width magazine spread — no container max-width, no rounded corners */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[450px] lg:min-h-[560px]">
        {/* Image column — full bleed */}
        <div className="relative aspect-[4/3] lg:aspect-auto bg-primary-pale/30">
          {producer.image_url ? (
            <Image
              src={producer.image_url}
              alt={producer.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[#edf6f0]">
              <Users className="w-24 h-24 text-primary/15" />
            </div>
          )}
        </div>

        {/* Content column — generous padding, editorial tone */}
        <div className="px-8 py-12 sm:px-12 sm:py-16 lg:px-16 xl:px-20 lg:py-0 flex flex-col justify-center">
          <p className="text-xs font-semibold tracking-widest text-primary/50 uppercase mb-4">
            Γνωρίστε τον Παραγωγό
          </p>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-normal text-neutral-900 mb-3 tracking-[-0.01em]">
            {producer.name}
          </h2>

          {producer.region && (
            <div className="inline-flex items-center gap-1.5 text-sm text-neutral-500 mb-6">
              <MapPin className="w-3.5 h-3.5" />
              {producer.region}
            </div>
          )}

          <p className="text-base sm:text-lg text-neutral-600 leading-relaxed mb-8 max-w-lg">
            {shortDesc}
          </p>

          {/* Stats + CTA */}
          <div className="flex items-center gap-6">
            <Link
              href={`/producers/${producer.slug}`}
              className="group inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-light text-white font-semibold text-sm rounded-full transition-all duration-200"
            >
              Η Ιστορία του
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            {producer.products_count > 0 && (
              <span className="text-sm text-neutral-400">
                {producer.products_count} προϊόντ{producer.products_count === 1 ? 'ο' : 'α'}
              </span>
            )}
          </div>

          {/* View all link */}
          <div className="mt-8 pt-6 border-t border-neutral-300/40">
            <Link
              href="/producers"
              className="text-sm font-medium text-neutral-500 hover:text-primary transition-colors"
            >
              Δείτε όλους τους παραγωγούς &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
