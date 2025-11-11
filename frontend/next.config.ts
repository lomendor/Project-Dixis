import type { NextConfig } from "next";
import path from "path";
import createNextIntlPlugin from 'next-intl/plugin';
import { withSentryConfig } from '@sentry/nextjs';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  // Fix "inferred workspace root" warning
  outputFileTracingRoot: __dirname,

  // Instrumentation is enabled by default in Next.js 15

  // Temporarily disable ESLint during build for hotfix
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Image optimization for external sources
  images: {
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
    ],
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
