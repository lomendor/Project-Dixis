'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CATEGORIES } from '@/data/categories';

/**
 * HomeCategoryStrip — Mini category circles for the homepage
 *
 * Horizontal scrollable row of 10 categories using existing 3D icons + pastel backgrounds.
 * Smaller and simpler than the full CategoryStrip on /products.
 * Links directly to /products?cat={slug}.
 */

const IMAGE_MAP: Record<string, string> = {
  'olive-oil-olives': '/icons/categories/olive-oil-3d.png',
  'honey-bee': '/icons/categories/honey-3d.png',
  'nuts-dried': '/icons/categories/nuts-3d.png',
  'cosmetics': '/icons/categories/cosmetics-3d.png',
  'herbs-spices-tea': '/icons/categories/herbs-spices-3d.png',
  'pasta': '/icons/categories/pasta-3d.png',
  'beverages': '/icons/categories/beverages-3d.png',
  'sweets-jams': '/icons/categories/sweets-3d.png',
  'legumes-grains': '/icons/categories/legumes-3d.png',
  'sauces-spreads': '/icons/categories/sauces-3d.png',
};

const BG_MAP: Record<string, string> = {
  'olive-oil-olives': 'bg-category-olive',
  'honey-bee': 'bg-category-honey',
  'nuts-dried': 'bg-category-nuts',
  'cosmetics': 'bg-category-cosmetics',
  'beverages': 'bg-category-beverages',
  'sweets-jams': 'bg-category-sweets',
  'pasta': 'bg-category-pasta',
  'herbs-spices-tea': 'bg-category-herbs',
  'sauces-spreads': 'bg-category-sauces',
  'legumes-grains': 'bg-category-legumes',
};

export default function HomeCategoryStrip() {
  return (
    <section className="py-14 sm:py-20 bg-white">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
        {/* Section header */}
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-xs font-semibold tracking-wider text-primary/60 uppercase mb-2">
            Κατηγορίες
          </p>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-[2.5rem] font-normal text-neutral-900 tracking-[-0.01em]">
            Εξερευνήστε ανά Κατηγορία
          </h2>
        </div>

        {/* Scrollable row */}
        <div
          className="flex gap-5 sm:gap-6 overflow-x-auto pb-4 scrollbar-hide sm:justify-center sm:flex-wrap sm:overflow-visible sm:pb-0"
          role="list"
          aria-label="Κατηγορίες προϊόντων"
        >
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?cat=${cat.slug}`}
              role="listitem"
              className="flex flex-col items-center gap-2.5 shrink-0 group"
            >
              {/* Circle icon */}
              <div
                className={`
                  w-[72px] h-[72px] sm:w-[88px] sm:h-[88px]
                  rounded-full flex items-center justify-center
                  transition-all duration-200
                  group-hover:scale-110 group-hover:shadow-lg
                  ${BG_MAP[cat.slug] ?? 'bg-accent-cream'}
                `}
              >
                <Image
                  src={IMAGE_MAP[cat.slug] ?? '/icons/categories/all-3d.png'}
                  alt={cat.labelEl}
                  width={80}
                  height={80}
                  className="w-[52px] h-[52px] sm:w-[64px] sm:h-[64px] object-contain"
                />
              </div>
              {/* Label */}
              <span className="text-[11px] sm:text-xs font-medium text-neutral-600 group-hover:text-primary text-center leading-tight max-w-[80px] sm:max-w-[96px] transition-colors duration-200">
                {cat.labelEl}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
