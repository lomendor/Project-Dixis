'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CATEGORIES } from '@/data/categories';

/**
 * HomeCategoryStrip — Large category circles, full-width on desktop
 *
 * 10 categories spread across the full page width on desktop (justify-between).
 * Horizontal scroll on mobile. Big circles with subtle shadow for depth.
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
    <section className="py-8 sm:py-10 bg-white">
      <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12">
        {/* Section header */}
        <div className="mb-5 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
            Κατηγορίες
          </h2>
        </div>

        {/* Category circles — scroll on mobile, full-width spread on desktop */}
        <div
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide lg:overflow-visible lg:pb-0 lg:justify-between"
          role="list"
          aria-label="Κατηγορίες προϊόντων"
        >
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?cat=${cat.slug}`}
              role="listitem"
              className="flex flex-col items-center gap-3 shrink-0 lg:shrink group"
            >
              {/* Circle with shadow */}
              <div
                className={`
                  w-[96px] h-[96px] sm:w-[112px] sm:h-[112px] lg:w-[120px] lg:h-[120px]
                  rounded-full flex items-center justify-center
                  shadow-sm
                  transition-all duration-200
                  group-hover:scale-105 group-hover:shadow-md
                  ${BG_MAP[cat.slug] ?? 'bg-neutral-100'}
                `}
              >
                <Image
                  src={IMAGE_MAP[cat.slug] ?? '/icons/categories/all-3d.png'}
                  alt={cat.labelEl}
                  width={112}
                  height={112}
                  className="w-[64px] h-[64px] sm:w-[76px] sm:h-[76px] lg:w-[80px] lg:h-[80px] object-contain drop-shadow-sm"
                />
              </div>
              {/* Label */}
              <span className="text-xs sm:text-sm font-medium text-neutral-600 group-hover:text-primary text-center leading-tight max-w-[104px] sm:max-w-[120px] transition-colors duration-200">
                {cat.labelEl}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
