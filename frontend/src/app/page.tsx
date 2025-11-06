import type { Metadata } from 'next';
import Home from './Home';
import LandingPage from './Landing';
import { LANDING_MODE, shouldNoIndex } from '@/lib/flags';

// Use ISR (Incremental Static Regeneration) for data fetching
export const revalidate = 3600; // Revalidate every hour

// SEO metadata for homepage
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://projectdixis.com";

export const metadata: Metadata = {
  title: LANDING_MODE
    ? "Dixis - Σύντομα διαθέσιμο | Τοπικά προϊόντα από Έλληνες παραγωγούς"
    : "Fresh Local Products from Greek Producers | Dixis",
  description: LANDING_MODE
    ? "Η νέα πλατφόρμα που συνδέει Έλληνες παραγωγούς με καταναλωτές. Φρέσκα, βιολογικά και τοπικά προϊόντα απευθείας στην πόρτα σας."
    : "Discover premium organic vegetables, fresh fruits, and artisanal products directly from local Greek producers. Support sustainable agriculture and taste the difference of farm-fresh quality.",
  keywords: LANDING_MODE
    ? [
        "τοπικά προϊόντα Ελλάδα",
        "Έλληνες παραγωγοί",
        "φρέσκα λαχανικά",
        "βιολογικά προϊόντα",
        "παραδοσιακά ελληνικά προϊόντα"
      ]
    : [
        "fresh vegetables Greece",
        "organic fruits",
        "local Greek producers",
        "farm fresh products",
        "sustainable agriculture",
        "artisanal food",
        "direct from farm",
        "premium organic produce"
      ],
  ...(shouldNoIndex() && {
    robots: {
      index: false,
      follow: false,
    },
  }),
  openGraph: {
    title: LANDING_MODE
      ? "Dixis - Φρέσκα τοπικά προϊόντα από Έλληνες παραγωγούς"
      : "Fresh Local Products from Greek Producers",
    description: LANDING_MODE
      ? "Η νέα πλατφόρμα που συνδέει Έλληνες παραγωγούς με καταναλωτές."
      : "Discover premium organic vegetables, fresh fruits, and artisanal products directly from local Greek producers.",
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
    title: LANDING_MODE
      ? "Dixis - Φρέσκα τοπικά προϊόντα"
      : "Fresh Local Products from Greek Producers",
    description: LANDING_MODE
      ? "Η νέα πλατφόρμα που συνδέει παραγωγούς με καταναλωτές."
      : "Discover premium organic vegetables, fresh fruits, and artisanal products directly from local Greek producers.",
    images: [`${siteUrl}/twitter-products.jpg`],
  },
};

export default function Page() {
  // Conditional rendering based on LANDING_MODE feature flag
  if (LANDING_MODE) {
    return <LandingPage />;
  }

  return <Home />;
}