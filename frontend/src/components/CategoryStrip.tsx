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
  LayoutGrid,
} from 'lucide-react';

// Map icon names to components
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
};

interface CategoryStripProps {
  selectedCategory?: string | null;
}

export function CategoryStrip({ selectedCategory }: CategoryStripProps) {
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
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-green-400 hover:bg-green-50'
            }
          `}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Όλα</span>
        </button>

        {/* Category buttons */}
        {CATEGORIES.map((category) => {
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
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-green-400 hover:bg-green-50'
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
