/**
 * Environment utilities
 *
 * Centralized environment checks for consistent behavior
 */

/**
 * Check if running in production environment
 *
 * Returns true if:
 * - DIXIS_ENV=production OR
 * - NODE_ENV=production AND DIXIS_ENV not set
 */
export function isProduction(): boolean {
  const dixisEnv = process.env.DIXIS_ENV;
  const nodeEnv = process.env.NODE_ENV;

  if (dixisEnv === 'production') return true;
  if (!dixisEnv && nodeEnv === 'production') return true;

  return false;
}

/**
 * Check if development features are enabled
 *
 * Returns true if:
 * - Not in production AND
 * - DIXIS_DEV=1 OR DIXIS_ENV=development
 */
export function isDevelopment(): boolean {
  if (isProduction()) return false;

  const dixisDev = process.env.DIXIS_DEV;
  const dixisEnv = process.env.DIXIS_ENV;

  return dixisDev === '1' || dixisEnv === 'development';
}

/**
 * Check if auth bypass is allowed
 *
 * Only enabled in non-production environments
 * This controls OTP_BYPASS and ADMIN_PHONES features
 */
export function isAuthBypassAllowed(): boolean {
  return !isProduction();
}

/**
 * Check if dev echo (OTP_DEV_ECHO) is allowed
 *
 * Only enabled in non-production environments
 */
export function isDevEchoAllowed(): boolean {
  return !isProduction() && process.env.OTP_DEV_ECHO === '1';
}
