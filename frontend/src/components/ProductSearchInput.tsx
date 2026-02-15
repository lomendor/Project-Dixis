'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { useTranslations } from '@/contexts/LocaleContext';

/**
 * Pass SEARCH-FTS-01: Product search input with debounce and URL sync.
 * 300ms debounce, syncs with ?search= URL param for shareable links.
 */
export function ProductSearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations();

  // Initialize from URL param
  const initialSearch = searchParams.get('search') || '';
  const [inputValue, setInputValue] = useState(initialSearch);

  // Debounced URL update
  const updateSearchParam = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set('search', value.trim());
      } else {
        params.delete('search');
      }
      // Keep category param if present
      const queryString = params.toString();
      startTransition(() => {
        router.push(`/products${queryString ? `?${queryString}` : ''}`, { scroll: false });
      });
    },
    [router, searchParams]
  );

  // Debounce effect (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only update if value differs from URL
      const currentUrlSearch = searchParams.get('search') || '';
      if (inputValue.trim() !== currentUrlSearch) {
        updateSearchParam(inputValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, searchParams, updateSearchParam]);

  // Sync input when URL changes externally (e.g., back/forward nav)
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    if (urlSearch !== inputValue && !isPending) {
      setInputValue(urlSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleClear = () => {
    setInputValue('');
    updateSearchParam('');
  };

  return (
    <div className="relative w-full max-w-md">
      <input
        type="search"
        data-testid="search-input"
        placeholder={t('products.searchPlaceholder')}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="w-full px-4 py-2 pr-10 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
        aria-label={t('products.searchPlaceholder')}
      />
      {inputValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          aria-label={t('common.cancel')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      {isPending && (
        <div className="absolute right-10 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
