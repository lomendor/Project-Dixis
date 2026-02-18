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

function getIconForSlug(slug: string): string {
  for (const [key, icon] of Object.entries(slugIconMap)) {
    if (slug.includes(key)) return icon;
  }
  return 'basket';
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
        icon: cat.emoji,
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
          <Image
            src="/icons/categories/basket.png"
            alt=""
            width={20}
            height={20}
            className="w-5 h-5 flex-shrink-0"
          />
          <span>Όλα</span>
        </button>

        {/* Category pills */}
        {items.map((item) => {
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
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:border-primary/40 hover:bg-primary-pale'
                }
              `}
            >
              <Image
                src={`/icons/categories/${item.icon}.png`}
                alt=""
                width={20}
                height={20}
                className="w-5 h-5 flex-shrink-0"
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
