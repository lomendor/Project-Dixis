import Image from 'next/image';
import Link from 'next/link';

/**
 * Hero Section — Light, Warm, Joyful
 *
 * Bright cream background, split layout: text left, image right.
 * Headline lines rise from a mask on load; supporting elements fade up
 * (CSS-only, server component, respects prefers-reduced-motion).
 *
 * Mobile: stacked. Desktop: side-by-side.
 */
export default function Hero() {
  return (
    <section className="relative bg-accent-cream overflow-hidden">
      <div className="max-w-[1800px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row items-center gap-5 sm:gap-8 lg:gap-12 pt-6 sm:pt-10 lg:pt-12 pb-6 sm:pb-10 lg:pb-12">

          {/* Left — Text content */}
          <div className="flex-1 max-w-xl lg:max-w-none text-center lg:text-left">
            {/* Eyebrow */}
            <span
              className="hero-fade hidden sm:inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-primary font-semibold bg-primary-pale px-4 py-1.5 rounded-full mb-6"
              style={{ animationDelay: '60ms' }}
            >
              <span className="w-1.5 h-1.5 bg-primary rounded-full" />
              Από τον παραγωγό στο τραπέζι σου
            </span>

            {/* Headline — lines rise from a mask */}
            <h1 className="text-[1.625rem] sm:text-[3rem] lg:text-[3.5rem] xl:text-[4rem] font-extrabold leading-[1.15] sm:leading-[1.08] tracking-tight text-neutral-900 mb-3 sm:mb-5 lg:mb-6">
              <span className="hero-line">
                <span style={{ animationDelay: '80ms' }}>Ελληνικά προϊόντα,</span>
              </span>
              <span className="hero-line text-primary">
                <span style={{ animationDelay: '180ms' }}>απευθείας από τον παραγωγό.</span>
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className="hero-fade text-[13px] sm:text-lg lg:text-xl text-neutral-600 leading-relaxed mb-5 sm:mb-8 lg:mb-10 max-w-md mx-auto lg:mx-0"
              style={{ animationDelay: '320ms' }}
            >
              Αυθεντικά ελληνικά προϊόντα από μικρούς παραγωγούς που αγαπούν αυτό που κάνουν.
            </p>

            {/* CTA */}
            <Link
              href="/products"
              className="hero-fade group inline-flex items-center justify-center gap-2 sm:gap-2.5 bg-primary hover:bg-primary-light text-white font-semibold px-6 py-3 sm:px-8 sm:py-4 rounded-full shadow-md hover:shadow-lg transition-all duration-300 active:scale-[0.97] touch-manipulation text-sm sm:text-[15px]"
              style={{ animationDelay: '420ms' }}
            >
              Ανακαλύψτε τα προϊόντα
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

          </div>

          {/* Right — Image */}
          <div className="w-full lg:flex-1">
            <div className="relative aspect-[4/3] sm:aspect-[3/2] rounded-2xl lg:rounded-3xl overflow-hidden shadow-md lg:shadow-lg">
              <Image
                src="/images/hero-products.jpg"
                alt="Ελληνικό ελαιόλαδο και μέλι — αυθεντικά προϊόντα από τοπικούς παραγωγούς"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                quality={85}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
