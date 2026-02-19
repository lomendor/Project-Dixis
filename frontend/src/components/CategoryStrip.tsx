'use client';

import { useRouter, useSearchParams } from 'next/navigation';
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
  Milk,
  Grape,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CATEGORIES } from '@/data/categories';

/** Lucide icon mapping for dynamic (API-sourced) categories */
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
  // Backend-only slugs (CategorySeeder.php)
  'fruits': Apple,
  'vegetables': Carrot,
  'dairy': Milk,
  'wine': Grape,
};

/** Static icon mapping keyed by category slug from categories.ts */
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

function getIconForSlug(slug: string): LucideIcon {
  // Exact match first (static categories)
  if (STATIC_ICON_MAP[slug]) return STATIC_ICON_MAP[slug];
  // Partial match (dynamic API categories)
  for (const [key, icon] of Object.entries(SLUG_ICON_MAP)) {
    if (slug.includes(key)) return icon;
  }
  return LayoutGrid;
}

interface DynamicCategory {
  slug: string;
  name: string;
  count: number;
}

interface CategoryStripProps {
  selectedCategory?: string | null;
  dynamicCategories?: DynamicCategory[];
}

/** Unified category item for rendering */
interface CategoryItem {
  slug: string;
  label: string;
  icon: LucideIcon;
}

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

  // Normalize dynamic or static categories into unified items
  const useDynamic = dynamicCategories && dynamicCategories.length > 0;
  const items: CategoryItem[] = useDynamic
    ? dynamicCategories.map((cat) => ({
        slug: cat.slug,
        label: cat.name,
        icon: getIconForSlug(cat.slug),
      }))
    : CATEGORIES.map((cat) => ({
        slug: cat.slug,
        label: cat.labelEl,
        icon: getIconForSlug(cat.slug),
      }));

  return (
    <div className="w-full" role="group" aria-label="Κατηγορίες προϊόντων">
      <div className="flex flex-wrap gap-2.5">
        {/* "Όλα" pill — first in the row */}
        <button
          onClick={() => handleCategoryClick(null)}
          aria-pressed={!currentCat}
          aria-label="Όλες οι κατηγορίες"
          className={`
            flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium
            transition-all duration-200
            ${
              !currentCat
                ? 'bg-primary text-white shadow-card'
                : 'bg-white text-neutral-700 border border-accent-gold/20 hover:border-accent-gold/50 hover:bg-accent-cream'
            }
          `}
        >
          <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
          <span>Όλα</span>
        </button>

        {/* Category pills */}
        {items.map((item) => {
          const Icon = item.icon;
          const isSelected = currentCat === item.slug;

          return (
            <button
              key={item.slug}
              onClick={() => handleCategoryClick(item.slug)}
              aria-pressed={isSelected}
              aria-label={`Κατηγορία: ${item.label}`}
              className={`
                flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium
                transition-all duration-200
                ${
                  isSelected
                    ? 'bg-primary text-white shadow-card'
                    : 'bg-white text-neutral-700 border border-accent-gold/20 hover:border-accent-gold/50 hover:bg-accent-cream'
                }
              `}
            >
              <Icon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
