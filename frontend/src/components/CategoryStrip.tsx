'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { CATEGORIES } from '@/data/categories';
import {
  Droplets,
  Hexagon,
  Bean,
  Wheat,
  Utensils,
  Croissant,
  Nut,
  Leaf,
  Cherry,
  Soup,
  Wine,
  Milk,
  Apple,
  Carrot,
  LayoutGrid,
} from 'lucide-react';

// Map slug keywords to Lucide icons
const iconBySlug: Record<string, React.ComponentType<{ className?: string }>> = {
  'olive-oil': Droplets,
  'honey': Hexagon,
  'legumes': Bean,
  'grains': Wheat,
  'pasta': Utensils,
  'flours': Croissant,
  'nuts': Nut,
  'herbs': Leaf,
  'sweets': Cherry,
  'sauces': Soup,
  'wine': Wine,
  'beverages': Wine,
  'dairy': Milk,
  'fruits': Apple,
  'vegetables': Carrot,
};

// Map icon names to components (fallback for static CATEGORIES)
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Droplets,
  Hexagon,
  Bean,
  Wheat,
  Utensils,
  Croissant,
  Nut,
  Leaf,
  Cherry,
  Soup,
  Wine,
  Milk,
  Apple,
  Carrot,
};

/**
 * Pick the best icon for a category based on its slug.
 * Checks if any key in iconBySlug is contained in the slug string.
 */
function getIconForSlug(slug: string): React.ComponentType<{ className?: string }> | null {
  for (const [key, icon] of Object.entries(iconBySlug)) {
    if (slug.includes(key)) return icon;
  }
  return null;
}

interface DynamicCategory {
  slug: string;
  name: string;
  count: number;
}

interface CategoryStripProps {
  selectedCategory?: string | null;
  /** Dynamic categories extracted from real product data */
  dynamicCategories?: DynamicCategory[];
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

  // Use dynamic categories if available (from real API data),
  // otherwise fall back to static CATEGORIES
  const useDynamic = dynamicCategories && dynamicCategories.length > 0;

  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 pb-2 min-w-max px-1">
        {/* "All" option */}
        <button
          onClick={() => handleCategoryClick(null)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
            whitespace-nowrap transition-all duration-200
            ${
              !currentCat
                ? 'bg-primary text-white shadow-md'
                : 'bg-white text-neutral-700 border border-neutral-200 hover:border-primary/40 hover:bg-primary-pale'
            }
          `}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Όλα</span>
        </button>

        {useDynamic
          ? /* Dynamic categories from API data */
            dynamicCategories.map((cat) => {
              const IconComponent = getIconForSlug(cat.slug);
              const isSelected = currentCat === cat.slug;

              return (
                <button
                  key={cat.slug}
                  onClick={() => handleCategoryClick(cat.slug)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                    whitespace-nowrap transition-all duration-200
                    ${
                      isSelected
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-white text-neutral-700 border border-neutral-200 hover:border-primary/40 hover:bg-primary-pale'
                    }
                  `}
                >
                  {IconComponent && <IconComponent className="w-4 h-4" />}
                  <span>{cat.name}</span>
                </button>
              );
            })
          : /* Static fallback categories */
            CATEGORIES.map((category) => {
              const IconComponent = iconMap[category.icon];
              const isSelected = currentCat === category.slug;

              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.slug)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                    whitespace-nowrap transition-all duration-200
                    ${
                      isSelected
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-white text-neutral-700 border border-neutral-200 hover:border-primary/40 hover:bg-primary-pale'
                    }
                  `}
                >
                  {IconComponent && <IconComponent className="w-4 h-4" />}
                  <span>{category.labelEl}</span>
                </button>
              );
            })}
      </div>
    </div>
  );
}
