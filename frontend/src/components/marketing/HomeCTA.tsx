import Link from 'next/link';
import { ArrowRight, Store } from 'lucide-react';

/**
 * HomeCTA — Warm, earthy closing section
 *
 * Human-centric minimal: cream/primary-pale background, dark text.
 * Friendly, inviting, NOT luxury/editorial.
 * Two pill CTAs: primary green + outlined secondary.
 */
export default function HomeCTA() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-24 bg-primary-pale overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 text-center">
        {/* Heading — warm, bold, approachable */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 leading-[1.15] tracking-tight mb-4 sm:mb-5">
          Δοκιμάστε τη γεύση.
        </h2>
        <p className="text-base sm:text-lg text-neutral-600 max-w-xl mx-auto mb-10 sm:mb-12 leading-relaxed">
          Ελαιόλαδο, μέλι, βότανα — απευθείας από Έλληνες παραγωγούς
          που αγαπούν αυτό που κάνουν.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/products"
            className="group inline-flex items-center gap-2.5 px-8 py-4 bg-primary hover:bg-primary-light text-white font-semibold text-base rounded-full shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.97] touch-manipulation"
          >
            Εξερευνήστε Προϊόντα
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/producer/onboarding"
            className="group inline-flex items-center gap-2.5 px-8 py-4 bg-white text-neutral-800 font-semibold text-base rounded-full border border-neutral-300 hover:border-primary/40 hover:text-primary transition-all duration-200 active:scale-[0.97] touch-manipulation"
          >
            <Store className="w-4 h-4" />
            Γίνετε Παραγωγός
          </Link>
        </div>
      </div>
    </section>
  );
}
