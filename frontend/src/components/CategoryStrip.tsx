'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { CATEGORIES } from '@/data/categories';

/** Icon filename mapping for dynamic (API-sourced) categories */
const slugIconMap: Record<string, string> = {
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
  'cosmetics': 'cosmetics',
};

/** Pastel bg for dynamic categories */
const slugBgMap: Record<string, string> = {
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
};

function getIconForSlug(slug: string): string {
  for (const [key, icon] of Object.entries(slugIconMap)) {
    if (slug.includes(key)) return icon;
  }
  return 'basket';
}

function getBgForSlug(slug: string): string {
  for (const [key, bg] of Object.entries(slugBgMap)) {
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
  dynamicCategories?: DynamicCategory[];
}

/** Unified category item for rendering */
interface CategoryItem {
  slug: string;
  label: string;
  icon: string;
  chipBg: string;
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
        chipBg: getBgForSlug(cat.slug),
      }))
    : CATEGORIES.map((cat) => ({
        slug: cat.slug,
        label: cat.labelEl,
        icon: cat.emoji,
        chipBg: cat.chipBg,
      }));

  return (
    <div role="group" aria-label="Κατηγορίες προϊόντων">
      {/* "Όλα" pill — above the grid, CultivationFilter-style */}
      <button
        onClick={() => handleCategoryClick(null)}
        aria-pressed={!currentCat}
        aria-label="Όλες οι κατηγορίες"
        className={`
          inline-flex items-center gap-2 px-4 py-2 mb-3 rounded-full text-sm font-medium
          transition-all duration-200
          ${
            !currentCat
              ? 'bg-primary text-white shadow-md'
              : 'bg-white text-neutral-600 border border-neutral-200 hover:border-primary/40 hover:bg-primary-pale'
          }
        `}
      >
        <Image
          src="/icons/categories/basket.png"
          alt=""
          width={20}
          height={20}
          className="w-5 h-5 flex-shrink-0"
        />
        <span>Όλα</span>
      </button>

      {/* Category grid — 2 cols mobile, 3 cols tablet+ = perfect 3×3 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {items.map((item) => {
          const isSelected = currentCat === item.slug;

          return (
            <button
              key={item.slug}
              onClick={() => handleCategoryClick(item.slug)}
              aria-pressed={isSelected}
              aria-label={`Κατηγορία: ${item.label}`}
              className={`
                group flex flex-col items-center justify-center gap-3 p-4 sm:p-6
                rounded-xl border-2 transition-all duration-300 ease-out cursor-pointer
                ${
                  isSelected
                    ? 'border-primary/40 shadow-glow bg-white'
                    : `border-transparent ${item.chipBg} hover:shadow-card-hover hover:border-primary/20`
                }
              `}
            >
              <Image
                src={`/icons/categories/${item.icon}.png`}
                alt=""
                width={80}
                height={80}
                className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 drop-shadow-md
                           group-hover:scale-105 transition-transform duration-300 ease-out"
              />
              <span
                className={`text-sm font-semibold text-center leading-snug
                  line-clamp-2 min-h-[2.5rem] flex items-center
                  ${isSelected ? 'text-primary' : 'text-neutral-800'}`}
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
