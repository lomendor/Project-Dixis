import type { Metadata } from 'next';
import Hero from '@/components/marketing/Hero';
import HomeCategoryStrip from '@/components/marketing/HomeCategoryStrip';
import FeaturedProducts from '@/components/marketing/FeaturedProducts';
import ProducerSpotlight from '@/components/marketing/ProducerSpotlight';
import TrustBar from '@/components/marketing/TrustBar';
import HomeCTA from '@/components/marketing/HomeCTA';

export const metadata: Metadata = {
  title: 'Dixis — Αυθεντικά Ελληνικά Προϊόντα από Τοπικούς Παραγωγούς',
  description:
    'Ανακαλύψτε ελαιόλαδο, μέλι, βότανα και χειροποίητα προϊόντα απευθείας από Έλληνες παραγωγούς. Ασφαλείς πληρωμές, γρήγορη παράδοση.',
};

/**
 * Homepage — Premium landing page for Dixis marketplace
 *
 * 6 sections in visual order:
 * 1. Hero — value prop, CTA, trust signals
 * 2. HomeCategoryStrip — browse by category circles
 * 3. FeaturedProducts — curated product grid (ISR 1h)
 * 4. ProducerSpotlight — magazine-style producer feature (ISR 1h)
 * 5. TrustBar — value props (payments, delivery, Greek, fair trade)
 * 6. HomeCTA — dark contrast closing section
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <HomeCategoryStrip />
      <FeaturedProducts />
      <ProducerSpotlight />
      <TrustBar />
      <HomeCTA />
    </>
  );
}
