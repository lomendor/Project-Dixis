'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CATEGORIES } from '@/data/categories';

/**
 * HomeCategoryStrip — Full-width category pills
 *
 * - First pill: "Όλες" (all categories) → /products
 * - All 10 category pills after it
 * - Horizontal scroll if pills don't fit (never wrap)
 * - Big circles with big icons, justify-between on wide screens
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

/** Shared circle + image sizes — responsive: 80→96→100→120px */
const CIRCLE = 'w-20 h-20 sm:w-24 sm:h-24 lg:w-24 lg:h-24 2xl:w-[120px] 2xl:h-[120px]';
const ICON = 'w-14 h-14 sm:w-16 sm:h-16 lg:w-[60px] lg:h-[60px] 2xl:w-20 2xl:h-20 object-contain drop-shadow-sm';

export default function HomeCategoryStrip() {
  return (
    <section className="py-8 sm:py-10 bg-white">
      <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-10">
        {/* Section header */}
        <div className="mb-5 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
            Κατηγορίες
          </h2>
        </div>

        {/* Category pills — single row, horizontal scroll if needed, extra padding for hover scale */}
        <div
          className="flex gap-4 sm:gap-5 lg:gap-2 xl:gap-3 2xl:gap-5 overflow-x-auto py-2 -my-2 scrollbar-hide lg:justify-between"
          role="list"
          aria-label="Κατηγορίες προϊόντων"
        >
          {/* "All categories" pill — first */}
          <Link
            href="/products"
            role="listitem"
            className="flex flex-col items-center gap-2.5 sm:gap-3 shrink-0 group"
          >
            <div className={`${CIRCLE} rounded-full flex items-center justify-center bg-primary/8 border-2 border-primary/15 shadow-sm transition-all duration-200 group-hover:scale-105 group-hover:shadow-md group-hover:border-primary/30`}>
              <Image
                src="/icons/categories/all-3d.png"
                alt="Όλες οι κατηγορίες"
                width={160}
                height={160}
                className={ICON}
              />
            </div>
            <span className="text-[11px] sm:text-xs lg:text-sm font-semibold text-primary text-center leading-tight max-w-[88px] sm:max-w-[100px] lg:max-w-[120px] transition-colors duration-200">
              Όλες
            </span>
          </Link>

          {/* Category pills */}
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?cat=${cat.slug}`}
              role="listitem"
              className="flex flex-col items-center gap-2.5 sm:gap-3 shrink-0 group"
            >
              <div
                className={`${CIRCLE} rounded-full flex items-center justify-center shadow-sm transition-all duration-200 group-hover:scale-105 group-hover:shadow-md ${BG_MAP[cat.slug] ?? 'bg-neutral-100'}`}
              >
                <Image
                  src={IMAGE_MAP[cat.slug] ?? '/icons/categories/all-3d.png'}
                  alt={cat.labelEl}
                  width={160}
                  height={160}
                  className={ICON}
                />
              </div>
              <span className="text-[11px] sm:text-xs lg:text-sm font-medium text-neutral-600 group-hover:text-primary text-center leading-tight max-w-[88px] sm:max-w-[100px] lg:max-w-[120px] transition-colors duration-200">
                {cat.labelEl}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
