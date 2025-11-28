import Link from 'next/link';
import Logo from '@/components/brand/Logo';

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white mt-auto">
      {/* Mobile-first padding */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Logo height={24} title="Dixis" />
            <p className="mt-3 text-sm text-neutral-600">
              Σύνδεσε με τοπικούς παραγωγούς. Φρέσκα προϊόντα, απευθείας από το χωράφι στο τραπέζι σου.
            </p>
          </div>

          {/* Quick Links - touch-friendly spacing */}
          <div>
            <h4 className="font-semibold text-neutral-900 mb-3 sm:mb-4">Γρήγοροι Σύνδεσμοι</h4>
            <nav className="flex flex-col gap-1">
              <Link href="/products" className="py-2 text-sm text-neutral-600 hover:text-primary active:text-primary transition-colors touch-manipulation">
                Προϊόντα
              </Link>
              <Link href="/producers" className="py-2 text-sm text-neutral-600 hover:text-primary active:text-primary transition-colors touch-manipulation">
                Παραγωγοί
              </Link>
              <Link href="/orders/lookup" className="py-2 text-sm text-neutral-600 hover:text-primary active:text-primary transition-colors touch-manipulation">
                Παρακολούθηση Παραγγελίας
              </Link>
            </nav>
          </div>

          {/* For Producers - touch-friendly spacing */}
          <div>
            <h4 className="font-semibold text-neutral-900 mb-3 sm:mb-4">Για Παραγωγούς</h4>
            <nav className="flex flex-col gap-1">
              <Link href="/producers" className="py-2 text-sm text-neutral-600 hover:text-primary active:text-primary transition-colors touch-manipulation">
                Γίνε Παραγωγός
              </Link>
              <Link href="/producers/login" className="py-2 text-sm text-neutral-600 hover:text-primary active:text-primary transition-colors touch-manipulation">
                Σύνδεση Παραγωγού
              </Link>
            </nav>
          </div>

          {/* Legal - touch-friendly spacing */}
          <div>
            <h4 className="font-semibold text-neutral-900 mb-3 sm:mb-4">Νομικά</h4>
            <nav className="flex flex-col gap-1">
              <Link href="/legal/terms" className="py-2 text-sm text-neutral-600 hover:text-primary active:text-primary transition-colors touch-manipulation">
                Όροι Χρήσης
              </Link>
              <Link href="/legal/privacy" className="py-2 text-sm text-neutral-600 hover:text-primary active:text-primary transition-colors touch-manipulation">
                Πολιτική Απορρήτου
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom Bar - mobile-first spacing */}
        <div className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} Dixis. Με αγάπη για τους τοπικούς παραγωγούς.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-neutral-400">Made with Cyprus Green</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
