import Image from 'next/image';
import Link from 'next/link';
/* 3D trust icons from /icons/trust/ */

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
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 pt-8 sm:pt-10 lg:pt-12 pb-8 sm:pb-10 lg:pb-12">

          {/* Left — Text content */}
          <div className="flex-1 max-w-xl lg:max-w-none animate-fade-in-up">
            {/* Eyebrow */}
            <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs uppercase tracking-[0.15em] text-primary font-semibold bg-primary-pale px-4 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-primary rounded-full" />
              {'\u0391\u03c0\u03cc \u03c4\u03bf\u03bd \u03c0\u03b1\u03c1\u03b1\u03b3\u03c9\u03b3\u03cc \u03c3\u03c4\u03bf \u03c4\u03c1\u03b1\u03c0\u03ad\u03b6\u03b9 \u03c3\u03bf\u03c5'}
            </span>

            {/* Headline — clean sans-serif, brand colors */}
            <h1 className="text-[2.25rem] sm:text-[3rem] lg:text-[3.5rem] xl:text-[4rem] font-extrabold leading-[1.08] tracking-tight text-neutral-900 mb-5 lg:mb-6">
              {'\u0395\u03bb\u03bb\u03b7\u03bd\u03b9\u03ba\u03ac \u03c0\u03c1\u03bf\u03ca\u03cc\u03bd\u03c4\u03b1,'}
              <br />
              <span className="text-primary">{'\u03b1\u03c0\u03b5\u03c5\u03b8\u03b5\u03af\u03b1\u03c2 \u03b1\u03c0\u03cc \u03c4\u03bf\u03bd \u03c0\u03b1\u03c1\u03b1\u03b3\u03c9\u03b3\u03cc.'}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg lg:text-xl text-neutral-600 leading-relaxed mb-8 lg:mb-10 max-w-md">
              {'\u0391\u03c5\u03b8\u03b5\u03bd\u03c4\u03b9\u03ba\u03ac \u03b5\u03bb\u03bb\u03b7\u03bd\u03b9\u03ba\u03ac \u03c0\u03c1\u03bf\u03ca\u03cc\u03bd\u03c4\u03b1 \u03b1\u03c0\u03cc \u03bc\u03b9\u03ba\u03c1\u03bf\u03cd\u03c2 \u03c0\u03b1\u03c1\u03b1\u03b3\u03c9\u03b3\u03bf\u03cd\u03c2'}
              {' '}
              {'\u03c0\u03bf\u03c5 \u03b1\u03b3\u03b1\u03c0\u03bf\u03cd\u03bd \u03b1\u03c5\u03c4\u03cc \u03c0\u03bf\u03c5 \u03ba\u03ac\u03bd\u03bf\u03c5\u03bd.'}
            </p>

            {/* CTA */}
            <Link
              href="/products"
              className="group inline-flex items-center justify-center gap-2.5 bg-primary hover:bg-primary-light text-white font-semibold px-8 py-4 rounded-full shadow-md hover:shadow-lg transition-all duration-300 active:scale-[0.97] touch-manipulation text-[15px]"
            >
              {'\u0391\u03bd\u03b1\u03ba\u03b1\u03bb\u03cd\u03c8\u03c4\u03b5 \u03c4\u03b1 \u03c0\u03c1\u03bf\u03ca\u03cc\u03bd\u03c4\u03b1'}
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            {/* Trust badges — 3D icons, sized to show detail */}
            <div className="mt-10 flex flex-wrap items-center gap-5 sm:gap-6">
              <div className="flex items-center gap-3">
                <Image src="/icons/trust/medal-3d.png" alt="" width={40} height={40} className="w-9 h-9 sm:w-10 sm:h-10 object-contain drop-shadow-sm" />
                <span className="text-[13px] sm:text-sm text-neutral-700 font-semibold">
                  {'\u0395\u03c0\u03b9\u03bb\u03b5\u03b3\u03bc\u03ad\u03bd\u03bf\u03b9 \u03c0\u03b1\u03c1\u03b1\u03b3\u03c9\u03b3\u03bf\u03af'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Image src="/icons/trust/delivery-3d.png" alt="" width={40} height={40} className="w-9 h-9 sm:w-10 sm:h-10 object-contain drop-shadow-sm" />
                <span className="text-[13px] sm:text-sm text-neutral-700 font-semibold">
                  {'\u0386\u03bc\u03b5\u03c3\u03b7 \u03b1\u03c0\u03bf\u03c3\u03c4\u03bf\u03bb\u03ae'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Image src="/icons/trust/shield-lock-3d.png" alt="" width={40} height={40} className="w-9 h-9 sm:w-10 sm:h-10 object-contain drop-shadow-sm" />
                <span className="text-[13px] sm:text-sm text-neutral-700 font-semibold">
                  {'\u0391\u03c3\u03c6\u03b1\u03bb\u03b5\u03af\u03c2 \u03c3\u03c5\u03bd\u03b1\u03bb\u03bb\u03b1\u03b3\u03ad\u03c2'}
                </span>
              </div>
            </div>
          </div>

          {/* Right — Image (desktop only) */}
          <div className="hidden lg:block flex-1">
            <div className="relative aspect-[3/2] rounded-3xl overflow-hidden shadow-lg">
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
