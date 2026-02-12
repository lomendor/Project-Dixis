import Link from 'next/link';

/**
 * CTA Section - Final call-to-action before footer
 *
 * Features:
 * - Simple, focused message
 * - Brand color background (primary-pale)
 * - Generous mobile padding
 * - Touch-friendly CTA buttons
 */
export default function CTA() {
  return (
    <section className="bg-primary-pale py-12 sm:py-16 lg:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Heading - mobile-optimized */}
        <h2 className="text-3xl font-bold text-neutral-900 mb-4 sm:text-4xl lg:text-5xl">
          Ξεκινήστε τις αγορές σας σήμερα
        </h2>

        {/* Subheading */}
        <p className="text-lg text-neutral-600 leading-relaxed mb-8 sm:text-xl sm:mb-10 max-w-2xl mx-auto">
          Ανακαλύψτε φρέσκα, βιολογικά προϊόντα από τοπικούς Έλληνες παραγωγούς.
          Υποστηρίξτε την τοπική οικονομία και απολαύστε την πραγματική γεύση της φύσης.
        </p>

        {/* CTA Buttons - mobile-first stacking */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center">
          <Link
            href="/products"
            className="inline-flex items-center justify-center min-h-[48px] px-8 py-3 bg-primary hover:bg-primary-light text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98] touch-manipulation"
          >
            Δείτε τα Προϊόντα
          </Link>
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center min-h-[48px] px-8 py-3 bg-white hover:bg-neutral-50 text-primary font-semibold rounded-lg border-2 border-primary transition-all duration-200 active:scale-[0.98] touch-manipulation"
          >
            Δημιουργία Λογαριασμού
          </Link>
        </div>

        {/* Trust indicator - subtle */}
        <div className="mt-10 pt-8 border-t border-primary/20">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-neutral-600">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-accent-gold" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-medium">Δωρεάν παράδοση άνω των 30€</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-accent-gold" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-medium">Ασφαλής αντικαταβολή & κάρτα</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
