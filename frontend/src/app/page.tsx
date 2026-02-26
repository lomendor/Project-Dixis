import type { Metadata } from 'next';
import Hero from '@/components/marketing/Hero';
import FeaturedProducts from '@/components/marketing/FeaturedProducts';

export const metadata: Metadata = {
  title: 'Dixis — Αυθεντικά Ελληνικά Προϊόντα από Τοπικούς Παραγωγούς',
  description:
    'Ανακαλύψτε ελαιόλαδο, μέλι, βότανα και χειροποίητα προϊόντα απευθείας από Έλληνες παραγωγούς. Ασφαλείς πληρωμές, γρήγορη παράδοση.',
};

/**
 * Homepage — Premium landing page for Dixis marketplace
 *
 * Sections rendered here (PR 1 starts with Hero + FeaturedProducts):
 * 1. Hero — value prop, CTA, trust signals
 * 2. FeaturedProducts — curated product grid (server component, ISR 1h)
 *
 * Future PRs add: HomeCategoryStrip, ProducerSpotlight, TrustBar, HomeCTA
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedProducts />
    </>
  );
}
