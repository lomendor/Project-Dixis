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
  'nuts-dried': '/icons/categories/nuts-bowl.png',
  'honey-bee': '/icons/categories/honey-3d.png',
  'olive-oil-olives': '/icons/categories/olive-oil-3d.png',
  'cosmetics': '/icons/categories/cosmetics-3d.png',
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
  return SLUG_BG_MAP[slug] ?? 'bg-accent-cream';
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
      }))
    : CATEGORIES.map((cat) => ({
        slug: cat.slug,
        label: cat.labelEl,
        icon: getIconForSlug(cat.slug),
        bg: getBgForSlug(cat.slug),
        customImage: SLUG_IMAGE_MAP[cat.slug],
      }));

  return (
    <div className="w-full" role="group" aria-label="Κατηγορίες προϊόντων">
      {/* Horizontal scroll mobile, wrap desktop */}
      <div className="flex gap-3 sm:gap-5 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap sm:overflow-visible scrollbar-hide">
        {/* "Όλα" card */}
        <button
          onClick={() => handleCategoryClick(null)}
          aria-pressed={!currentCat}
          aria-label="Όλες οι κατηγορίες"
          className="flex flex-col items-center gap-2 min-w-[84px] sm:min-w-[108px] group"
        >
          <div
            className={`
              w-[76px] h-[76px] sm:w-[100px] sm:h-[100px]
              rounded-2xl flex items-center justify-center
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
            <LayoutGrid className="w-10 h-10 sm:w-12 sm:h-12 text-neutral-500" />
          </div>
          <span
            className={`text-xs sm:text-sm font-medium text-center leading-tight
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
              className="flex flex-col items-center gap-2 min-w-[84px] sm:min-w-[108px] group"
            >
              <div
                className={`
                  w-[76px] h-[76px] sm:w-[100px] sm:h-[100px]
                  rounded-2xl flex items-center justify-center
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
                    width={100}
                    height={100}
                    className="w-[62px] h-[62px] sm:w-[84px] sm:h-[84px] object-contain"
                  />
                ) : (
                  <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-neutral-700" />
                )}
              </div>
              <span
                className={`text-xs sm:text-sm font-medium text-center leading-tight max-w-[84px] sm:max-w-[108px] line-clamp-2
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
