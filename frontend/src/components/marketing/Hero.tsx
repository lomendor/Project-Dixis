import Link from 'next/link';

/**
 * Hero Section - Mobile-first homepage hero
 *
 * Features:
 * - Large, readable typography on mobile
 * - Generous whitespace and padding
 * - Dixis brand colors (Cyprus Green)
 * - Clear CTA with touch-friendly button
 */
export default function Hero() {
  return (
    <section className="bg-gradient-to-b from-primary-pale to-white">
      {/* Mobile-first container with generous padding */}
      <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <div className="max-w-3xl mx-auto text-center">
          {/* Heading - optimized for mobile readability */}
          <h1 className="text-4xl font-bold text-neutral-900 leading-tight mb-6 sm:text-5xl lg:text-6xl">
            Φρέσκα τοπικά προϊόντα
            <span className="block text-primary mt-2">
              από Έλληνες παραγωγούς
            </span>
          </h1>

          {/* Subheading - generous mobile spacing */}
          <p className="text-lg text-neutral-600 leading-relaxed mb-8 sm:text-xl sm:mb-10">
            Ανακαλύψτε ποιοτικά βιολογικά λαχανικά, φρέσκα φρούτα και χειροποίητα προϊόντα
            απευθείας από τοπικούς παραγωγούς.
          </p>

          {/* CTA Button - touch-friendly, minimum 44px height */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center min-h-[48px] px-8 py-3 bg-primary hover:bg-primary-light text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98] touch-manipulation"
            >
              Δείτε τα Προϊόντα
            </Link>
            <Link
              href="/producers"
              className="inline-flex items-center justify-center min-h-[48px] px-8 py-3 bg-white hover:bg-neutral-50 text-primary font-semibold rounded-lg border-2 border-primary transition-all duration-200 active:scale-[0.98] touch-manipulation"
            >
              Γίνε Παραγωγός
            </Link>
          </div>

          {/* Trust indicator - subtle, mobile-optimized */}
          <div className="mt-10 pt-8 border-t border-neutral-200">
            <div className="flex justify-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm text-neutral-600 font-medium">Φρεσκάδα εγγυημένη</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm text-neutral-600 font-medium">Παράδοση 24-48h</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
