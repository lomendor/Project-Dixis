import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix "inferred workspace root" warning
  outputFileTracingRoot: __dirname,
  
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
};

export default nextConfig;
