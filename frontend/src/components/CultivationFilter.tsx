'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { LayoutGrid } from 'lucide-react';

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
  emoji: string;
  /** Tailwind classes for unselected state */
  pillBg: string;
  pillText: string;
}

const CULTIVATION_OPTIONS: CultivationOption[] = [
  { value: 'organic_certified', label: 'Βιολογική', emoji: '🌿', pillBg: 'bg-green-50 border-green-200', pillText: 'text-green-800' },
  { value: 'organic_transitional', label: 'Μεταβατική', emoji: '🌱', pillBg: 'bg-lime-50 border-lime-200', pillText: 'text-lime-800' },
  { value: 'biodynamic', label: 'Βιοδυναμική', emoji: '✨', pillBg: 'bg-purple-50 border-purple-200', pillText: 'text-purple-800' },
  { value: 'traditional_natural', label: 'Παραδοσιακή', emoji: '🌾', pillBg: 'bg-amber-50 border-amber-200', pillText: 'text-amber-800' },
  { value: 'conventional', label: 'Συμβατική', emoji: '', pillBg: 'bg-neutral-50 border-neutral-200', pillText: 'text-neutral-700' },
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
    <>
      {/* "All" option */}
        <button
          onClick={() => handleClick(null)}
          aria-pressed={!current}
          aria-label="Όλοι οι τρόποι καλλιέργειας"
          className={`
            flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap shrink-0
            transition-all duration-200
            ${
              !current
                ? 'bg-primary text-white shadow-card'
                : 'bg-white text-neutral-700 border border-accent-gold/20 hover:border-accent-gold/50 hover:bg-accent-cream'
            }
          `}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Όλοι</span>
        </button>

        {visibleOptions.map((opt) => {
          const isSelected = current === opt.value;
          const count = availableCounts?.[opt.value] || 0;

          return (
            <button
              key={opt.value}
              onClick={() => handleClick(opt.value)}
              aria-pressed={isSelected}
              aria-label={`Καλλιέργεια: ${opt.label}`}
              className={`
                flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap shrink-0
                transition-all duration-200 border
                ${
                  isSelected
                    ? 'bg-primary text-white shadow-md border-primary'
                    : `${opt.pillBg} ${opt.pillText} hover:shadow-sm`
                }
              `}
            >
              {opt.emoji && <span className="text-base leading-none">{opt.emoji}</span>}
              <span>{opt.label}</span>
              {count > 0 && (
                <span
                  className={`ml-0.5 text-xs ${
                    isSelected ? 'opacity-80' : 'opacity-60'
                  }`}
                >
                  ({count})
                </span>
              )}
            </button>
          );
        })}
    </>
  );
}
