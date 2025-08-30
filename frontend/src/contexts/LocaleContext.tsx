'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { 
  DEFAULT_LOCALE,
  DEFAULT_CURRENCY,
  CURRENCY_FORMATTER,
  NUMBER_FORMATTER,
  DATE_FORMATTER,
  TIME_FORMATTER,
  DATETIME_FORMATTER,
  formatCurrency,
  formatNumber,
  formatDate,
  formatDateTime,
  LABELS
} from '@/env';

interface LocaleContextType {
  locale: string;
  currency: string;
  labels: typeof LABELS;
  formatters: {
    currency: typeof CURRENCY_FORMATTER;
    number: typeof NUMBER_FORMATTER;
    date: typeof DATE_FORMATTER;
    time: typeof TIME_FORMATTER;
    datetime: typeof DATETIME_FORMATTER;
  };
  utils: {
    formatCurrency: typeof formatCurrency;
    formatNumber: typeof formatNumber;
    formatDate: typeof formatDate;
    formatDateTime: typeof formatDateTime;
  };
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

interface LocaleProviderProps {
  children: ReactNode;
}

export function LocaleProvider({ children }: LocaleProviderProps) {
  const value: LocaleContextType = {
    locale: DEFAULT_LOCALE,
    currency: DEFAULT_CURRENCY,
    labels: LABELS,
    formatters: {
      currency: CURRENCY_FORMATTER,
      number: NUMBER_FORMATTER,
      date: DATE_FORMATTER,
      time: TIME_FORMATTER,
      datetime: DATETIME_FORMATTER,
    },
    utils: {
      formatCurrency,
      formatNumber,
      formatDate,
      formatDateTime,
    },
  };

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}

// Helper hooks for common operations
export function useCurrency() {
  const { utils, currency } = useLocale();
  return {
    format: utils.formatCurrency,
    currency,
    symbol: '€',
  };
}

export function useLabels() {
  const { labels } = useLocale();
  return labels;
}

export function useFormatters() {
  const { formatters, utils } = useLocale();
  return { ...formatters, ...utils };
}