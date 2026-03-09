import Image from 'next/image';

/**
 * TrustBar — Clean horizontal value-proposition strip
 *
 * Custom 3D icons matching the category icon style.
 * Each signal has a rich, colorful illustration.
 */

const SIGNALS = [
  {
    icon: '/icons/trust/shield-secure-3d.png',
    title: 'Ασφαλείς Πληρωμές',
    subtitle: 'Κρυπτογραφημένες συναλλαγές',
  },
  {
    icon: '/icons/trust/delivery-3d.png',
    title: 'Γρήγορη Παράδοση',
    subtitle: 'Σε 24-48 ώρες στην πόρτα σας',
  },
  {
    icon: '/icons/trust/greek-olive-3d.png',
    title: '100% Ελληνικά',
    subtitle: 'Αυθεντικά τοπικά προϊόντα',
  },
  {
    icon: '/icons/trust/handshake-3d.png',
    title: 'Δίκαιο Εμπόριο',
    subtitle: 'Πάνω από 80% στον παραγωγό',
  },
];

export default function TrustBar() {
  return (
    <section className="py-10 sm:py-14 bg-white border-y border-neutral-200/50">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-6">
          {SIGNALS.map(({ icon, title, subtitle }) => (
            <div key={title} className="flex flex-col items-center text-center gap-2.5 sm:gap-4">
              <Image
                src={icon}
                alt={title}
                width={72}
                height={72}
                className="w-12 h-12 sm:w-16 sm:h-16 lg:w-[72px] lg:h-[72px] object-contain drop-shadow-sm"
              />
              <div>
                <p className="text-xs sm:text-sm font-semibold text-neutral-800">{title}</p>
                <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5">{subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
