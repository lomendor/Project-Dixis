import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CTA() {
  return (
    <section className="py-10 sm:py-16">
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primary to-primary-light p-6 sm:p-8 md:p-12 text-center">
        {/* Decorative elements - hidden on mobile */}
        <div className="hidden sm:block absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="hidden sm:block absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3">
            Είσαι παραγωγός;
          </h2>
          <p className="text-sm sm:text-base text-white/90 max-w-md sm:max-w-xl mx-auto mb-6 sm:mb-8 leading-relaxed">
            Κάνε τα προϊόντα σου διαθέσιμα σε καταναλωτές σε όλη την Ελλάδα.
            Διαχειρίσου τις παραγγελίες σου εύκολα και γρήγορα.
          </p>
          {/* Mobile: full-width button */}
          <Link href="/producers" className="block sm:inline-block">
            <Button
              size="lg"
              fullWidth
              className="sm:w-auto bg-white text-primary hover:bg-neutral-50 active:scale-[0.98]"
            >
              Γίνε συνεργάτης
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
