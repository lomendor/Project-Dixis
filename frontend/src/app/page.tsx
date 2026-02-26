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
 * Homepage — Premium editorial landing page for Dixis marketplace
 *
 * Design system: Noto Serif Display + Inter, warm olive greens, generous whitespace.
 * Each section wrapped in SectionReveal for scroll-triggered fade-in-up animation.
 * Hero is NOT wrapped (it has its own entry animation).
 *
 * Section backgrounds alternate for magazine-like visual rhythm:
 * 1. Hero — warm cream gradient
 * 2. Categories — white
 * 3. Featured — warm cream (#faf8f3)
 * 4. Producer — warm sand (#f5f0e6), full-bleed
 * 5. Trust — white
 * 6. CTA — near-black (#1b2a1e)
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
