import Hero from '@/components/marketing/Hero';
import FeaturedProducts from '@/components/marketing/FeaturedProducts';
import Trust from '@/components/marketing/Trust';
import CTA from '@/components/marketing/CTA';

export const dynamic = 'force-dynamic';

export default async function Home(){
  return (
    <>
      <Hero />
      <Trust />
      <FeaturedProducts />
      <CTA />
    </>
  );
}
