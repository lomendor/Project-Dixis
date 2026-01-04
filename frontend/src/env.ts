/**
 * Environment Configuration
 * Centralized environment variables and configuration for the frontend
 */

// Runtime environment validation
function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value;
}

// API Configuration
// CRITICAL: Production uses same-origin /api/v1 (no localhost fallback)
// Development uses localhost:8001 for local backend
export const API_BASE_URL = getEnvVar(
  'NEXT_PUBLIC_API_BASE_URL',
  process.env.NODE_ENV === 'production'
    ? '/api/v1'  // Same-origin relative URL for production
    : 'http://127.0.0.1:8001/api/v1'  // Dev fallback (local backend)
);

export const SITE_URL = getEnvVar(
  'NEXT_PUBLIC_SITE_URL',
  'https://dixis.gr'
);

// Locale and Currency Configuration (Greek Defaults)
export const DEFAULT_LOCALE = 'el-GR' as const;
export const DEFAULT_CURRENCY = 'EUR' as const;

// Currency Formatter (Greek locale)
export const CURRENCY_FORMATTER = new Intl.NumberFormat(DEFAULT_LOCALE, {
  style: 'currency',
  currency: DEFAULT_CURRENCY,
});

// Environment Information
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const IS_DEVELOPMENT = NODE_ENV === 'development';
export const IS_PRODUCTION = NODE_ENV === 'production';

/**
 * Format currency amount using Greek locale and EUR
 * @param amount - Amount to format
 * @returns Formatted currency string (e.g., "12,34 €")
 */
export function formatCurrency(amount: number): string {
  return CURRENCY_FORMATTER.format(amount);
}

/**
 * Clean API URL joining - prevents double slashes
 * @param path - API path (relative)
 * @returns Full API URL
 */
export function apiUrl(path: string): string {
  const base = API_BASE_URL.replace(/\/$/, ''); // Remove trailing slash
  const cleanPath = path.replace(/^\//, ''); // Remove leading slash
  return `${base}/${cleanPath}`;
}

/**
 * Debug: Log environment configuration (development only)
 */
export function logEnvironmentConfig(): void {
  if (IS_DEVELOPMENT) {
    console.log('🌍 Environment Configuration:', {
      API_BASE_URL,
      SITE_URL,
      DEFAULT_LOCALE,
      DEFAULT_CURRENCY,
      NODE_ENV,
    });
  }
}

// Auto-log in development
if (typeof window !== 'undefined' && IS_DEVELOPMENT) {
  logEnvironmentConfig();
}

// GUARDRAIL: Prevent localhost API calls in production
if (IS_PRODUCTION && API_BASE_URL.includes('127.0.0.1')) {
  throw new Error(
    'CRITICAL: API_BASE_URL contains localhost in production! ' +
    'Set NEXT_PUBLIC_API_BASE_URL environment variable correctly.'
  );
}