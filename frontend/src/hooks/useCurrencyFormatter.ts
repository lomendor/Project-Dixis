'use client';

import { useMemo, useCallback } from 'react';
import { 
  CURRENCY_FORMATTER, 
  NUMBER_FORMATTER, 
  DEFAULT_LOCALE, 
  DEFAULT_CURRENCY 
} from '@/env';

/**
 * Custom hook for currency and number formatting using Greek locale
 * Provides formatters for currency, numbers, and percentage values
 * 
 * @returns Object with formatting functions and formatters
 * 
 * @example
 * ```tsx
 * const { formatCurrency, formatNumber, formatPercent } = useCurrencyFormatter();
 * 
 * const price = formatCurrency(29.99); // "29,99 €"
 * const quantity = formatNumber(1500); // "1.500"
 * const discount = formatPercent(0.15); // "15%"
 * ```
 */
export function useCurrencyFormatter() {
  // Create percentage formatter
  const percentFormatter = useMemo(
    () => new Intl.NumberFormat(DEFAULT_LOCALE, {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }),
    []
  );

  // Create compact number formatter for large numbers
  const compactFormatter = useMemo(
    () => new Intl.NumberFormat(DEFAULT_LOCALE, {
      notation: 'compact',
      compactDisplay: 'short',
    }),
    []
  );

  // Format currency amount
  const formatCurrency = useCallback(
    (amount: number | string | null | undefined): string => {
      if (amount == null || amount === '') return '0,00 €';
      
      const numValue = typeof amount === 'string' ? parseFloat(amount) : amount;
      if (isNaN(numValue)) return '0,00 €';
      
      return CURRENCY_FORMATTER.format(numValue);
    },
    []
  );

  // Format number with Greek locale
  const formatNumber = useCallback(
    (value: number | string | null | undefined): string => {
      if (value == null || value === '') return '0';
      
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(numValue)) return '0';
      
      return NUMBER_FORMATTER.format(numValue);
    },
    []
  );

  // Format percentage
  const formatPercent = useCallback(
    (value: number | null | undefined, fractionDigits: number = 0): string => {
      if (value == null) return '0%';
      if (isNaN(value)) return '0%';
      
      return new Intl.NumberFormat(DEFAULT_LOCALE, {
        style: 'percent',
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      }).format(value);
    },
    []
  );

  // Format large numbers in compact form (1K, 1M, etc.)
  const formatCompact = useCallback(
    (value: number | null | undefined): string => {
      if (value == null) return '0';
      if (isNaN(value)) return '0';
      
      return compactFormatter.format(value);
    },
    [compactFormatter]
  );

  // Format currency with custom options
  const formatCurrencyCustom = useCallback(
    (
      amount: number | string | null | undefined,
      options?: {
        minimumFractionDigits?: number;
        maximumFractionDigits?: number;
        currency?: string;
      }
    ): string => {
      if (amount == null || amount === '') return '0,00 €';
      
      const numValue = typeof amount === 'string' ? parseFloat(amount) : amount;
      if (isNaN(numValue)) return '0,00 €';
      
      const formatter = new Intl.NumberFormat(DEFAULT_LOCALE, {
        style: 'currency',
        currency: options?.currency || DEFAULT_CURRENCY,
        minimumFractionDigits: options?.minimumFractionDigits ?? 2,
        maximumFractionDigits: options?.maximumFractionDigits ?? 2,
      });
      
      return formatter.format(numValue);
    },
    []
  );

  // Parse currency string back to number
  const parseCurrency = useCallback(
    (currencyString: string): number => {
      if (!currencyString) return 0;
      
      // Remove currency symbol, spaces, and convert comma to dot
      const cleaned = currencyString
        .replace(/[€$£¥]/g, '')
        .replace(/\s/g, '')
        .replace(',', '.');
      
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    },
    []
  );

  // Check if a value is a valid currency amount
  const isValidCurrency = useCallback(
    (value: string | number): boolean => {
      if (typeof value === 'number') return !isNaN(value) && isFinite(value);
      if (typeof value === 'string') {
        const parsed = parseCurrency(value);
        return !isNaN(parsed) && isFinite(parsed);
      }
      return false;
    },
    [parseCurrency]
  );

  return {
    // Primary formatters
    formatCurrency,
    formatNumber,
    formatPercent,
    formatCompact,
    formatCurrencyCustom,
    
    // Utility functions
    parseCurrency,
    isValidCurrency,
    
    // Raw formatters (for advanced usage)
    currencyFormatter: CURRENCY_FORMATTER,
    numberFormatter: NUMBER_FORMATTER,
    percentFormatter,
    compactFormatter,
    
    // Constants
    locale: DEFAULT_LOCALE,
    currency: DEFAULT_CURRENCY,
  };
}