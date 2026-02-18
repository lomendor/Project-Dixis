'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { CATEGORIES, getCategoryBySlug } from '@/data/categories';

/** Emoji-to-slug mapping for dynamic categories (API-sourced) */
const slugEmojiMap: Record<string, string> = {
  'olive-oil': 'olive',
  'honey': 'honey',
  'legumes': 'beans',
  'grains': 'beans',
  'rice': 'beans',
  'pasta': 'pasta',
  'flours': 'pasta',
  'nuts': 'nuts',
  'herbs': 'herbs',
  'sweets': 'candy',
  'sauces': 'jar',
  'wine': 'beverage',
  'beverages': 'beverage',
  'cosmetics': 'cosmetics',
};

/** Pastel bg for dynamic categories (fallback when no static match) */
const slugChipBgMap: Record<string, string> = {
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
  'wine': 'bg-category-wine',
  'beverages': 'bg-category-wine',
  'cosmetics': 'bg-category-dairy',
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
    <div
      className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3"
      role="group"
      aria-label="Κατηγορίες προϊόντων"
    >
      {/* "All" card */}
      <button
        onClick={() => handleCategoryClick(null)}
        aria-pressed={!currentCat}
        aria-label="Όλες οι κατηγορίες"
        className={`
          flex flex-col items-center justify-center gap-2 p-3 sm:p-4
          rounded-xl transition-all duration-200 cursor-pointer
          ${
            !currentCat
              ? 'bg-white ring-2 ring-primary shadow-md'
              : 'bg-accent-cream hover:shadow-card-hover hover:scale-[1.03]'
          }
        `}
      >
        <Image
          src="/icons/categories/basket.png"
          alt=""
          width={56}
          height={56}
          className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 drop-shadow-sm"
        />
        <span
          className={`text-xs sm:text-sm font-medium text-center leading-tight line-clamp-2
            ${!currentCat ? 'text-primary' : 'text-neutral-700'}`}
        >
          Όλα
        </span>
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
                  flex flex-col items-center justify-center gap-2 p-3 sm:p-4
                  rounded-xl transition-all duration-200 cursor-pointer
                  ${
                    isSelected
                      ? 'bg-white ring-2 ring-primary shadow-md'
                      : `${chipBg} hover:shadow-card-hover hover:scale-[1.03]`
                  }
                `}
              >
                <Image
                  src={`/icons/categories/${emoji}.png`}
                  alt=""
                  width={56}
                  height={56}
                  className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 drop-shadow-sm"
                />
                <span
                  className={`text-xs sm:text-sm font-medium text-center leading-tight line-clamp-2
                    ${isSelected ? 'text-primary' : 'text-neutral-700'}`}
                >
                  {cat.name}
                </span>
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
                  flex flex-col items-center justify-center gap-2 p-3 sm:p-4
                  rounded-xl transition-all duration-200 cursor-pointer
                  ${
                    isSelected
                      ? 'bg-white ring-2 ring-primary shadow-md'
                      : `${category.chipBg} hover:shadow-card-hover hover:scale-[1.03]`
                  }
                `}
              >
                <Image
                  src={`/icons/categories/${category.emoji}.png`}
                  alt=""
                  width={56}
                  height={56}
                  className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 drop-shadow-sm"
                />
                <span
                  className={`text-xs sm:text-sm font-medium text-center leading-tight line-clamp-2
                    ${isSelected ? 'text-primary' : 'text-neutral-700'}`}
                >
                  {category.labelEl}
                </span>
              </button>
            );
          })}
    </div>
  );
}
