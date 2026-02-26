import Link from 'next/link';
import { ArrowRight, Store } from 'lucide-react';

/**
 * HomeCTA — Dark contrast closing section for homepage
 *
 * The only dark section on the page — creates a visual anchor before the footer.
 * Two CTAs: browse products (primary audience) and become a producer (growth).
 */
export default function HomeCTA() {
  return (
    <section className="relative py-20 sm:py-24 lg:py-28 bg-primary overflow-hidden">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
          Ξεκινήστε σήμερα.
        </h2>
        <p className="text-base sm:text-lg text-white/70 max-w-xl mx-auto mb-10">
          Ανακαλύψτε αυθεντικά ελληνικά προϊόντα ή φέρτε τα δικά σας
          στην αγορά μας.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/products"
            className="group inline-flex items-center gap-2.5 px-8 py-4 bg-white text-primary font-semibold text-base rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97] touch-manipulation"
          >
            Εξερευνήστε Προϊόντα
            <ArrowRight className="w-4.5 h-4.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/producer/onboarding"
            className="group inline-flex items-center gap-2.5 px-8 py-4 bg-transparent text-white font-semibold text-base rounded-full border-2 border-white/30 hover:border-white/60 hover:bg-white/10 transition-all duration-200 active:scale-[0.97] touch-manipulation"
          >
            <Store className="w-4.5 h-4.5" />
            Γίνετε Παραγωγός
          </Link>
        </div>
      </div>
    </section>
  );
}
