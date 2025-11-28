import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Hero() {
  return (
    <section className="relative overflow-hidden -mx-4 -mt-8">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-pale via-accent-cream to-accent-beige" />

      {/* Decorative elements - hidden on mobile for cleaner look */}
      <div className="hidden sm:block absolute top-20 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="hidden sm:block absolute bottom-10 left-10 w-48 h-48 bg-accent-gold/10 rounded-full blur-2xl" />

      {/* Mobile-first: generous padding, centered content */}
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16 md:py-24 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium text-primary mb-4 sm:mb-6 shadow-sm">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-success rounded-full animate-pulse" />
          Φρέσκα προϊόντα κάθε μέρα
        </div>

        {/* Main heading - Mobile-first typography */}
        <h1 className="text-[1.75rem] leading-tight sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 max-w-4xl mx-auto">
          Τοπικά προϊόντα,
          <span className="text-primary"> απευθείας</span> από παραγωγούς
        </h1>

        {/* Subtitle - readable line length on mobile */}
        <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-neutral-600 max-w-xl sm:max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
          Υποστήριξε Έλληνες παραγωγούς και ανακάλυψε αυθεντικές γεύσεις με διαφάνεια στην παραγγελία και την παράδοση.
        </p>

        {/* CTA buttons - Mobile: stacked, full-width primary */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4 sm:px-0">
          <Link href="/products" className="w-full sm:w-auto">
            <Button size="lg" fullWidth className="sm:w-auto">
              Δες προϊόντα
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
          </Link>
          <Link href="/orders/lookup" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" fullWidth className="sm:w-auto">
              Παρακολούθηση παραγγελίας
            </Button>
          </Link>
        </div>

        {/* Trust indicators - Stack vertically on mobile */}
        <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 sm:gap-6 text-sm text-neutral-500">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs sm:text-sm">Δωρεάν παράδοση 50+</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs sm:text-sm">Ασφαλής πληρωμή</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs sm:text-sm">100% Τοπικά</span>
          </div>
        </div>
      </div>
    </section>
  );
}
