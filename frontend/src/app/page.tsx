import type { Metadata } from 'next';
import Home from './Home';

// Use ISR (Incremental Static Regeneration) for data fetching
export const revalidate = 3600; // Revalidate every hour

// SEO metadata for homepage
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://projectdixis.com";

export const metadata: Metadata = {
  title: "Fresh Local Products from Greek Producers | Dixis",
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
    url: siteUrl,
    images: [
      {
        url: `${siteUrl}/og-products.jpg`,
        width: 1200,
        height: 630,
        alt: 'Fresh local products from Greek producers',
      },
    ],
  },
  twitter: {
    title: "Fresh Local Products from Greek Producers",
    description: "Discover premium organic vegetables, fresh fruits, and artisanal products directly from local Greek producers.",
    images: [`${siteUrl}/twitter-products.jpg`],
  },
};

export default function Page() {
  return <Home />;
}