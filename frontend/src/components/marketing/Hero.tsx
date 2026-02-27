import Image from 'next/image';
import Link from 'next/link';
import { Award, Truck, ShieldCheck } from 'lucide-react';

/**
 * Hero Section — Editorial Gastronomy / Full-Bleed Immersive
 *
 * Design direction: High-end food magazine feel.
 * NOT a SaaS template with boxes. Pure visceral culinary emotion.
 *
 * - Full-viewport background image (honey on artisan bread)
 * - Cinematic dark overlay gradient (stronger left for text legibility)
 * - Large serif headline in white/gold
 * - Warm gold CTA button
 * - Minimal line-art trust badges at bottom
 * - Negative margin pulls hero BEHIND the transparent header
 *
 * Ref: Graza, Food52, high-end gastronomy editorials
 */
export default function Hero() {
  return (
    <section className="relative -mt-[72px] min-h-[92vh] sm:min-h-[88vh] lg:min-h-[90vh] flex items-end overflow-hidden">
      {/* Background image — edge to edge */}
      <Image
        src="/images/hero-editorial.jpg"
        alt="Χρυσαφένιο μέλι σε χωριάτικο ψωμί"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
        quality={85}
      />

      {/* Cinematic overlay — darker left for text, lighter right to show food */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/25"
        aria-hidden="true"
      />
      {/* Extra bottom gradient for smooth transition to content below */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 pb-12 sm:pb-16 lg:pb-20">
        <div className="max-w-2xl animate-fade-in-up">
          {/* Headline — bold serif, white with gold accent */}
          <h1 className="font-display text-[2rem] sm:text-[2.75rem] lg:text-[3.5rem] xl:text-[4rem] font-bold leading-[1.08] tracking-tight text-white mb-5 lg:mb-6 drop-shadow-lg">
            <span className="text-[#f0d78c]">Η αληθινή Ελλάδα,</span>
            <br />
            <span className="text-white/95">στο τραπέζι σου.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg lg:text-xl text-white/75 leading-relaxed mb-8 lg:mb-10 max-w-lg drop-shadow">
            Απευθείας από τα χέρια μικροπαραγωγών.
            <br className="hidden sm:block" />
            Χωρίς μεσάζοντες. Μόνο η κορυφαία ποιότητα.
          </p>

          {/* CTA Button — warm gold */}
          <Link
            href="/products"
            className="group inline-flex items-center justify-center gap-2.5 bg-[#c9a227] hover:bg-[#b89220] text-white font-semibold px-8 py-4 rounded-sm shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.97] touch-manipulation text-base tracking-wide"
          >
            Ανακαλύψτε τις Γεύσεις
          </Link>
        </div>

        {/* Trust badges — minimalist line-art */}
        <div className="mt-12 sm:mt-16 flex flex-wrap items-center gap-8 sm:gap-12">
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-white/50 stroke-[1.5]" />
            <span className="text-[13px] text-white/60 tracking-wide">
              Επιλεγμένοι Παραγωγοί
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-white/50 stroke-[1.5]" />
            <span className="text-[13px] text-white/60 tracking-wide">
              Άμεση Αποστολή
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-white/50 stroke-[1.5]" />
            <span className="text-[13px] text-white/60 tracking-wide">
              Ασφαλείς Συναλλαγές
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
