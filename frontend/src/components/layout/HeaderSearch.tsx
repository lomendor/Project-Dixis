'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from '@/contexts/LocaleContext';

/**
 * Pass HEADER-SEARCH-01: Persistent search bar in header.
 *
 * Desktop: Click magnifying glass → expandable input with auto-focus.
 * Mobile: Full-width search bar inside the mobile menu.
 * Navigates to /products?search=<query> on Enter.
 */
export default function HeaderSearch({ isMobile = false, light = false }: { isMobile?: boolean; light?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Close desktop search on route change
  useEffect(() => {
    setOpen(false);
    setQuery('');
  }, [pathname]);

  // Focus input when desktop search opens
  useEffect(() => {
    if (open && !isMobile && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open, isMobile]);

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setQuery('');
      }
      if (e.key === 'Enter' && query.trim()) {
        e.preventDefault();
        router.push(`/products?search=${encodeURIComponent(query.trim())}`);
        setOpen(false);
        setQuery('');
      }
    },
    [query, router]
  );

  const handleSubmit = () => {
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      setOpen(false);
      setQuery('');
    }
  };

  // ─── Mobile: full-width search inside mobile menu ───
  if (isMobile) {
    return (
      <div className="relative" data-testid="header-search-mobile">
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('nav.searchPlaceholder')}
          className="w-full px-4 py-3 pr-12 border border-neutral-200 rounded-lg bg-neutral-50 text-base text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          aria-label={t('nav.search')}
        />
        <button
          type="button"
          onClick={handleSubmit}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-neutral-400 hover:text-primary transition-colors touch-manipulation"
          aria-label={t('nav.search')}
        >
          <SearchIcon className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // ─── Desktop: expandable search ───
  return (
    <div className="relative flex items-center" data-testid="header-search-desktop">
      {open ? (
        <div className="flex items-center gap-1 animate-in slide-in-from-right-2 duration-200">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              // Close after a short delay so click on submit button registers
              setTimeout(() => {
                if (!query.trim()) {
                  setOpen(false);
                }
              }, 200);
            }}
            placeholder={t('nav.searchPlaceholder')}
            className="w-48 lg:w-64 px-3 py-1.5 border border-neutral-200 rounded-lg bg-neutral-50 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            aria-label={t('nav.search')}
          />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setQuery('');
            }}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 transition-colors"
            aria-label={t('common.cancel')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`p-2 transition-colors rounded-md ${
            light
              ? 'text-white/70 hover:text-white hover:bg-white/10'
              : 'text-neutral-500 hover:text-primary hover:bg-neutral-50'
          }`}
          aria-label={t('nav.search')}
          data-testid="header-search-toggle"
        >
          <SearchIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}
