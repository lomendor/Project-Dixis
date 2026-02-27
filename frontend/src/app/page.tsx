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
 * Layout: compact hero banner → categories → horizontal scroll products → producers → trust → CTA
 * User sees products immediately without scrolling past giant hero.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <SectionReveal>
        <HomeCategoryStrip />
      </SectionReveal>
      <SectionReveal>
        <FeaturedProducts />
      </SectionReveal>
      <SectionReveal>
        <ProducerSpotlight />
      </SectionReveal>
      <SectionReveal>
        <TrustBar />
      </SectionReveal>
      <SectionReveal>
        <HomeCTA />
      </SectionReveal>
    </>
  );
}
