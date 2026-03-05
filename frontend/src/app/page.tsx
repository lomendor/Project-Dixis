import type { Metadata } from 'next';
import Hero from '@/components/marketing/Hero';
import HomeCategoryStrip from '@/components/marketing/HomeCategoryStrip';
import FeaturedProducts from '@/components/marketing/FeaturedProducts';
import ProducerSpotlight from '@/components/marketing/ProducerSpotlight';
import TrustBar from '@/components/marketing/TrustBar';
import HomeCTA from '@/components/marketing/HomeCTA';
import SectionReveal from '@/components/marketing/SectionReveal';

export const metadata: Metadata = {
  title: 'Dixis — Αυθεντικά Ελληνικά Προϊόντα από Τοπικούς Παραγωγούς',
  description:
    'Ανακαλύψτε ελαιόλαδο, μέλι, βότανα και χειροποίητα προϊόντα απευθείας από Έλληνες παραγωγούς. Ασφαλείς πληρωμές, γρήγορη παράδοση.',
};

/**
 * Homepage — Commerce-first landing page for Dixis marketplace
 *
 * Layout: compact hero → categories → products → producer → trust → CTA
 *
 * Categories + Products render immediately (no SectionReveal) so the page
 * never looks empty below the fold. Deeper sections animate in on scroll.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <HomeCategoryStrip />
      <FeaturedProducts />
      <SectionReveal>
        <ProducerSpotlight />
      </SectionReveal>
      <SectionReveal>
        <TrustBar />
      </SectionReveal>
      <HomeCTA />
    </>
  );
}
