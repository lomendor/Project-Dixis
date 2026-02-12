import type { NextConfig } from "next";
import path from "path";
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
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
              // Stripe Elements requires js.stripe.com scripts
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              // Stripe API calls require api.stripe.com and r.stripe.com (analytics)
              `connect-src 'self' ${apiOrigin} ${sentryDsn} https://api.stripe.com https://r.stripe.com`,
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

export default withSentryConfig(nextConfig, { silent: true });
