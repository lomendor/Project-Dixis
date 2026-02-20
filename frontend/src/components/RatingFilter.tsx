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
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-neutral-600 mr-1">Βαθμολογία:</span>
      {RATING_OPTIONS.map((opt) => {
        const isSelected = current === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => handleClick(isSelected ? null : opt.value)}
            aria-pressed={isSelected}
            aria-label={`Ελάχιστη βαθμολογία ${opt.label}`}
            className={`
              flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium
              transition-all duration-200 border
              ${
                isSelected
                  ? 'bg-amber-500 text-white shadow-md border-amber-500'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:border-amber-400 hover:shadow-sm'
              }
            `}
          >
            <svg className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-amber-400'}`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
