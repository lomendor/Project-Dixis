import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

/**
 * Hero Section — Medium commerce banner
 *
 * Not too big (no full-screen), not too small (not just text).
 * Subtle warm background to separate from content below.
 */
export default function Hero() {
  return (
    <section className="bg-neutral-50 border-b border-neutral-100">
      <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 py-10 sm:py-14 lg:py-16">
        <div className="max-w-3xl">
          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-[1.15] tracking-tight text-neutral-900 mb-4">
            Αυθεντικά ελληνικά προϊόντα,{' '}
            <span className="text-primary">απευθείας από παραγωγούς.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-neutral-500 leading-relaxed mb-8 max-w-xl">
            Ελαιόλαδο, μέλι, βότανα, όσπρια και πολλά ακόμα — από τον παραγωγό στην πόρτα σας.
          </p>

          {/* CTA + trust */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 active:scale-[0.97] touch-manipulation text-sm"
            >
              Εξερευνήστε Προϊόντα
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-neutral-400">
              {[
                'Ασφαλείς πληρωμές',
                'Παράδοση 24-48h',
                '100% Ελληνικά',
              ].map((label) => (
                <span key={label} className="inline-flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-primary" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
