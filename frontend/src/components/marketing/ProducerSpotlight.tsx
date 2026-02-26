import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ArrowRight, Users } from 'lucide-react';
import { getServerApiUrl } from '@/env';

/**
 * ProducerSpotlight — Magazine-style producer feature for homepage
 *
 * This is the homepage differentiator. No Greek marketplace does producer
 * storytelling well — this section showcases a real producer with their
 * story, region, and product count.
 *
 * Server component with ISR (1 hour). Picks the first producer that
 * has a description and image. Falls back to a generic CTA if none found.
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

    // Pick the first producer with description — prefer those with images
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
      <section className="py-16 sm:py-20 bg-accent-cream/40">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 text-center">
          <Users className="w-10 h-10 text-primary/40 mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-3">
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

  // Truncate description to ~150 chars for clean layout
  const shortDesc =
    producer.description.length > 160
      ? producer.description.slice(0, 155).trim() + '...'
      : producer.description;

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-accent-cream/40">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
        {/* Eyebrow */}
        <div className="text-center mb-10 sm:mb-12">
          <p className="text-xs font-semibold tracking-wider text-primary/60 uppercase mb-2">
            Γνωρίστε τον Παραγωγό
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900">
            Πίσω από κάθε Προϊόν
          </h2>
        </div>

        {/* Magazine-style card */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image column */}
            <div className="relative aspect-[4/3] md:aspect-auto bg-primary-pale/30">
              {producer.image_url ? (
                <Image
                  src={producer.image_url}
                  alt={producer.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Users className="w-20 h-20 text-primary/20" />
                </div>
              )}
            </div>

            {/* Content column */}
            <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-2">
                {producer.name}
              </h3>

              {producer.region && (
                <div className="inline-flex items-center gap-1.5 text-sm text-neutral-500 mb-4">
                  <MapPin className="w-3.5 h-3.5" />
                  {producer.region}
                </div>
              )}

              <p className="text-base text-neutral-600 leading-relaxed mb-6">
                {shortDesc}
              </p>

              {/* Stats + CTA */}
              <div className="flex items-center justify-between">
                {producer.products_count > 0 && (
                  <span className="text-sm text-neutral-400">
                    {producer.products_count} προϊόντ{producer.products_count === 1 ? 'ο' : 'α'}
                  </span>
                )}
                <Link
                  href={`/producers/${producer.slug}`}
                  className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-light transition-colors"
                >
                  Μάθετε περισσότερα
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* View all producers link */}
        <div className="text-center mt-8">
          <Link
            href="/producers"
            className="text-sm font-medium text-neutral-500 hover:text-primary transition-colors"
          >
            Δείτε όλους τους παραγωγούς &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
