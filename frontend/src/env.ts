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
// CRITICAL: Browser ALWAYS uses relative /api/v1 (same-origin)
// Only server-side SSR can use INTERNAL_API_URL for server-to-server calls
function getApiBaseUrlFromEnv(): string {
  // 1. Explicit NEXT_PUBLIC_API_BASE_URL takes precedence
  const explicitUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (explicitUrl) {
    return explicitUrl;
  }

  // 2. Browser: ALWAYS relative URL (same-origin requests)
  if (typeof window !== 'undefined') {
    return '/api/v1';
  }

  // 3. Server-side: Use INTERNAL_API_URL if set, else relative
  const internalUrl = process.env.INTERNAL_API_URL;
  if (internalUrl) {
    return internalUrl;
  }

  // 4. Fallback: relative (works in both environments)
  return '/api/v1';
}

export const API_BASE_URL = getApiBaseUrlFromEnv();

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

// GUARDRAIL: Prevent localhost API calls in production (catches both 127.0.0.1 and localhost)
if (IS_PRODUCTION && (API_BASE_URL.includes('127.0.0.1') || API_BASE_URL.includes('localhost'))) {
  throw new Error(
    'CRITICAL: API_BASE_URL contains localhost in production! ' +
    'Set NEXT_PUBLIC_API_BASE_URL environment variable correctly.'
  );
}
