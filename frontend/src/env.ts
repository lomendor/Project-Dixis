/**
 * Environment Configuration & Validation
 * Central source for all environment variables with runtime validation
 */

// Runtime validation helper
function getRequiredEnvVar(name: string, fallback?: string): string {
  const value = process.env[name] || fallback;
  if (!value) {
    const message = `Missing required environment variable: ${name}`;
    console.error(`🚨 ENV ERROR: ${message}`);
    throw new Error(message);
  }
  return value;
}

function getOptionalEnvVar(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

// Core API Configuration
export const API_BASE_URL = getRequiredEnvVar(
  'NEXT_PUBLIC_API_BASE_URL',
  'http://127.0.0.1:8001/api/v1'
);

export const SITE_URL = getOptionalEnvVar(
  'NEXT_PUBLIC_SITE_URL',
  'https://projectdixis.com'
);

// Localization & Regional Settings
export const DEFAULT_LOCALE = 'el-GR' as const;
export const SUPPORTED_LOCALES = ['el-GR', 'en-US'] as const;
export const DEFAULT_CURRENCY = 'EUR' as const;
export const DEFAULT_COUNTRY = 'GR' as const;

// Currency & Number Formatting
export const CURRENCY_FORMATTER = new Intl.NumberFormat(DEFAULT_LOCALE, {
  style: 'currency',
  currency: DEFAULT_CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const NUMBER_FORMATTER = new Intl.NumberFormat(DEFAULT_LOCALE, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

// Date & Time Formatting
export const DATE_FORMATTER = new Intl.DateTimeFormat(DEFAULT_LOCALE, {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export const TIME_FORMATTER = new Intl.DateTimeFormat(DEFAULT_LOCALE, {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

export const DATETIME_FORMATTER = new Intl.DateTimeFormat(DEFAULT_LOCALE, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

// SEO & Analytics
export const GOOGLE_SITE_VERIFICATION = getOptionalEnvVar(
  'NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION',
  ''
);

export const FACEBOOK_DOMAIN_VERIFICATION = getOptionalEnvVar(
  'NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION',
  ''
);

// Feature Flags
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Runtime Configuration Validation
export function validateEnvironment(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    // Validate API_BASE_URL
    new URL(API_BASE_URL);
  } catch {
    errors.push('NEXT_PUBLIC_API_BASE_URL must be a valid URL');
  }

  try {
    // Validate SITE_URL
    new URL(SITE_URL);
  } catch {
    errors.push('NEXT_PUBLIC_SITE_URL must be a valid URL');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Helper functions for common tasks
export function formatCurrency(amount: number): string {
  return CURRENCY_FORMATTER.format(amount);
}

export function formatNumber(num: number): string {
  return NUMBER_FORMATTER.format(num);
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return DATE_FORMATTER.format(dateObj);
}

export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return DATETIME_FORMATTER.format(dateObj);
}

// API URL helpers
export function apiUrl(path: string): string {
  // Clean path of leading/trailing slashes
  const cleanPath = path.replace(/^\/+|\/+$/g, '');
  // Ensure API_BASE_URL doesn't end with slash, then append path
  const baseUrl = API_BASE_URL.replace(/\/+$/, '');
  return `${baseUrl}/${cleanPath}`;
}

export function siteUrl(path: string = ''): string {
  const cleanPath = path.replace(/^\/+|\/+$/g, '');
  const baseUrl = SITE_URL.replace(/\/+$/, '');
  return cleanPath ? `${baseUrl}/${cleanPath}` : baseUrl;
}

// Greek locale labels (can be extended to full i18n later)
export const LABELS = {
  currency: '€',
  priceLabel: 'Τιμή',
  stockLabel: 'Απόθεμα',
  producerLabel: 'Παραγωγός',
  categoryLabel: 'Κατηγορία',
  addToCartLabel: 'Προσθήκη στο Καλάθι',
  viewDetailsLabel: 'Προβολή Λεπτομερειών',
  outOfStockLabel: 'Εξαντλήθηκε',
  loadingLabel: 'Φόρτωση...',
} as const;

// Log environment info in development
if (IS_DEVELOPMENT) {
  console.log('🌍 Environment Configuration:', {
    API_BASE_URL,
    SITE_URL,
    DEFAULT_LOCALE,
    DEFAULT_CURRENCY,
    NODE_ENV: process.env.NODE_ENV,
  });
  
  const validation = validateEnvironment();
  if (!validation.isValid) {
    console.warn('⚠️ Environment validation warnings:', validation.errors);
  }
}