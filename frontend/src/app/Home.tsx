import Hero from '@/components/marketing/Hero';
import FeaturedProducts from '@/components/marketing/FeaturedProducts';

export const dynamic = 'force-dynamic';

export default async function Home(){
  return (
    <>
      <Hero />
      {/* sections: trust badges / CTA μπορούν να προστεθούν αργότερα */}
      <FeaturedProducts />
    </>
  );
}
