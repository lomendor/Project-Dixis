import type { Metadata } from 'next';
import HomeClient from './HomeClient';
import { SITE_URL } from '@/env';

// SEO metadata for homepage (server-side)
export const metadata: Metadata = {
  title: "Fresh Local Products from Greek Producers",
  description: "Discover premium organic vegetables, fresh fruits, and artisanal products directly from local Greek producers. Support sustainable agriculture and taste the difference of farm-fresh quality.",
  keywords: [
    "fresh vegetables Greece",
    "organic fruits",
    "local Greek producers", 
    "farm fresh products",
    "sustainable agriculture",
    "artisanal food",
    "direct from farm",
    "premium organic produce"
  ],
  openGraph: {
    title: "Fresh Local Products from Greek Producers",
    description: "Discover premium organic vegetables, fresh fruits, and artisanal products directly from local Greek producers.",
    url: SITE_URL,
    images: [
      {
        url: `${SITE_URL}/og-products.jpg`,
        width: 1200,
        height: 630,
        alt: 'Fresh local products from Greek producers',
      },
    ],
  },
  twitter: {
    title: "Fresh Local Products from Greek Producers",
    description: "Discover premium organic vegetables, fresh fruits, and artisanal products directly from local Greek producers.",
    images: [`${SITE_URL}/twitter-products.jpg`],
  },
};

// Server component that renders client component
export default function Page() {
  return <HomeClient />;
}