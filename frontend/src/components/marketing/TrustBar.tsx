import { ShieldCheck, Truck, Flag, HandCoins } from 'lucide-react';

/**
 * TrustBar — Horizontal value-proposition strip for homepage
 *
 * 4 trust signals: secure payments, fast delivery, 100% Greek, fair trade.
 * Subtle bg, no CTA — pure trust building.
 */

const SIGNALS = [
  {
    icon: ShieldCheck,
    title: 'Ασφαλείς Πληρωμές',
    subtitle: 'Κρυπτογραφημένες συναλλαγές',
  },
  {
    icon: Truck,
    title: 'Γρήγορη Παράδοση',
    subtitle: 'Σε 24-48 ώρες στην πόρτα σας',
  },
  {
    icon: Flag,
    title: '100% Ελληνικά',
    subtitle: 'Αυθεντικά τοπικά προϊόντα',
  },
  {
    icon: HandCoins,
    title: 'Δίκαιο Εμπόριο',
    subtitle: '88% στον παραγωγό',
  },
];

export default function TrustBar() {
  return (
    <section className="py-12 sm:py-16 bg-primary-pale/30 border-y border-primary/5">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {SIGNALS.map(({ icon: Icon, title, subtitle }) => (
            <div key={title} className="flex flex-col items-center text-center gap-3">
              <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-800">{title}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
