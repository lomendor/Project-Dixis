import Link from 'next/link';
import { ArrowRight, Leaf, Truck, ShieldCheck } from 'lucide-react';

/**
 * Hero Section — Premium warm banner with Mediterranean feel
 *
 * Design decisions:
 * - Warm cream-to-pale-green gradient (not flat white)
 * - Split layout on desktop: text 55% / decorative visual 45%
 * - Display serif font on accent text (Noto Serif Display)
 * - Pill-shaped CTA (not boxy) — premium feel
 * - Trust stats below CTA — social proof
 * - Decorative SVG olive branch on right side (desktop only)
 * - CSS fade-in animation (respects prefers-reduced-motion)
 */
export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#faf8f3] via-[#f5f0e6] to-[#edf6f0]">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #2d6a4f 1px, transparent 0)`,
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-12 py-12 sm:py-16 lg:py-20">

          {/* Text content — left side */}
          <div className="flex-1 max-w-2xl animate-fade-in-up">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/8 border border-primary/12 mb-6">
              <Leaf className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary tracking-wide uppercase">
                Ελληνική Αγορά Παραγωγών
              </span>
            </div>

            {/* Headline — display serif for the accent part */}
            <h1 className="text-[1.75rem] sm:text-4xl lg:text-[2.75rem] xl:text-5xl font-bold leading-[1.12] tracking-tight text-neutral-900 mb-5">
              Αυθεντικά ελληνικά{' '}
              <br className="hidden sm:block" />
              προϊόντα,{' '}
              <span className="text-primary font-display italic">
                απευθείας από{' '}
                <br className="hidden lg:block" />
                παραγωγούς.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-neutral-500 leading-relaxed mb-8 max-w-lg">
              Ελαιόλαδο, μέλι, βότανα, όσπρια και πολλά ακόμα — από τον
              παραγωγό στην πόρτα σας. Χωρίς μεσάζοντες.
            </p>

            {/* CTA row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-10">
              <Link
                href="/products"
                className="group inline-flex items-center justify-center gap-2.5 bg-primary hover:bg-primary-light text-white font-semibold px-7 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.97] touch-manipulation text-[15px]"
              >
                Εξερευνήστε Προϊόντα
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/producers"
                className="inline-flex items-center justify-center gap-2 text-primary hover:text-primary-light font-medium text-[15px] transition-colors touch-manipulation"
              >
                Γνωρίστε τους Παραγωγούς
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Trust micro-stats */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-neutral-500">
                <div className="w-8 h-8 rounded-full bg-primary/8 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <span className="font-semibold text-neutral-700">Ασφαλείς</span>
                  <span className="text-neutral-400 ml-1">πληρωμές</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-neutral-500">
                <div className="w-8 h-8 rounded-full bg-primary/8 flex items-center justify-center flex-shrink-0">
                  <Truck className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <span className="font-semibold text-neutral-700">Παράδοση</span>
                  <span className="text-neutral-400 ml-1">24-48h</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-neutral-500">
                <div className="w-8 h-8 rounded-full bg-primary/8 flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <span className="font-semibold text-neutral-700">100%</span>
                  <span className="text-neutral-400 ml-1">Ελληνικά</span>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative right side — desktop only */}
          <div className="hidden lg:flex flex-1 items-center justify-center" aria-hidden="true">
            <div className="relative w-full max-w-md aspect-square">
              {/* Organic blob shape */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/6 to-primary/12 blur-3xl scale-110" />
              {/* Inner circle with pattern */}
              <div className="relative w-full h-full rounded-[40%_60%_70%_30%/40%_50%_60%_50%] bg-gradient-to-br from-primary/5 via-accent-cream to-primary-pale/50 border border-primary/8 flex items-center justify-center overflow-hidden">
                {/* Decorative olive leaves SVG */}
                <svg viewBox="0 0 200 200" className="w-3/4 h-3/4 text-primary/20" fill="currentColor">
                  {/* Olive branch */}
                  <path d="M100 180 C100 180 80 140 60 120 C40 100 20 90 20 70 C20 50 40 40 60 50 C80 60 90 80 100 100 C110 80 120 60 140 50 C160 40 180 50 180 70 C180 90 160 100 140 120 C120 140 100 180 100 180Z" opacity="0.3" />
                  {/* Olives */}
                  <circle cx="55" cy="80" r="8" opacity="0.4" />
                  <circle cx="145" cy="80" r="8" opacity="0.4" />
                  <circle cx="75" cy="110" r="6" opacity="0.3" />
                  <circle cx="125" cy="110" r="6" opacity="0.3" />
                  {/* Central leaf */}
                  <path d="M90 60 Q100 20 110 60 Q100 80 90 60Z" opacity="0.25" />
                </svg>
              </div>
              {/* Floating accent dots */}
              <div className="absolute top-6 right-10 w-3 h-3 rounded-full bg-accent-gold/30" />
              <div className="absolute bottom-12 left-4 w-2 h-2 rounded-full bg-primary/20" />
              <div className="absolute top-1/3 -right-2 w-4 h-4 rounded-full bg-primary-pale border border-primary/10" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade into white */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
