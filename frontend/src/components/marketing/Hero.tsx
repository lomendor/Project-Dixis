import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

/**
 * Hero Section — Premium editorial homepage hero
 *
 * Design inspired by Graza, Brightland, Aesop:
 * - Serif display font (Noto Serif Display) for H1
 * - Large editorial image on desktop (right column)
 * - Retro offset-shadow CTA button
 * - Warm olive-green palette with generous whitespace
 * - Trust micro-strip below CTA
 */
export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#faf8f3] via-[#f7f3eb] to-[#edf6f0]/40">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.65fr] gap-8 lg:gap-20 items-center min-h-[88vh] lg:min-h-[92vh] py-20 sm:py-24 lg:py-0">

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

          {/* ── Visual column — abstract premium composition (desktop) ── */}
          <div className="hidden lg:flex flex-col items-center justify-center relative" aria-hidden="true">
            <div className="relative w-full max-w-[380px] aspect-square">
              {/* Layered warm gradient blobs — abstract Mediterranean feel */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#edf6f0] to-[#d4e8da] blur-3xl scale-110 opacity-60" />
              <div className="absolute top-[10%] right-[5%] w-[55%] aspect-square rounded-full bg-gradient-to-br from-[#c9a227]/15 to-[#c9a227]/5 blur-2xl" />
              <div className="absolute bottom-[15%] left-[10%] w-[40%] aspect-square rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-2xl" />

              {/* Floating product cards — editorial composition */}
              <div className="absolute animate-fade-in-up bg-white rounded-2xl shadow-lg px-6 py-5 flex items-center gap-4" style={{ top: '8%', left: '5%', animationDelay: '0.1s' }}>
                <span className="w-11 h-11 rounded-full bg-[#e8f5dc] flex items-center justify-center text-xl">🫒</span>
                <div>
                  <p className="text-sm font-semibold text-neutral-800">Ελαιόλαδο</p>
                  <p className="text-xs text-neutral-400">Από τη Μεσσηνία</p>
                </div>
              </div>

              <div className="absolute animate-fade-in-up bg-white rounded-2xl shadow-lg px-6 py-5 flex items-center gap-4" style={{ top: '32%', right: '0%', animationDelay: '0.25s' }}>
                <span className="w-11 h-11 rounded-full bg-[#fef2c0] flex items-center justify-center text-xl">🍯</span>
                <div>
                  <p className="text-sm font-semibold text-neutral-800">Θυμαρίσιο Μέλι</p>
                  <p className="text-xs text-neutral-400">Από την Κρήτη</p>
                </div>
              </div>

              <div className="absolute animate-fade-in-up bg-white rounded-2xl shadow-lg px-6 py-5 flex items-center gap-4" style={{ bottom: '20%', left: '2%', animationDelay: '0.4s' }}>
                <span className="w-11 h-11 rounded-full bg-[#d4f0e2] flex items-center justify-center text-xl">🌿</span>
                <div>
                  <p className="text-sm font-semibold text-neutral-800">Βότανα</p>
                  <p className="text-xs text-neutral-400">Από τον Ταΰγετο</p>
                </div>
              </div>

              {/* Trust accent card at bottom */}
              <div className="absolute animate-fade-in-up bg-white rounded-2xl shadow-lg px-5 py-4 flex items-center gap-3 border border-[#c9a227]/15" style={{ bottom: '0%', right: '8%', animationDelay: '0.55s' }}>
                <span className="w-10 h-10 rounded-full bg-[#c9a227]/10 flex items-center justify-center text-lg">✦</span>
                <div>
                  <p className="text-sm font-semibold text-neutral-800">88% στον Παραγωγό</p>
                  <p className="text-xs text-neutral-500">Δίκαιο Εμπόριο</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  );
}
