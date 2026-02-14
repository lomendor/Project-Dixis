'use client';

import Script from 'next/script';

/**
 * Analytics Component - Privacy-friendly, cookie-less analytics
 *
 * Supports: Plausible Analytics (default), Umami
 *
 * Configuration via environment variables:
 * - NEXT_PUBLIC_ANALYTICS_PROVIDER: 'plausible' | 'umami' (default: none/disabled)
 * - NEXT_PUBLIC_ANALYTICS_DOMAIN: Your domain (e.g., 'dixis.gr')
 * - NEXT_PUBLIC_ANALYTICS_SRC: Script URL (optional, uses defaults)
 * - NEXT_PUBLIC_ANALYTICS_WEBSITE_ID: Required for Umami only
 *
 * GDPR/EL Compliance Notes:
 * - Plausible: No cookies, no personal data, EU-hosted option available
 * - Umami: No cookies, self-hostable for full data sovereignty
 * - Both are privacy-friendly and don't require cookie consent banners
 *
 * @see https://plausible.io/privacy-focused-web-analytics
 * @see https://umami.is/docs/about
 */
export function Analytics() {
  const provider = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER;
  const domain = process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN;

  // No provider configured - analytics disabled
  if (!provider || !domain) {
    return null;
  }

  if (provider === 'plausible') {
    const src = process.env.NEXT_PUBLIC_ANALYTICS_SRC || 'https://plausible.io/js/script.js';
    return (
      <Script
        defer
        data-domain={domain}
        src={src}
        strategy="afterInteractive"
      />
    );
  }

  if (provider === 'umami') {
    const src = process.env.NEXT_PUBLIC_ANALYTICS_SRC;
    const websiteId = process.env.NEXT_PUBLIC_ANALYTICS_WEBSITE_ID;

    if (!src || !websiteId) {
      return null;
    }

    return (
      <Script
        defer
        data-website-id={websiteId}
        src={src}
        strategy="afterInteractive"
      />
    );
  }

  // Unknown provider — no-op
  return null;
}

export default Analytics;
