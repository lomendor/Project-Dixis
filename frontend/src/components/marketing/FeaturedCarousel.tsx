'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import StarRating from '@/components/StarRating';
import AddToCartButton from '@/components/AddToCartButton';

/**
 * FeaturedCarousel — Large image-forward product cards with a glass info panel.
 *
 * - Big cards with a frosted-glass "κουτάκι" (iOS style) over the image.
 * - Clear hierarchy: producer → name → rating(+count) → divider → price + quick add.
 * - Quick "+" adds to cart instantly (real cart logic + toast).
 * - Arrows advance EXACTLY one card; native swipe on mobile.
 */

export interface FeaturedItem {
  id: string | number;
  name: string;
  producer: string | null;
  producerId?: string | null;
  producerSlug?: string | null;
  priceCents: number;
  discountPriceCents?: number | null;
  image: string | null;
  rating?: number | null;
  reviewsCount?: number;
  stock?: number | null;
}

const fmtEUR = new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' });

export default function FeaturedCarousel({ items }: { items: FeaturedItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const animRef = useRef<number>(0);

  const scrollByCard = (dir: 'left' | 'right') => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-card]');
    const gap = 16;
    const amount = card ? card.offsetWidth + gap : el.clientWidth * 0.8;
    const max = el.scrollWidth - el.clientWidth;
    const start = el.scrollLeft;
    const target = Math.max(0, Math.min(start + (dir === 'left' ? -amount : amount), max));

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.scrollLeft = target;
      return;
    }

    cancelAnimationFrame(animRef.current);
    const change = target - start;
    const duration = 550;
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    let startTs: number | null = null;
    const step = (ts: number) => {
      if (startTs === null) startTs = ts;
      const p = Math.min((ts - startTs) / duration, 1);
      el.scrollLeft = start + change * ease(p);
      if (p < 1) animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
  };

  return (
    <div className="group/car relative">
      {/* Arrows — desktop, advance one card */}
      <button
        type="button"
        onClick={() => scrollByCard('left')}
        aria-label="Προηγούμενη κάρτα"
        className="hidden lg:flex absolute left-1 top-[42%] -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm shadow-lg ring-1 ring-black/5 items-center justify-center text-neutral-700 hover:text-primary hover:scale-105 cursor-pointer transition-all duration-200 opacity-0 group-hover/car:opacity-100"
      >
        <ChevronLeft className="size-5 shrink-0" />
      </button>
      <button
        type="button"
        onClick={() => scrollByCard('right')}
        aria-label="Επόμενη κάρτα"
        className="hidden lg:flex absolute right-1 top-[42%] -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm shadow-lg ring-1 ring-black/5 items-center justify-center text-neutral-700 hover:text-primary hover:scale-105 cursor-pointer transition-all duration-200 opacity-0 group-hover/car:opacity-100"
      >
        <ChevronRight className="size-5 shrink-0" />
      </button>

      {/* Track */}
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {items.map((it) => {
          const hasDiscount = it.discountPriceCents != null && it.discountPriceCents < it.priceCents;
          const price = hasDiscount
            ? fmtEUR.format((it.discountPriceCents as number) / 100)
            : fmtEUR.format(it.priceCents / 100);
          const url = `/products/${it.id}`;
          return (
            <div
              key={it.id}
              data-card
              className="group/card shrink-0 w-[86vw] sm:w-[340px] lg:w-[380px]"
              style={{ scrollSnapAlign: 'start' }}
            >
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-neutral-100 ring-1 ring-black/5 shadow-sm group-hover/card:shadow-xl transition-shadow duration-300">
                {/* Image (navigates) */}
                <Link href={url} aria-label={it.name} className="absolute inset-0 z-0">
                  {it.image ? (
                    <Image
                      src={it.image}
                      alt={it.name}
                      fill
                      sizes="(max-width: 640px) 80vw, 300px"
                      className="object-cover transition-transform duration-500 group-hover/card:scale-[1.04]"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-neutral-300">—</div>
                  )}
                </Link>

                {/* Scrim for separation */}
                <div aria-hidden className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/25 to-transparent z-[5] pointer-events-none" />

                {/* Glass info panel — compact, lets the photo breathe */}
                <div className="absolute inset-x-2.5 bottom-2.5 z-10 rounded-2xl bg-white/80 backdrop-blur-md ring-1 ring-black/5 shadow-lg px-3.5 py-2.5">
                  {it.producer &&
                    (it.producerSlug || it.producerId ? (
                      <Link
                        href={`/producers/${it.producerSlug || it.producerId}`}
                        className="relative z-10 inline-block max-w-full text-[10px] font-medium uppercase tracking-wide text-neutral-500 hover:text-primary transition-colors line-clamp-1"
                      >
                        {it.producer}
                      </Link>
                    ) : (
                      <div className="text-[10px] font-medium uppercase tracking-wide text-neutral-500 line-clamp-1">
                        {it.producer}
                      </div>
                    ))}
                  <Link
                    href={url}
                    className="mt-0.5 block font-semibold text-sm leading-tight text-neutral-900 hover:text-primary transition-colors line-clamp-1"
                  >
                    {it.name}
                  </Link>

                  {it.rating ? (
                    <div className="mt-1">
                      <StarRating rating={it.rating} count={it.reviewsCount} size="xs" />
                    </div>
                  ) : null}

                  <div className="mt-2 pt-2 border-t border-black/5 flex items-center justify-between gap-2">
                    <div className="leading-none">
                      {hasDiscount && (
                        <span className="block text-[10px] text-neutral-400 line-through">
                          {fmtEUR.format(it.priceCents / 100)}
                        </span>
                      )}
                      <span className="text-base font-extrabold text-primary">{price}</span>
                    </div>
                    <AddToCartButton
                      id={it.id}
                      title={it.name}
                      priceCents={hasDiscount ? (it.discountPriceCents as number) : it.priceCents}
                      imageUrl={it.image || undefined}
                      producerId={it.producerId || undefined}
                      producerName={it.producer || undefined}
                      stock={it.stock}
                      compact
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div className="shrink-0 w-1" aria-hidden="true" />
      </div>
    </div>
  );
}
