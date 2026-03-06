import { ShieldCheck, Truck, Flag, HandCoins } from 'lucide-react';

/**
 * TrustBar — Clean horizontal value-proposition strip
 *
 * White background, distinct colored icon circles, maximum trust.
 * Each signal has its own accent color for visual distinction.
 */

const SIGNALS = [
  {
    icon: ShieldCheck,
    title: 'Ασφαλείς Πληρωμές',
    subtitle: 'Κρυπτογραφημένες συναλλαγές',
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: Truck,
    title: 'Γρήγορη Παράδοση',
    subtitle: 'Σε 24-48 ώρες στην πόρτα σας',
    iconColor: 'text-amber-600',
    bgColor: 'bg-amber-500/10',
  },
  {
    icon: Flag,
    title: '100% Ελληνικά',
    subtitle: 'Αυθεντικά τοπικά προϊόντα',
    iconColor: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: HandCoins,
    title: 'Δίκαιο Εμπόριο',
    subtitle: 'Πάνω από 80% στον παραγωγό',
    iconColor: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10',
  },
];

export default function TrustBar() {
  return (
    <section className="py-14 sm:py-18 bg-white border-y border-neutral-200/50">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6">
          {SIGNALS.map(({ icon: Icon, title, subtitle, iconColor, bgColor }) => (
            <div key={title} className="flex flex-col items-center text-center gap-3">
              <div className={`w-14 h-14 rounded-full ${bgColor} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
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
