'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { locales, defaultLocale, type Locale } from '../../i18n';
import elMessages from '../../messages/el.json';
import enMessages from '../../messages/en.json';

const messages: Record<Locale, typeof elMessages> = {
  el: elMessages,
  en: enMessages,
};

// Helper to dig into nested object
function dig(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((o, k) => {
    if (o && typeof o === 'object' && !Array.isArray(o)) {
      return (o as Record<string, unknown>)[k];
    }
    return undefined;
  }, obj);
}

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

const LOCALE_COOKIE = 'dixis_locale';

function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;

  // Only use explicitly set cookie (user's deliberate choice)
  // Do NOT auto-detect browser language — this is a Greek marketplace
  // and should default to Greek for all visitors.
  const cookieMatch = document.cookie.match(new RegExp(`${LOCALE_COOKIE}=([^;]+)`));
  if (cookieMatch && locales.includes(cookieMatch[1] as Locale)) {
    return cookieMatch[1] as Locale;
  }

  return defaultLocale;
}

function setStoredLocale(locale: Locale) {
  if (typeof window === 'undefined') return;
  // Set cookie with 1 year expiry
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;expires=${expires};SameSite=Lax`;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocaleState(getStoredLocale());
    setMounted(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    if (locales.includes(newLocale)) {
      setLocaleState(newLocale);
      setStoredLocale(newLocale);
    }
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const currentMessages = messages[locale] || messages[defaultLocale];
    let value = dig(currentMessages as unknown as Record<string, unknown>, key);

    // Fallback to default locale if not found
    if (value === undefined && locale !== defaultLocale) {
      value = dig(messages[defaultLocale] as unknown as Record<string, unknown>, key);
    }

    // Return key if still not found
    if (value === undefined || value === null) {
      return key;
    }

    let result = String(value);

    // Replace params like {count}, {search}
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }

    return result;
  }, [locale]);

  // Prevent hydration mismatch by rendering children only after mount
  if (!mounted) {
    return (
      <LocaleContext.Provider value={{ locale: defaultLocale, setLocale, t }}>
        {children}
      </LocaleContext.Provider>
    );
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}

export function useTranslations() {
  const { t } = useLocale();
  return t;
}
