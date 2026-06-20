import type { NextConfig } from "next";
import path from "path";
import { withSentryConfig } from '@sentry/nextjs';

// Analytics (ANALYTICS-UMAMI-01): NEXT_PUBLIC_* values are inlined into the CLIENT
// bundle at BUILD time, not read at runtime. The CI build runner (deploy-frontend.yml)
// never exported the Umami vars, so the shipped client bundle had provider/website-id
// = undefined and the tracker never loaded — Umami recorded 0 visitors even though the
// server-side env (PM2) was correct. Default them for production builds so the values
// are always baked into the bundle. Any explicit env still wins (e.g. staging), and
// dev builds stay disabled so local traffic never pollutes prod analytics.
const analyticsEnv: Record<string, string> =
  process.env.NODE_ENV === 'production'
    ? {
        NEXT_PUBLIC_ANALYTICS_PROVIDER:
          process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER || 'umami',
        NEXT_PUBLIC_ANALYTICS_DOMAIN:
          process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN || 'dixis.gr',
        NEXT_PUBLIC_ANALYTICS_SRC:
          process.env.NEXT_PUBLIC_ANALYTICS_SRC || '/u/script.js',
        NEXT_PUBLIC_ANALYTICS_WEBSITE_ID:
          process.env.NEXT_PUBLIC_ANALYTICS_WEBSITE_ID ||
          'a35acaaa-3571-4e02-b211-d104a9e42698',
      }
    : {};

const nextConfig: NextConfig = {
  // Build-time analytics env so NEXT_PUBLIC_ANALYTICS_* are inlined into the
  // client bundle (see analyticsEnv above for why).
  env: analyticsEnv,

  // Fix "inferred workspace root" warning
  outputFileTracingRoot: __dirname,

  // Instrumentation is enabled by default in Next.js 15

  // Hide Next.js version from X-Powered-By header (AG-SEC-01)
  poweredByHeader: false,

  // Production optimization: standalone mode for PM2 deployment
  output: 'standalone',

  // Temporarily disable ESLint during build for hotfix
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Image optimization for external sources
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8001',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'dixis.gr',
      },
      {
        protocol: 'https',
        hostname: 'www.dixis.gr',
      },
      {
        protocol: 'https',
        hostname: '*.hstgr.net',
      },
    ],
  },

  // Security headers (AG-SEC-01)
  async headers() {
    // Get API base URL from environment
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001/api/v1';
    // Extract origin (remove /api/v1 path if present)
    const apiOrigin = apiBaseUrl.replace('/api/v1', '').replace(/\/$/, '');
    const sentryDsn = 'https://o4508541701652480.ingest.de.sentry.io';

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Stripe Elements requires js.stripe.com scripts; Plausible analytics script
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://plausible.io",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              // Stripe API calls, Sentry, and Plausible analytics
              `connect-src 'self' ${apiOrigin} ${sentryDsn} https://api.stripe.com https://r.stripe.com https://plausible.io`,
              // Stripe Elements uses iframes from js.stripe.com and hooks.stripe.com
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
              "frame-ancestors 'none'",
            ].join('; '),
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },

  // Umami analytics proxy — first-party domain avoids ad blockers (ANALYTICS-UMAMI-01)
  async rewrites() {
    return [
      {
        source: '/u/:path*',
        destination: 'http://127.0.0.1:3001/:path*',
      },
    ];
  },

  // Webpack configuration to handle module resolution
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@dixis/contracts': path.resolve(__dirname, '../packages/contracts/src'),
    }

    // Note: Console removal in production handled by ESLint rules instead of webpack
    // to avoid conflicts with Next.js internal modules

    return config
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  // Disable Sentry's auto-wrapping of middleware. Its Rollup-based loader
  // silently swallows middleware logic in standalone builds, causing our
  // auth redirects to never execute. We handle errors manually instead.
  autoInstrumentMiddleware: false,
});
