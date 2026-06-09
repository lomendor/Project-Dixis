'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';

/**
 * StoryRevealClient — Scroll-choreographed "story" moment.
 *
 * A full-bleed cinematic frame (beekeeper) where three lines appear one by
 * one as you scroll, then it CROSS-FADES into the existing Producer
 * Spotlight (same layout/data as ProducerSpotlight). Pure rAF scroll math,
 * no animation dependency. Respects prefers-reduced-motion.
 */

export interface SpotlightProducer {
  slug: string;
  name: string;
  region: string;
  description: string;
  image_url: string | null;
  products_count: number;
}

export default function StoryRevealClient({ producer }: { producer: SpotlightProducer }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cineRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const beeRef = useRef<HTMLDivElement>(null);
  const l0 = useRef<HTMLDivElement>(null);
  const l1 = useRef<HTMLHeadingElement>(null);
  const l2 = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const lines = [l0, l1, l2];
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      lines.forEach((r) => {
        if (r.current) {
          r.current.style.opacity = '1';
          r.current.style.transform = 'none';
        }
      });
      if (cineRef.current) cineRef.current.style.opacity = '0';
      if (spotRef.current) spotRef.current.style.opacity = '1';
      return undefined;
    }

    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const seg = (x: number, a: number, b: number) => clamp((x - a) / (b - a), 0, 1);

    let raf = 0;
    let p = 0;

    const loop = () => {
      const el = sectionRef.current;
      if (el) {
        const vh = window.innerHeight;
        const rect = el.getBoundingClientRect();
        const denom = el.offsetHeight - vh || 1;
        const target = clamp(-rect.top / denom, 0, 1);
        p = lerp(p, target, 0.1);

        const a = [seg(p, 0.05, 0.13), seg(p, 0.18, 0.26), seg(p, 0.31, 0.39)];
        lines.forEach((r, i) => {
          if (r.current) {
            r.current.style.opacity = String(a[i]);
            r.current.style.transform = `translateY(${lerp(20, 0, a[i])}px)`;
          }
        });
        if (beeRef.current) beeRef.current.style.transform = `scale(${lerp(1.06, 1.16, p)})`;
        if (cineRef.current) cineRef.current.style.opacity = String(1 - seg(p, 0.46, 0.62));
        if (spotRef.current) spotRef.current.style.opacity = String(seg(p, 0.5, 0.68));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const shortDesc =
    producer.description && producer.description.length > 200
      ? producer.description.slice(0, 195).trim() + '...'
      : producer.description;

  return (
    <section ref={sectionRef} className="relative h-[380vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-neutral-50">
        {/* Cinematic layer */}
        <div ref={cineRef} className="absolute inset-0">
          <div ref={beeRef} className="absolute inset-0 will-change-transform">
            <Image
              src="/images/hero-beekeeper.jpg"
              alt=""
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(8,16,10,0.5)] to-[rgba(8,16,10,0.78)]" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6">
            <div
              ref={l0}
              className="text-sm sm:text-base font-bold uppercase tracking-[0.18em] text-[#cfe3d6] opacity-0"
            >
              Η ιστορία πίσω από κάθε προϊόν
            </div>
            <h2
              ref={l1}
              className="mt-4 text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight max-w-4xl opacity-0 !text-white"
            >
              Γνωρίζεις ποιος το έφτιαξε.
            </h2>
            <p ref={l2} className="mt-6 text-lg sm:text-xl lg:text-2xl text-[#dbe7df] max-w-2xl opacity-0">
              Κάθε παραγωγός, κάθε χωράφι, κάθε συνταγή — με όνομα και πρόσωπο.
            </p>
          </div>
        </div>

        {/* Producer spotlight layer (cross-fades in) */}
        <div ref={spotRef} className="absolute inset-0 bg-neutral-50 opacity-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 h-screen">
            <div className="relative bg-primary-pale/30 min-h-[40vh]">
              <Image
                src={producer.image_url || '/images/producer-spotlight.jpg'}
                alt={producer.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12">
              <p className="text-xs font-medium text-primary mb-3">Παραγωγός στο Προσκήνιο</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-3">{producer.name}</h2>
              {producer.region && (
                <div className="inline-flex items-center gap-1.5 text-sm text-neutral-500 mb-6">
                  <MapPin className="w-3.5 h-3.5" />
                  {producer.region}
                </div>
              )}
              <p className="text-base sm:text-lg text-neutral-600 leading-relaxed mb-8 max-w-lg">
                {shortDesc}
              </p>
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
        </div>
      </div>
    </section>
  );
}
