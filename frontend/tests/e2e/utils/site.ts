/**
 * Site configuration utilities for E2E tests
 */

/**
 * Get expected site title from environment or use default
 */
export const getExpectedSiteTitle = (): string =>
  process.env.NEXT_PUBLIC_SITE_NAME ?? 'Project Dixis - Local Producer Marketplace';

/**
 * Get expected site description
 */
export const getExpectedSiteDescription = (): string =>
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION ?? 'Quality products directly from Greek producers';