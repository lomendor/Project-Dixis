/**
 * Feature flags for Dixis application
 *
 * Landing Mode: When enabled, shows a coming-soon/interest page
 * instead of the full product catalog. Used for soft launches.
 */

/**
 * Landing Mode Flag
 * - When `true`: Show landing page with waitlist form
 * - When `false`: Show full product catalog
 *
 * Set via environment: PUBLIC_LANDING_MODE=true
 */
export const LANDING_MODE = process.env.PUBLIC_LANDING_MODE === 'true';

/**
 * Check if current environment is production (dixis.gr)
 */
export function isProductionHost(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.endsWith('dixis.gr');
}

/**
 * Check if we should show noindex/nofollow meta tags
 * (landing mode OR production host)
 */
export function shouldNoIndex(): boolean {
  return LANDING_MODE || isProductionHost();
}
