import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Check } from 'lucide-react';

/**
 * Hero Section — Premium editorial homepage hero with photography
 *
 * Design inspired by Graza, Brightland, Aesop:
 * - Serif display font (Noto Serif Display) for H1
 * - Large editorial photograph on desktop (right column)
 * - Retro offset-shadow CTA button
 * - Warm olive-green palette with generous whitespace
 * - Trust micro-strip below CTA
 */
export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#faf8f3] via-[#f7f3eb] to-[#edf6f0]/40">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[88vh] lg:min-h-[92vh] py-20 sm:py-24 lg:py-0">

          {/* ── Text column ── */}
          <div className="animate-fade-in-up">
            {/* Eyebrow badge — gold accent */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#c9a227]/10 border border-[#c9a227]/20 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c9a227]" />
              <span className="text-xs font-semibold tracking-widest text-[#c9a227] uppercase">
                Αγορά Τοπικών Παραγωγών
              </span>
            </div>

            {/* H1 — Serif display, massive, editorial */}
            <h1 className="font-display text-[2.75rem] sm:text-[3.5rem] lg:text-[4.5rem] xl:text-[5.5rem] font-normal leading-[0.95] tracking-[-0.02em] text-neutral-900 mb-8">
              Από τον παραγωγό,
              <br />
              <span className="text-primary italic">στο τραπέζι σας.</span>
            </h1>

            {/* Subtitle — warm, relaxed */}
            <p className="text-lg sm:text-xl text-neutral-600 leading-relaxed max-w-lg mb-12">
              Αυθεντικά ελληνικά προϊόντα απευθείας από τοπικούς παραγωγούς.
              Ελαιόλαδο, μέλι, βότανα, γλυκά κι ακόμη πολλά.
            </p>

            {/* CTA row — retro shadow button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-12">
              <Link
                href="/products"
                className="btn-hero group inline-flex items-center gap-2.5 bg-primary text-white touch-manipulation"
              >
                Εξερευνήστε Προϊόντα
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
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
                  <Check className="w-3.5 h-3.5 text-primary/60" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* ── Visual column — editorial product photography ── */}
          <div className="hidden lg:block relative">
            <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/images/hero-products.jpg"
                alt="Ελληνικά artisan προϊόντα — ελαιόλαδο, μέλι, βότανα, αμύγδαλα"
                fill
                className="object-cover"
                priority
                sizes="(min-width: 1024px) 50vw, 0vw"
              />
              {/* Subtle warm overlay to blend with page palette */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#faf8f3]/20 via-transparent to-transparent" />
            </div>

            {/* Floating trust card — overlaps the image */}
            <div className="absolute -bottom-4 -left-6 animate-fade-in-up bg-white rounded-2xl shadow-xl px-6 py-4 flex items-center gap-3 border border-[#c9a227]/15" style={{ animationDelay: '0.4s' }}>
              <span className="w-10 h-10 rounded-full bg-[#c9a227]/10 flex items-center justify-center text-lg">✦</span>
              <div>
                <p className="text-sm font-semibold text-neutral-800">88% στον Παραγωγό</p>
                <p className="text-xs text-neutral-500">Δίκαιο Εμπόριο</p>
              </div>
            </div>
          </div>

          {/* Mobile hero image — full-width, shorter */}
          <div className="block lg:hidden -mx-5 sm:-mx-8">
            <div className="relative w-full aspect-[16/9] overflow-hidden">
              <Image
                src="/images/hero-products.jpg"
                alt="Ελληνικά artisan προϊόντα — ελαιόλαδο, μέλι, βότανα, αμύγδαλα"
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#faf8f3]/40 via-transparent to-transparent" />
            </div>
          </div>

        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  );
}
