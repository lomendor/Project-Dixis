import Link from 'next/link';
import { ArrowRight, Store } from 'lucide-react';

/**
 * HomeCTA — Dark editorial closing section
 *
 * Near-black (#1b2a1e) background — NOT the primary green.
 * Large serif heading in white. Two pill CTAs.
 * Inspired by Aesop's dark sections: minimal, editorial, premium.
 */
export default function HomeCTA() {
  return (
    <section className="relative py-24 sm:py-28 lg:py-32 bg-[#1b2a1e] overflow-hidden">
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 opacity-[0.04]" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 text-center">
        {/* Serif heading — editorial, large */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-5">
          Δοκιμάστε τη γεύση.
        </h2>
        <p className="text-base sm:text-lg text-white/60 max-w-xl mx-auto mb-12">
          Ελαιόλαδο, μέλι, βότανα — απευθείας από Έλληνες παραγωγούς
          που αγαπούν αυτό που κάνουν.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/products"
            className="group inline-flex items-center gap-2.5 px-8 py-4 bg-white text-[#1b2a1e] font-semibold text-base rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97] touch-manipulation"
          >
            Εξερευνήστε Προϊόντα
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/producer/onboarding"
            className="group inline-flex items-center gap-2.5 px-8 py-4 bg-transparent text-white font-semibold text-base rounded-full border-2 border-white/20 hover:border-white/50 hover:bg-white/5 transition-all duration-200 active:scale-[0.97] touch-manipulation"
          >
            <Store className="w-4 h-4" />
            Γίνετε Παραγωγός
          </Link>
        </div>
      </div>
    </section>
  );
}
