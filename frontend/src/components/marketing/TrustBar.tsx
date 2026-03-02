import { ShieldCheck, Truck, Flag, HandCoins } from 'lucide-react';

/**
 * TrustBar — Clean horizontal value-proposition strip
 *
 * White background, minimal design, maximum trust.
 * 4 signals with subtle icon circles.
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
    subtitle: 'Πάνω από 80% στον παραγωγό',
  },
];

export default function TrustBar() {
  return (
    <section className="py-14 sm:py-18 bg-white border-y border-neutral-200/50">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6">
          {SIGNALS.map(({ icon: Icon, title, subtitle }) => (
            <div key={title} className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#edf6f0] flex items-center justify-center">
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
