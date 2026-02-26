'use client';
import Link from 'next/link';
import Logo from '@/components/brand/Logo';
import { useLocale, useTranslations } from '@/contexts/LocaleContext';
import { locales, type Locale } from '../../../i18n';

/**
 * Footer — Premium editorial footer
 *
 * Design: warm near-black background, serif brand accent,
 * clean 4-column grid. Matches premium homepage redesign.
 */
export default function Footer() {
  const { locale, setLocale } = useLocale();
  const t = useTranslations();

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
  };
  return (
    <footer className="bg-[#1b2a1e] text-white/80 mt-auto">
      {/* Main footer content */}
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 sm:gap-12">

          {/* Brand column — wider, with serif tagline */}
          <div className="md:col-span-4">
            <Logo height={32} title="Dixis" showWordmark className="[&_span]:!text-white [&_img]:brightness-0 [&_img]:invert" />
            <p className="mt-5 text-sm leading-relaxed text-white/50 max-w-xs">
              Αυθεντικά ελληνικά προϊόντα, απευθείας από τοπικούς παραγωγούς στο τραπέζι σας.
            </p>
            {/* Mini trust line */}
            <p className="mt-6 text-xs text-white/30 tracking-wide uppercase">
              88% στον Παραγωγό &middot; Δίκαιο Εμπόριο
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 md:col-start-6">
            <h4 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-5">Πλοήγηση</h4>
            <nav className="flex flex-col gap-0.5" data-testid="footer-quick-links">
              <Link href="/products" className="py-2 text-sm text-white/60 hover:text-white transition-colors touch-manipulation">
                Προϊόντα
              </Link>
              <Link href="/producers" className="py-2 text-sm text-white/60 hover:text-white transition-colors touch-manipulation">
                Παραγωγοί
              </Link>
              <Link href="/about" className="py-2 text-sm text-white/60 hover:text-white transition-colors touch-manipulation">
                Σχετικά με εμάς
              </Link>
            </nav>
          </div>

          {/* For Producers */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-5">Για Παραγωγούς</h4>
            <nav className="flex flex-col gap-0.5">
              <Link href="/producers" className="py-2 text-sm text-white/60 hover:text-white transition-colors touch-manipulation">
                Γίνε Παραγωγός
              </Link>
              <Link href="/producers/login" className="py-2 text-sm text-white/60 hover:text-white transition-colors touch-manipulation">
                Σύνδεση Παραγωγού
              </Link>
            </nav>
          </div>

          {/* Legal & Support */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-5">Υποστήριξη</h4>
            <nav className="flex flex-col gap-0.5">
              <Link href="/faq" className="py-2 text-sm text-white/60 hover:text-white transition-colors touch-manipulation">
                Συχνές Ερωτήσεις
              </Link>
              <Link href="/contact" className="py-2 text-sm text-white/60 hover:text-white transition-colors touch-manipulation">
                Επικοινωνία
              </Link>
              <Link href="/terms" className="py-2 text-sm text-white/60 hover:text-white transition-colors touch-manipulation">
                Όροι Χρήσης
              </Link>
              <Link href="/privacy" className="py-2 text-sm text-white/60 hover:text-white transition-colors touch-manipulation">
                Απόρρητο
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom Bar — thin divider, refined */}
        <div className="mt-14 sm:mt-16 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} Dixis. Με αγάπη για τους τοπικούς παραγωγούς.
          </p>
          <div className="flex items-center gap-5">
            {/* Language Switcher — pill style */}
            <div className="flex items-center gap-1 bg-white/5 rounded-full p-0.5" data-testid="footer-language-switcher">
              {locales.map((loc) => (
                <button
                  key={loc}
                  onClick={() => handleLocaleChange(loc)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                    locale === loc
                      ? 'bg-white/15 text-white'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                  data-testid={`footer-lang-${loc}`}
                  aria-label={t(`language.${loc}`)}
                >
                  {loc.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
