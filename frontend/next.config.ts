import type { NextConfig } from "next";
import path from "path";
import createNextIntlPlugin from 'next-intl/plugin';
import { withSentryConfig } from '@sentry/nextjs';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  // Fix "inferred workspace root" warning
  outputFileTracingRoot: __dirname,

  // Instrumentation is enabled by default in Next.js 15

  // Hide Next.js version from X-Powered-By header (AG-SEC-01)
  poweredByHeader: false,

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

  // Production optimization
  output: 'standalone',

  // Security headers (AG-SEC-01)
  async headers() {
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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' http://127.0.0.1:8001 http://localhost:8001 https://o4508541701652480.ingest.de.sentry.io",
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

export default withSentryConfig(withNextIntl(nextConfig), { silent: true });
