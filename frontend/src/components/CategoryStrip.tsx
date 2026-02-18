'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { CATEGORIES, getCategoryBySlug } from '@/data/categories';

/** Emoji-to-slug mapping for dynamic categories (API-sourced) */
const slugEmojiMap: Record<string, string> = {
  'olive-oil': 'olive',
  'honey': 'honey',
  'legumes': 'beans',
  'grains': 'rice',
  'pasta': 'pasta',
  'flours': 'bread',
  'nuts': 'nuts',
  'herbs': 'herbs',
  'sweets': 'candy',
  'sauces': 'jar',
  'wine': 'beverage',
  'beverages': 'beverage',
  'dairy': 'cheese',
  'fruits': 'apple',
  'vegetables': 'apple',
};

/** Pastel bg for dynamic categories (fallback when no static match) */
const slugChipBgMap: Record<string, string> = {
  'olive-oil': 'bg-category-olive',
  'honey': 'bg-category-honey',
  'legumes': 'bg-category-vegetables',
  'grains': 'bg-category-bakery',
  'pasta': 'bg-category-bakery',
  'flours': 'bg-category-bakery',
  'nuts': 'bg-category-fruits',
  'herbs': 'bg-category-vegetables',
  'sweets': 'bg-category-fruits',
  'sauces': 'bg-category-meat',
  'wine': 'bg-category-wine',
  'beverages': 'bg-category-wine',
  'dairy': 'bg-category-dairy',
  'fruits': 'bg-category-fruits',
  'vegetables': 'bg-category-vegetables',
};

function getEmojiForSlug(slug: string): string {
  for (const [key, emoji] of Object.entries(slugEmojiMap)) {
    if (slug.includes(key)) return emoji;
  }
  return 'basket';
}

function getChipBgForSlug(slug: string): string {
  for (const [key, bg] of Object.entries(slugChipBgMap)) {
    if (slug.includes(key)) return bg;
  }
  return 'bg-neutral-50';
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
          aria-pressed={!currentCat}
          aria-label="Όλες οι κατηγορίες"
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium
            whitespace-nowrap transition-all duration-200
            ${
              !currentCat
                ? 'bg-primary text-white shadow-md'
                : 'bg-neutral-50 text-neutral-700 border border-neutral-200 hover:border-primary/40 hover:bg-primary-pale/60 hover:shadow-sm'
            }
          `}
        >
          <Image
            src="/icons/categories/basket.png"
            alt=""
            width={24}
            height={24}
            className="w-6 h-6 flex-shrink-0"
          />
          <span>Όλα</span>
        </button>

        {useDynamic
          ? /* Dynamic categories from API data */
            dynamicCategories.map((cat) => {
              const emoji = getEmojiForSlug(cat.slug);
              const chipBg = getChipBgForSlug(cat.slug);
              const isSelected = currentCat === cat.slug;

              return (
                <button
                  key={cat.slug}
                  onClick={() => handleCategoryClick(cat.slug)}
                  aria-pressed={isSelected}
                  aria-label={`Κατηγορία: ${cat.name}`}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium
                    whitespace-nowrap transition-all duration-200
                    ${
                      isSelected
                        ? 'bg-primary text-white shadow-md'
                        : `${chipBg} text-neutral-700 border border-neutral-200 hover:border-primary/40 hover:bg-primary-pale/60 hover:shadow-sm`
                    }
                  `}
                >
                  <Image
                    src={`/icons/categories/${emoji}.png`}
                    alt=""
                    width={24}
                    height={24}
                    className="w-6 h-6 flex-shrink-0"
                  />
                  <span>{cat.name}</span>
                </button>
              );
            })
          : /* Static fallback categories */
            CATEGORIES.map((category) => {
              const isSelected = currentCat === category.slug;

              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.slug)}
                  aria-pressed={isSelected}
                  aria-label={`Κατηγορία: ${category.labelEl}`}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium
                    whitespace-nowrap transition-all duration-200
                    ${
                      isSelected
                        ? 'bg-primary text-white shadow-md'
                        : `${category.chipBg} text-neutral-700 border border-neutral-200 hover:border-primary/40 hover:bg-primary-pale/60 hover:shadow-sm`
                    }
                  `}
                >
                  <Image
                    src={`/icons/categories/${category.emoji}.png`}
                    alt=""
                    width={24}
                    height={24}
                    className="w-6 h-6 flex-shrink-0"
                  />
                  <span>{category.labelEl}</span>
                </button>
              );
            })}
      </div>
    </div>
  );
}
