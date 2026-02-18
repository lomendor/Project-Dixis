'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const SORT_OPTIONS = [
  { value: 'created_at_desc', label: 'Νεότερα' },
  { value: 'price_asc', label: 'Τιμή: Χαμηλότερη' },
  { value: 'price_desc', label: 'Τιμή: Υψηλότερη' },
  { value: 'name_asc', label: 'Αλφαβητικά' },
] as const;

/**
 * ProductSort — Sort dropdown for products page.
 * Updates ?sort= and ?dir= URL params (same pattern as CategoryStrip).
 * Backend already supports sort + direction params.
 */
export function ProductSort() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Reconstruct compound value from URL params
  const currentSort = searchParams.get('sort') || 'created_at';
  const currentDir = searchParams.get('dir') || 'desc';
  const currentValue = `${currentSort}_${currentDir}`;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const compound = e.target.value;
    // Parse compound value: "price_asc" → sort=price, dir=asc
    // Handle "created_at_desc" → sort=created_at, dir=desc
    const lastUnderscore = compound.lastIndexOf('_');
    const sort = compound.slice(0, lastUnderscore);
    const dir = compound.slice(lastUnderscore + 1);

    const params = new URLSearchParams(searchParams.toString());
    if (sort === 'created_at' && dir === 'desc') {
      // Default — remove params for clean URL
      params.delete('sort');
      params.delete('dir');
    } else {
      params.set('sort', sort);
      params.set('dir', dir);
    }
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="relative">
      <select
        value={currentValue}
        onChange={handleChange}
        aria-label="Ταξινόμηση προϊόντων"
        className="w-full appearance-none pl-3.5 pr-8 py-2.5 border border-neutral-200 rounded-xl bg-white text-sm font-medium text-neutral-800 focus:border-accent-gold focus:ring-1 focus:ring-accent-gold/30 outline-none transition-all cursor-pointer"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}
