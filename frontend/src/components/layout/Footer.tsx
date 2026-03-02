'use client';
import Link from 'next/link';
import Logo from '@/components/brand/Logo';
import { useLocale, useTranslations } from '@/contexts/LocaleContext';
import { locales, type Locale } from '../../../i18n';

/**
 * Footer — Clean, polished footer
 *
 * Design: dark background (#1b2a1e), proper 4-column grid on desktop,
 * brand column + 3 link columns. Clean bottom bar with copyright + language.
 */
export default function Footer() {
  const { locale, setLocale } = useLocale();
  const t = useTranslations();

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  return (
    <footer className="bg-[#1b2a1e] text-white/80 mt-auto">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-14 sm:py-16 lg:py-20">
        {/* Main grid — 4 columns on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">

          {/* Brand column */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-4">
            <Logo height={28} title="Dixis" showWordmark className="[&_span]:!text-white [&_img]:brightness-0 [&_img]:invert" />
            <p className="mt-4 text-sm leading-relaxed text-white/45 max-w-[280px]">
              Αυθεντικά ελληνικά προϊόντα, απευθείας από τοπικούς παραγωγούς στο τραπέζι σας.
            </p>
            <p className="mt-5 text-[11px] text-white/25 tracking-wide uppercase">
              Πάνω από 80% στον Παραγωγό &middot; Δίκαιο Εμπόριο
            </p>
          </div>

          {/* Navigation */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h4 className="text-[11px] font-semibold text-white/35 uppercase tracking-widest mb-4">
              Πλοήγηση
            </h4>
            <nav className="flex flex-col gap-0.5" data-testid="footer-quick-links">
              <Link href="/products" className="py-1.5 text-sm text-white/55 hover:text-white transition-colors touch-manipulation">
                Προϊόντα
              </Link>
              <Link href="/producers" className="py-1.5 text-sm text-white/55 hover:text-white transition-colors touch-manipulation">
                Παραγωγοί
              </Link>
              <Link href="/about" className="py-1.5 text-sm text-white/55 hover:text-white transition-colors touch-manipulation">
                Σχετικά με εμάς
              </Link>
            </nav>
          </div>

          {/* For Producers */}
          <div className="lg:col-span-2">
            <h4 className="text-[11px] font-semibold text-white/35 uppercase tracking-widest mb-4">
              Για Παραγωγούς
            </h4>
            <nav className="flex flex-col gap-0.5">
              <Link href="/producers" className="py-1.5 text-sm text-white/55 hover:text-white transition-colors touch-manipulation">
                Γίνε Παραγωγός
              </Link>
              <Link href="/producers/login" className="py-1.5 text-sm text-white/55 hover:text-white transition-colors touch-manipulation">
                Σύνδεση Παραγωγού
              </Link>
            </nav>
          </div>

          {/* Legal & Support */}
          <div className="lg:col-span-2">
            <h4 className="text-[11px] font-semibold text-white/35 uppercase tracking-widest mb-4">
              Υποστήριξη
            </h4>
            <nav className="flex flex-col gap-0.5">
              <Link href="/faq" className="py-1.5 text-sm text-white/55 hover:text-white transition-colors touch-manipulation">
                Συχνές Ερωτήσεις
              </Link>
              <Link href="/contact" className="py-1.5 text-sm text-white/55 hover:text-white transition-colors touch-manipulation">
                Επικοινωνία
              </Link>
              <Link href="/terms" className="py-1.5 text-sm text-white/55 hover:text-white transition-colors touch-manipulation">
                Όροι Χρήσης
              </Link>
              <Link href="/privacy" className="py-1.5 text-sm text-white/55 hover:text-white transition-colors touch-manipulation">
                Απόρρητο
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 sm:mt-14 pt-5 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/25">
            &copy; {new Date().getFullYear()} Dixis. Με αγάπη για τους τοπικούς παραγωγούς.
          </p>
          {/* Language switcher */}
          <div className="flex items-center gap-1 bg-white/5 rounded-full p-0.5" data-testid="footer-language-switcher">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => handleLocaleChange(loc)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                  locale === loc
                    ? 'bg-white/12 text-white'
                    : 'text-white/35 hover:text-white/60'
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
    </footer>
  );
}
