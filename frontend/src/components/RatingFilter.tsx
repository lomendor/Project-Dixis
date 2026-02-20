'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface RatingOption {
  value: string;
  label: string;
}

const RATING_OPTIONS: RatingOption[] = [
  { value: '4.5', label: '4.5+' },
  { value: '4', label: '4+' },
  { value: '3', label: '3+' },
];

interface RatingFilterProps {
  selectedRating?: string | null;
}

export function RatingFilter({ selectedRating }: RatingFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = selectedRating ?? searchParams.get('min_rating');

  const handleClick = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('min_rating', value);
    } else {
      params.delete('min_rating');
    }
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2.5">
      {RATING_OPTIONS.map((opt) => {
        const isSelected = current === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => handleClick(isSelected ? null : opt.value)}
            aria-pressed={isSelected}
            aria-label={`Ελάχιστη βαθμολογία ${opt.label}`}
            className={`
              flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium
              transition-all duration-200 border
              ${
                isSelected
                  ? 'bg-primary text-white shadow-md border-primary'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:shadow-sm'
              }
            `}
          >
            <span className="text-base leading-none">&#11088;</span>
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
