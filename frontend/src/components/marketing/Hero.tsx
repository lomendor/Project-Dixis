import Image from 'next/image';
import Link from 'next/link';

/**
 * Hero Section — Light, Warm, Joyful
 *
 * Design: Bright cream/white background, split layout.
 * Text on the left, beautiful image on the right.
 * Brand colors: primary green + cream/beige accents.
 * NO dark overlays, NO full-bleed dark images.
 *
 * Mobile: stacked (text on top, image below)
 * Desktop: side-by-side 55/45 split
 */
export default function Hero() {
  return (
    <section className="relative bg-accent-cream overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row items-center gap-5 sm:gap-8 lg:gap-12 pt-6 sm:pt-10 lg:pt-12 pb-6 sm:pb-10 lg:pb-12">

          {/* Left — Text content */}
          <div className="flex-1 max-w-xl lg:max-w-none animate-fade-in-up text-center lg:text-left">
            {/* Eyebrow — hidden on mobile for compactness */}
            <span className="hidden sm:inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-primary font-semibold bg-primary-pale px-4 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-primary rounded-full" />
              {'\u0391\u03c0\u03cc \u03c4\u03bf\u03bd \u03c0\u03b1\u03c1\u03b1\u03b3\u03c9\u03b3\u03cc \u03c3\u03c4\u03bf \u03c4\u03c1\u03b1\u03c0\u03ad\u03b6\u03b9 \u03c3\u03bf\u03c5'}
            </span>

            {/* Headline */}
            <h1 className="text-[1.625rem] sm:text-[3rem] lg:text-[3.5rem] xl:text-[4rem] font-extrabold leading-[1.15] sm:leading-[1.08] tracking-tight text-neutral-900 mb-3 sm:mb-5 lg:mb-6">
              {'\u0395\u03bb\u03bb\u03b7\u03bd\u03b9\u03ba\u03ac \u03c0\u03c1\u03bf\u03ca\u03cc\u03bd\u03c4\u03b1,'}
              <br />
              <span className="text-primary">{'\u03b1\u03c0\u03b5\u03c5\u03b8\u03b5\u03af\u03b1\u03c2 \u03b1\u03c0\u03cc \u03c4\u03bf\u03bd \u03c0\u03b1\u03c1\u03b1\u03b3\u03c9\u03b3\u03cc.'}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-[13px] sm:text-lg lg:text-xl text-neutral-600 leading-relaxed mb-5 sm:mb-8 lg:mb-10 max-w-md mx-auto lg:mx-0">
              {'\u0391\u03c5\u03b8\u03b5\u03bd\u03c4\u03b9\u03ba\u03ac \u03b5\u03bb\u03bb\u03b7\u03bd\u03b9\u03ba\u03ac \u03c0\u03c1\u03bf\u03ca\u03cc\u03bd\u03c4\u03b1 \u03b1\u03c0\u03cc \u03bc\u03b9\u03ba\u03c1\u03bf\u03cd\u03c2 \u03c0\u03b1\u03c1\u03b1\u03b3\u03c9\u03b3\u03bf\u03cd\u03c2'}
              {' '}
              {'\u03c0\u03bf\u03c5 \u03b1\u03b3\u03b1\u03c0\u03bf\u03cd\u03bd \u03b1\u03c5\u03c4\u03cc \u03c0\u03bf\u03c5 \u03ba\u03ac\u03bd\u03bf\u03c5\u03bd.'}
            </p>

            {/* CTA */}
            <Link
              href="/products"
              className="group inline-flex items-center justify-center gap-2 sm:gap-2.5 bg-primary hover:bg-primary-light text-white font-semibold px-6 py-3 sm:px-8 sm:py-4 rounded-full shadow-md hover:shadow-lg transition-all duration-300 active:scale-[0.97] touch-manipulation text-sm sm:text-[15px]"
            >
              {'\u0391\u03bd\u03b1\u03ba\u03b1\u03bb\u03cd\u03c8\u03c4\u03b5 \u03c4\u03b1 \u03c0\u03c1\u03bf\u03ca\u03cc\u03bd\u03c4\u03b1'}
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
