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
  Apple,
  Carrot,
  Grape,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CATEGORIES } from '@/data/categories';

/* ── Frontend label overrides (rename backend categories) ── */
const SLUG_LABEL_OVERRIDE: Record<string, string> = {
  'dairy-products': 'Ξηροί Καρποί',
};

/* ── Custom image icons (used instead of Lucide for specific categories) ── */
const SLUG_IMAGE_MAP: Record<string, string> = {
  'dairy-products': '/icons/categories/nuts-bowl.png',
  'honey': '/icons/categories/honey-3d.png',
  'olive-oil': '/icons/categories/olive-oil-3d.png',
  'cosmetics': '/icons/categories/cosmetics-3d.png',
};

/* ── Icon mapping (partial slug match) ── */
const SLUG_ICON_MAP: Record<string, LucideIcon> = {
  'olive-oil': Droplets,
  'honey': Flower2,
  'legumes': Bean,
  'grains': Bean,
  'rice': Bean,
  'pasta': Wheat,
  'flours': Wheat,
  'nuts': Nut,
  'herbs': Leaf,
  'sweets': Candy,
  'sauces': CookingPot,
  'cosmetics': Sparkles,
  'fruits': Apple,
  'vegetables': Carrot,
  'wine': Grape,
};

const STATIC_ICON_MAP: Record<string, LucideIcon> = {
  'olive-oil-olives': Droplets,
  'honey-bee': Flower2,
  'legumes-grains': Bean,
  'pasta-flours': Wheat,
  'nuts-dried': Nut,
  'herbs-spices': Leaf,
  'sweets-spreads': Candy,
  'sauces-preserves': CookingPot,
  'cosmetics': Sparkles,
};

/* ── Background color mapping (Wolt-style pastel cards) ── */
const SLUG_BG_MAP: Record<string, string> = {
  'olive-oil': 'bg-category-olive',
  'honey': 'bg-category-honey',
  'legumes': 'bg-category-vegetables',
  'grains': 'bg-category-vegetables',
  'rice': 'bg-category-vegetables',
  'pasta': 'bg-category-bakery',
  'flours': 'bg-category-bakery',
  'nuts': 'bg-category-fruits',
  'herbs': 'bg-category-vegetables',
  'sweets': 'bg-category-fruits',
  'sauces': 'bg-category-meat',
  'cosmetics': 'bg-category-dairy',
  'fruits': 'bg-category-fruits',
  'vegetables': 'bg-category-vegetables',
  'dairy': 'bg-category-fruits',
  'wine': 'bg-category-wine',
};

const STATIC_BG_MAP: Record<string, string> = {
  'olive-oil-olives': 'bg-category-olive',
  'honey-bee': 'bg-category-honey',
  'legumes-grains': 'bg-category-vegetables',
  'pasta-flours': 'bg-category-bakery',
  'nuts-dried': 'bg-category-fruits',
  'herbs-spices': 'bg-category-vegetables',
  'sweets-spreads': 'bg-category-fruits',
  'sauces-preserves': 'bg-category-meat',
  'cosmetics': 'bg-category-dairy',
};

function getIconForSlug(slug: string): LucideIcon {
  if (STATIC_ICON_MAP[slug]) return STATIC_ICON_MAP[slug];
  for (const [key, icon] of Object.entries(SLUG_ICON_MAP)) {
    if (slug.includes(key)) return icon;
  }
  return LayoutGrid;
}

function getBgForSlug(slug: string): string {
  if (STATIC_BG_MAP[slug]) return STATIC_BG_MAP[slug];
  for (const [key, bg] of Object.entries(SLUG_BG_MAP)) {
    if (slug.includes(key)) return bg;
  }
  return 'bg-accent-cream';
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

  /* Helper: resolve custom image for a slug */
  function getImageForSlug(slug: string): string | undefined {
    if (SLUG_IMAGE_MAP[slug]) return SLUG_IMAGE_MAP[slug];
    for (const [key, img] of Object.entries(SLUG_IMAGE_MAP)) {
      if (slug.includes(key)) return img;
    }
    return undefined;
  }

  const items: CategoryItem[] = useDynamic
    ? dynamicCategories.map((cat) => ({
        slug: cat.slug,
        label: SLUG_LABEL_OVERRIDE[cat.slug] || cat.name,
        icon: getIconForSlug(cat.slug),
        bg: getBgForSlug(cat.slug),
        customImage: getImageForSlug(cat.slug),
      }))
    : CATEGORIES.map((cat) => ({
        slug: cat.slug,
        label: cat.labelEl,
        icon: getIconForSlug(cat.slug),
        bg: getBgForSlug(cat.slug),
        customImage: getImageForSlug(cat.slug),
      }));

  return (
    <div className="w-full" role="group" aria-label="Κατηγορίες προϊόντων">
      {/* Horizontal scroll mobile, wrap desktop */}
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap sm:overflow-visible scrollbar-hide">
        {/* "Όλα" card */}
        <button
          onClick={() => handleCategoryClick(null)}
          aria-pressed={!currentCat}
          aria-label="Όλες οι κατηγορίες"
          className="flex flex-col items-center gap-1.5 min-w-[76px] sm:min-w-[88px] group"
        >
          <div
            className={`
              w-[68px] h-[68px] sm:w-[80px] sm:h-[80px]
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
            <LayoutGrid className="w-9 h-9 sm:w-11 sm:h-11 text-neutral-500" />
          </div>
          <span
            className={`text-xs font-medium text-center leading-tight
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
              className="flex flex-col items-center gap-1.5 min-w-[76px] sm:min-w-[88px] group"
            >
              <div
                className={`
                  w-[68px] h-[68px] sm:w-[80px] sm:h-[80px]
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
                    width={80}
                    height={80}
                    className="w-[56px] h-[56px] sm:w-[68px] sm:h-[68px] object-contain"
                  />
                ) : (
                  <Icon className="w-9 h-9 sm:w-11 sm:h-11 text-neutral-700" />
                )}
              </div>
              <span
                className={`text-xs font-medium text-center leading-tight max-w-[76px] sm:max-w-[88px] line-clamp-2
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
