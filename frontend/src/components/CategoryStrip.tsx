'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  Droplets,
  Flower2,
  Bean,
  Wheat,
  Nut,
  Leaf,
  Candy,
  CookingPot,
  Sparkles,
  LayoutGrid,
  Grape,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CATEGORIES } from '@/data/categories';

/* ── Custom image icons (used instead of Lucide for specific categories) ── */
const SLUG_IMAGE_MAP: Record<string, string> = {
  'nuts-dried': '/icons/categories/nuts-3d.png',
  'honey-bee': '/icons/categories/honey-3d.png',
  'olive-oil-olives': '/icons/categories/olive-oil-3d.png',
  'cosmetics': '/icons/categories/cosmetics-3d.png',
  'herbs-spices-tea': '/icons/categories/herbs-spices-3d.png',
  'pasta': '/icons/categories/pasta-3d.png',
  'beverages': '/icons/categories/beverages-3d.png',
  'sweets-jams': '/icons/categories/sweets-3d.png',
  'legumes-grains': '/icons/categories/legumes-3d.png',
  'sauces-spreads': '/icons/categories/sauces-3d.png',
};

/* ── Per-icon scale overrides (use sparingly — prefer cropped PNGs) ── */
const SLUG_SCALE_MAP: Record<string, number> = {
};

/* ── Icon mapping (exact slug → Lucide component) ── */
const SLUG_ICON_MAP: Record<string, LucideIcon> = {
  'olive-oil-olives': Droplets,
  'honey-bee': Flower2,
  'nuts-dried': Nut,
  'cosmetics': Sparkles,
  'beverages': Grape,
  'sweets-jams': Candy,
  'pasta': Wheat,
  'herbs-spices-tea': Leaf,
  'sauces-spreads': CookingPot,
  'legumes-grains': Bean,
};

/* ── Background color mapping (pastel cards) ── */
const SLUG_BG_MAP: Record<string, string> = {
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

function getIconForSlug(slug: string): LucideIcon {
  return SLUG_ICON_MAP[slug] ?? LayoutGrid;
}

function getBgForSlug(slug: string): string {
  return SLUG_BG_MAP[slug] ?? 'bg-neutral-100';
}

/* ── Types ── */
interface DynamicCategory {
  slug: string;
  name: string;
  count: number;
}

interface CategoryStripProps {
  selectedCategory?: string | null;
  dynamicCategories?: DynamicCategory[];
}

interface CategoryItem {
  slug: string;
  label: string;
  icon: LucideIcon;
  bg: string;
  customImage?: string;
  imageScale?: number;
}

/* ── Component ── */
export function CategoryStrip({ selectedCategory, dynamicCategories }: CategoryStripProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCat = selectedCategory ?? searchParams.get('cat');

  const handleCategoryClick = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set('cat', slug);
    } else {
      params.delete('cat');
    }
    router.push(`/products?${params.toString()}`);
  };

  const useDynamic = dynamicCategories && dynamicCategories.length > 0;

  const items: CategoryItem[] = useDynamic
    ? dynamicCategories.map((cat) => ({
        slug: cat.slug,
        label: cat.name,
        icon: getIconForSlug(cat.slug),
        bg: getBgForSlug(cat.slug),
        customImage: SLUG_IMAGE_MAP[cat.slug],
        imageScale: SLUG_SCALE_MAP[cat.slug],
      }))
    : CATEGORIES.map((cat) => ({
        slug: cat.slug,
        label: cat.labelEl,
        icon: getIconForSlug(cat.slug),
        bg: getBgForSlug(cat.slug),
        customImage: SLUG_IMAGE_MAP[cat.slug],
        imageScale: SLUG_SCALE_MAP[cat.slug],
      }));

  /* Shared card classes per breakpoint:
     mobile:  88×88 icon, 104px col  — horizontal scroll
     tablet:  96×96 icon, 112px col  — horizontal scroll
     desktop: 76×76 icon, 100px col  — flex-wrap, all visible in 1 row */
  const iconBoxClass = 'w-[88px] h-[88px] sm:w-[96px] sm:h-[96px] lg:w-[76px] lg:h-[76px]';
  const imgClass = 'w-[76px] h-[76px] sm:w-[84px] sm:h-[84px] lg:w-[64px] lg:h-[64px] object-contain';
  const colClass = 'flex flex-col items-center gap-1.5 w-[104px] sm:w-[112px] lg:w-[100px] shrink-0 lg:shrink group';

  return (
    <div className="w-full" role="group" aria-label="Κατηγορίες προϊόντων">
      {/* Mobile/tablet: horizontal scroll — Desktop: flex-wrap so all categories visible */}
      <div className="flex items-start gap-2 sm:gap-3 lg:gap-2 overflow-x-auto lg:overflow-visible lg:flex-wrap pb-2 lg:pb-0 scrollbar-hide">
        {/* "Όλα" card */}
        <button
          onClick={() => handleCategoryClick(null)}
          aria-pressed={!currentCat}
          aria-label="Όλες οι κατηγορίες"
          className={colClass}
        >
          <div
            className={`
              ${iconBoxClass}
              rounded-2xl flex items-center justify-center overflow-hidden
              transition-all duration-200
              group-hover:scale-105 group-hover:shadow-card
              ${
                !currentCat
                  ? 'ring-2 ring-primary shadow-card scale-[1.02]'
                  : ''
              }
              bg-accent-cream
            `}
          >
            <Image
              src="/icons/categories/all-3d.png"
              alt="Όλα τα προϊόντα"
              width={128}
              height={128}
              className={imgClass}
            />
          </div>
          <span
            className={`text-[11px] sm:text-xs font-medium text-center leading-tight min-h-[2rem] sm:min-h-[2.25rem] flex items-start justify-center
              ${!currentCat ? 'text-primary font-semibold' : 'text-neutral-600'}
            `}
          >
            Όλα
          </span>
        </button>

        {/* Category cards */}
        {items.map((item) => {
          const Icon = item.icon;
          const isSelected = currentCat === item.slug;

          return (
            <button
              key={item.slug}
              onClick={() => handleCategoryClick(item.slug)}
              aria-pressed={isSelected}
              aria-label={`Κατηγορία: ${item.label}`}
              className={colClass}
            >
              <div
                className={`
                  ${iconBoxClass}
                  rounded-2xl flex items-center justify-center overflow-hidden
                  transition-all duration-200
                  group-hover:scale-105 group-hover:shadow-card
                  ${
                    isSelected
                      ? 'ring-2 ring-primary shadow-card scale-[1.02]'
                      : ''
                  }
                  ${item.bg}
                `}
              >
                {item.customImage ? (
                  <Image
                    src={item.customImage}
                    alt={item.label}
                    width={128}
                    height={128}
                    className={imgClass}
                    style={item.imageScale ? { transform: `scale(${item.imageScale})` } : undefined}
                  />
                ) : (
                  <Icon className="w-10 h-10 sm:w-11 sm:h-11 lg:w-9 lg:h-9 text-neutral-700" />
                )}
              </div>
              <span
                className={`text-[11px] sm:text-xs font-medium text-center leading-tight max-w-[100px] sm:max-w-[108px] lg:max-w-[104px] line-clamp-2 min-h-[2rem] sm:min-h-[2.25rem] flex items-start justify-center
                  ${isSelected ? 'text-primary font-semibold' : 'text-neutral-600'}
                `}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
