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
    ? "Dixis — Σύντομα διαθέσιμο | Αυθεντικά ελληνικά προϊόντα από παραγωγούς"
    : "Αυθεντικά Ελληνικά Προϊόντα από Έλληνες παραγωγούς | Dixis",
  description: LANDING_MODE
    ? "Η νέα πλατφόρμα που συνδέει Έλληνες παραγωγούς με καταναλωτές. Αυθεντικά, παραδοσιακά ελληνικά προϊόντα απευθείας στην πόρτα σας."
    : "Ανακαλύψτε αυθεντικά ελληνικά προϊόντα απευθείας από Έλληνες παραγωγούς. Ελαιόλαδο, μέλι, βότανα και χειροποίητα προϊόντα — από τον παραγωγό στην πόρτα σας.",
  keywords: [
    "τοπικά προϊόντα Ελλάδα",
    "Έλληνες παραγωγοί",
    "ελαιόλαδο, μέλι",
    "αυθεντικά ελληνικά προϊόντα",
    "παραδοσιακά ελληνικά προϊόντα",
    "ελληνικό μέλι",
    "ελαιόλαδο",
    "βότανα",
  ],
  ...(shouldNoIndex() && {
    robots: {
      index: false,
      follow: false,
    },
  }),
  openGraph: {
    title: "Dixis — Αυθεντικά Ελληνικά Προϊόντα από Έλληνες παραγωγούς",
    description: "Ανακαλύψτε αυθεντικά ελληνικά προϊόντα απευθείας από Έλληνες παραγωγούς.",
    url: siteUrl,
    images: [
      {
        url: `${siteUrl}/logo.png`,
        width: 400,
        height: 400,
        alt: 'Dixis — Αυθεντικά Ελληνικά Προϊόντα από Έλληνες παραγωγούς',
      },
    ],
  },
  twitter: {
    title: "Dixis — Αυθεντικά Ελληνικά Προϊόντα",
    description: "Ανακαλύψτε αυθεντικά ελληνικά προϊόντα απευθείας από Έλληνες παραγωγούς.",
    images: [`${siteUrl}/logo.png`],
  },
};

export default function Page() {
  // Conditional rendering based on LANDING_MODE feature flag
  if (LANDING_MODE) {
    return <LandingPage />;
  }

  return <Home />;
}