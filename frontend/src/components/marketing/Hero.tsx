import Link from 'next/link';
import { Leaf, ArrowRight, Check } from 'lucide-react';

/**
 * Hero Section — Premium homepage hero for Dixis marketplace
 *
 * Design: Split layout (text 60% / visual 40%) on desktop, stacked on mobile.
 * Warm gradient, generous whitespace, pill-shaped CTA, trust micro-strip.
 * LCP-safe: H1 is plain text, no JS dependency.
 */
export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-accent-cream via-[#f7f3eb] to-primary-pale/40">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.7fr] gap-8 lg:gap-16 items-center min-h-[85vh] lg:min-h-[90vh] py-16 sm:py-20 lg:py-0">

          {/* ── Text column ── */}
          <div className="animate-fade-in-up">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-pale/60 border border-primary/10 mb-6">
              <Leaf className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold tracking-wide text-primary uppercase">
                Αγορά Τοπικών Παραγωγών
              </span>
            </div>

            {/* H1 — LCP element */}
            <h1 className="text-[2.5rem] sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-bold leading-[1.1] tracking-tight text-neutral-900 mb-6">
              Από τον παραγωγό,
              <br />
              <span className="text-primary">στο τραπέζι σας.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-neutral-600 leading-relaxed max-w-lg mb-10">
              Αυθεντικά ελληνικά προϊόντα απευθείας από τοπικούς παραγωγούς.
              Ελαιόλαδο, μέλι, βότανα, γλυκά και πολλά ακόμη &mdash; στην πόρτα σας.
            </p>

            {/* CTA row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10">
              <Link
                href="/products"
                className="group inline-flex items-center gap-2.5 px-8 py-4 bg-primary hover:bg-primary-light text-white font-semibold text-base rounded-full shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.97] touch-manipulation"
              >
                Εξερευνήστε Προϊόντα
                <ArrowRight className="w-4.5 h-4.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/producers"
                className="text-sm font-medium text-neutral-500 hover:text-primary transition-colors duration-200"
              >
                ή γνωρίστε τους παραγωγούς μας &rarr;
              </Link>
            </div>

            {/* Trust micro-strip */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-neutral-500">
              {[
                'Ασφαλείς πληρωμές',
                'Παράδοση 24-48h',
                '100% Ελληνικά',
              ].map((label) => (
                <span key={label} className="inline-flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-primary/70" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* ── Visual column (desktop only) ── */}
          <div className="hidden lg:flex flex-col items-center justify-center relative" aria-hidden="true">
            {/* Decorative floating cards */}
            <div className="relative w-full max-w-[340px] aspect-square">
              {/* Background glow */}
              <div className="absolute inset-0 rounded-full bg-primary-pale/40 blur-3xl scale-125" />

              {/* Floating category cards — scattered organically */}
              {[
                { emoji: '\uD83C\uDF6F', label: 'Μέλι', top: '6%', left: '12%', delay: '0s' },
                { emoji: '\uD83E\uDED2', label: 'Ελαιόλαδο', top: '18%', right: '2%', delay: '0.15s' },
                { emoji: '\uD83C\uDF3F', label: 'Βότανα', bottom: '28%', left: '0%', delay: '0.3s' },
                { emoji: '\uD83E\uDD5C', label: 'Ξηροί καρποί', bottom: '6%', right: '14%', delay: '0.45s' },
              ].map(({ emoji, label, delay, ...pos }) => (
                <div
                  key={label}
                  className="absolute animate-fade-in-up bg-white/90 backdrop-blur-sm rounded-2xl shadow-card px-5 py-4 flex items-center gap-3 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
                  style={{ ...pos, animationDelay: delay }}
                >
                  <span className="text-3xl" role="img" aria-hidden="true">{emoji}</span>
                  <span className="text-sm font-semibold text-neutral-800">{label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom gradient fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  );
}
