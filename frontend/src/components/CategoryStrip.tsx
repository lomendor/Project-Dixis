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

  return (
    <div className="w-full" role="group" aria-label="Κατηγορίες προϊόντων">
      {/* Horizontal scroll mobile, flex-wrap desktop (Wolt-style compact) */}
      <div className="flex items-start gap-1.5 overflow-x-auto pb-2 xl:pb-0 xl:flex-wrap xl:justify-start xl:gap-x-1 xl:gap-y-2 xl:overflow-visible scrollbar-hide">
        {/* "Όλα" card */}
        <button
          onClick={() => handleCategoryClick(null)}
          aria-pressed={!currentCat}
          aria-label="Όλες οι κατηγορίες"
          className="flex flex-col items-center gap-1.5 w-[104px] xl:w-auto xl:min-w-[100px] xl:max-w-[136px] xl:flex-1 shrink-0 xl:shrink group"
        >
          <div
            className={`
              w-[96px] h-[96px] xl:w-[128px] xl:h-[128px]
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
              className="w-[88px] h-[88px] xl:w-[120px] xl:h-[120px] object-contain"
            />
          </div>
          <span
            className={`text-[11px] xl:text-xs font-medium text-center leading-tight min-h-[2rem] xl:min-h-[2.25rem] flex items-start justify-center
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
              className="flex flex-col items-center gap-1.5 w-[104px] xl:w-auto xl:min-w-[100px] xl:max-w-[136px] xl:flex-1 shrink-0 xl:shrink group"
            >
              <div
                className={`
                  w-[96px] h-[96px] xl:w-[128px] xl:h-[128px]
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
                    className="w-[88px] h-[88px] xl:w-[120px] xl:h-[120px] object-contain"
                    style={item.imageScale ? { transform: `scale(${item.imageScale})` } : undefined}
                  />
                ) : (
                  <Icon className="w-11 h-11 xl:w-14 xl:h-14 text-neutral-700" />
                )}
              </div>
              <span
                className={`text-[11px] xl:text-xs font-medium text-center leading-tight max-w-[100px] xl:max-w-[124px] line-clamp-2 min-h-[2rem] xl:min-h-[2.25rem] flex items-start justify-center
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
