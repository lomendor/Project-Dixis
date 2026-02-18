'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Leaf, Sprout, Sparkles, Wheat, FlaskConical, LayoutGrid } from 'lucide-react';

export type CultivationType =
  | 'conventional'
  | 'organic_certified'
  | 'organic_transitional'
  | 'biodynamic'
  | 'traditional_natural'
  | 'other';

interface CultivationOption {
  value: CultivationType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CULTIVATION_OPTIONS: CultivationOption[] = [
  { value: 'organic_certified', label: 'Βιολογική', icon: Leaf },
  { value: 'organic_transitional', label: 'Μεταβατική', icon: Sprout },
  { value: 'biodynamic', label: 'Βιοδυναμική', icon: Sparkles },
  { value: 'traditional_natural', label: 'Παραδοσιακή', icon: Wheat },
  { value: 'conventional', label: 'Συμβατική', icon: FlaskConical },
];

interface CultivationFilterProps {
  selectedCultivation?: string | null;
  /** Map of cultivation_type -> count of products */
  availableCounts?: Record<string, number>;
}

export function CultivationFilter({
  selectedCultivation,
  availableCounts,
}: CultivationFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = selectedCultivation ?? searchParams.get('cult');

  // Only show options that have at least 1 product
  const visibleOptions = availableCounts
    ? CULTIVATION_OPTIONS.filter((opt) => (availableCounts[opt.value] || 0) > 0)
    : CULTIVATION_OPTIONS;

  // If no products have cultivation_type at all, don't render the filter
  if (visibleOptions.length === 0) return null;

  const handleClick = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('cult', value);
    } else {
      params.delete('cult');
    }
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2.5">
        {/* "All" option */}
        <button
          onClick={() => handleClick(null)}
          aria-pressed={!current}
          aria-label="Όλοι οι τρόποι καλλιέργειας"
          className={`
            flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium
            transition-all duration-200
            ${
              !current
                ? 'bg-primary text-white shadow-md'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:border-primary/40 hover:bg-primary-pale'
            }
          `}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Όλοι</span>
        </button>

        {visibleOptions.map((opt) => {
          const Icon = opt.icon;
          const isSelected = current === opt.value;
          const count = availableCounts?.[opt.value] || 0;

          return (
            <button
              key={opt.value}
              onClick={() => handleClick(opt.value)}
              aria-pressed={isSelected}
              aria-label={`Καλλιέργεια: ${opt.label}`}
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
              <Icon className="w-4 h-4" />
              <span>{opt.label}</span>
              {count > 0 && (
                <span
                  className={`ml-0.5 text-xs ${
                    isSelected ? 'opacity-80' : 'text-neutral-400'
                  }`}
                >
                  ({count})
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
