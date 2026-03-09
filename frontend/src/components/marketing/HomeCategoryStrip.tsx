'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { CATEGORIES } from '@/data/categories';
import ScrollableRow from '@/components/ui/ScrollableRow';

/**
 * HomeCategoryStrip — Responsive category display
 *
 * Mobile: horizontal scroll with circle icons + label below
 * Desktop (lg+): Collapsible grid — first row shows "Όλα" + 4 categories,
 *   expand button reveals remaining categories with smooth animation.
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

/** How many categories to show in the first row (excluding "Όλα") */
const VISIBLE_COUNT = 4;

const CIRCLE = 'w-20 h-20 sm:w-24 sm:h-24';
const ICON_MOBILE = 'w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-sm';

/** Reusable desktop category card */
function CategoryCard({ slug, label, isAll }: { slug?: string; label: string; isAll?: boolean }) {
  const href = isAll ? '/products' : `/products?cat=${slug}`;
  const bg = isAll ? 'bg-primary/8' : (slug ? BG_MAP[slug] ?? 'bg-neutral-100' : 'bg-neutral-100');
  const icon = isAll ? '/icons/categories/all-3d.png' : (slug ? IMAGE_MAP[slug] ?? '/icons/categories/all-3d.png' : '/icons/categories/all-3d.png');

  return (
    <Link
      href={href}
      role="listitem"
      className={`
        group flex flex-col items-center
        px-4 pt-5 pb-4 xl:pt-6 xl:pb-5
        rounded-2xl ${bg}
        border border-transparent
        hover:border-primary/20 hover:shadow-md
        transition-all duration-200
        active:scale-[0.98]
      `}
    >
      <div className="w-[100px] h-[100px] xl:w-[120px] xl:h-[120px] flex items-center justify-center mb-2">
        <Image
          src={icon}
          alt={label}
          width={240}
          height={240}
          className="w-[100px] h-[100px] xl:w-[120px] xl:h-[120px] object-contain drop-shadow-sm"
        />
      </div>
      <span className={`text-sm xl:text-[15px] font-semibold text-center leading-tight transition-colors duration-200 ${isAll ? 'text-primary' : 'text-neutral-800 group-hover:text-primary'}`}>
        {label}
      </span>
    </Link>
  );
}

export default function HomeCategoryStrip() {
  const [expanded, setExpanded] = useState(false);

  const firstRow = CATEGORIES.slice(0, VISIBLE_COUNT);
  const restRows = CATEGORIES.slice(VISIBLE_COUNT);

  return (
    <section className="py-6 sm:py-8 lg:py-10 bg-white">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
        {/* Section header — expand button next to title on desktop */}
        <div className="mb-5 sm:mb-6 lg:mb-7 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
            Κατηγορίες
          </h2>
          {/* Desktop expand/collapse — next to title */}
          {restRows.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-neutral-500 hover:text-primary rounded-full hover:bg-primary-pale transition-all duration-200 active:scale-95"
              aria-expanded={expanded}
            >
              {expanded ? 'Λιγότερες' : `Δείτε όλες`}
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* ─── MOBILE / TABLET: Horizontal scroll circles (< lg) ─── */}
        <div className="lg:hidden">
          <ScrollableRow>
            <div
              className="flex gap-4 sm:gap-5 px-1 py-2"
              role="list"
              aria-label="Κατηγορίες προϊόντων"
            >
              <Link
                href="/products"
                role="listitem"
                className="flex flex-col items-center gap-2.5 sm:gap-3 shrink-0 group"
              >
                <div className={`${CIRCLE} rounded-full flex items-center justify-center bg-primary/8 border-2 border-primary/15 shadow-sm transition-all duration-200 group-hover:scale-105 group-hover:shadow-md group-hover:border-primary/30`}>
                  <Image src="/icons/categories/all-3d.png" alt="Όλες οι κατηγορίες" width={160} height={160} className={ICON_MOBILE} />
                </div>
                <span className="text-[11px] sm:text-xs font-semibold text-primary text-center leading-tight max-w-[88px] sm:max-w-[100px]">
                  Όλες
                </span>
              </Link>

              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/products?cat=${cat.slug}`}
                  role="listitem"
                  className="flex flex-col items-center gap-2.5 sm:gap-3 shrink-0 group"
                >
                  <div className={`${CIRCLE} rounded-full flex items-center justify-center shadow-sm transition-all duration-200 group-hover:scale-105 group-hover:shadow-md ${BG_MAP[cat.slug] ?? 'bg-neutral-100'}`}>
                    <Image src={IMAGE_MAP[cat.slug] ?? '/icons/categories/all-3d.png'} alt={cat.labelEl} width={160} height={160} className={ICON_MOBILE} />
                  </div>
                  <span className="text-[11px] sm:text-xs font-medium text-neutral-600 group-hover:text-primary text-center leading-tight max-w-[88px] sm:max-w-[100px] transition-colors duration-200">
                    {cat.labelEl}
                  </span>
                </Link>
              ))}
            </div>
          </ScrollableRow>
        </div>

        {/* ─── DESKTOP: Uniform 5-col grid, expand via header button (lg+) ─── */}
        <div className="hidden lg:block" role="list" aria-label="Κατηγορίες προϊόντων">
          {/* First row: "Όλα" + first 4 categories */}
          <div className="grid grid-cols-5 gap-4 xl:gap-5">
            <CategoryCard isAll label="Όλα τα Προϊόντα" />
            {firstRow.map((cat) => (
              <CategoryCard key={cat.slug} slug={cat.slug} label={cat.labelEl} />
            ))}
          </div>

          {/* Expandable rows — same grid, perfect alignment */}
          <div
            className="grid grid-cols-5 gap-4 xl:gap-5 overflow-hidden transition-all duration-300 ease-in-out"
            style={{
              maxHeight: expanded ? `${Math.ceil(restRows.length / 5) * 260}px` : '0px',
              marginTop: expanded ? '16px' : '0px',
              opacity: expanded ? 1 : 0,
            }}
          >
            {restRows.map((cat) => (
              <CategoryCard key={cat.slug} slug={cat.slug} label={cat.labelEl} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
