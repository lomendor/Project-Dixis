import type { Metadata } from 'next';
import Home from './Home';
import LandingPage from './Landing';
import { LANDING_MODE, shouldNoIndex } from '@/lib/flags';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

// Use ISR (Incremental Static Regeneration) for data fetching
export const revalidate = 3600; // Revalidate every hour

// SEO metadata for homepage
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dixis.gr";

export const metadata: Metadata = {
  title: LANDING_MODE
    ? "Dixis — Σύντομα διαθέσιμο | Τοπικά προϊόντα από Έλληνες παραγωγούς"
    : "Φρέσκα τοπικά προϊόντα από Έλληνες παραγωγούς | Dixis",
  description: LANDING_MODE
    ? "Η νέα πλατφόρμα που συνδέει Έλληνες παραγωγούς με καταναλωτές. Φρέσκα, βιολογικά και τοπικά προϊόντα απευθείας στην πόρτα σας."
    : "Ανακαλύψτε φρέσκα τοπικά προϊόντα απευθείας από Έλληνες παραγωγούς. Βιολογικά λαχανικά, φρέσκα φρούτα και χειροποίητα προϊόντα — από το χωράφι στο τραπέζι σας.",
  keywords: [
    "τοπικά προϊόντα Ελλάδα",
    "Έλληνες παραγωγοί",
    "φρέσκα λαχανικά",
    "βιολογικά προϊόντα",
    "παραδοσιακά ελληνικά προϊόντα",
    "ελληνικό μέλι",
    "ελαιόλαδο",
    "τυριά",
  ],
  ...(shouldNoIndex() && {
    robots: {
      index: false,
      follow: false,
    },
  }),
  openGraph: {
    title: "Dixis — Φρέσκα τοπικά προϊόντα από Έλληνες παραγωγούς",
    description: "Ανακαλύψτε φρέσκα τοπικά προϊόντα απευθείας από Έλληνες παραγωγούς.",
    url: siteUrl,
    images: [
      {
        url: `${siteUrl}/logo.svg`,
        width: 400,
        height: 400,
        alt: 'Dixis — Φρέσκα τοπικά προϊόντα από Έλληνες παραγωγούς',
      },
    ],
  },
  twitter: {
    title: "Dixis — Φρέσκα τοπικά προϊόντα",
    description: "Ανακαλύψτε φρέσκα τοπικά προϊόντα απευθείας από Έλληνες παραγωγούς.",
    images: [`${siteUrl}/logo.svg`],
  },
};

export default function Page() {
  // Conditional rendering based on LANDING_MODE feature flag
  if (LANDING_MODE) {
    return <LandingPage />;
  }

  return <Home />;
}