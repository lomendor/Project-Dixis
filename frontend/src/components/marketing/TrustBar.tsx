/**
 * TrustBar — Clean horizontal value-proposition strip
 *
 * Emoji icons for visual richness — colorful, recognizable, cross-platform.
 * Much stronger visual weight than thin Lucide stroke icons.
 */

const SIGNALS = [
  {
    emoji: '🔒',
    label: 'lock',
    title: 'Ασφαλείς Πληρωμές',
    subtitle: 'Κρυπτογραφημένες συναλλαγές',
  },
  {
    emoji: '📦',
    label: 'package',
    title: 'Γρήγορη Παράδοση',
    subtitle: 'Σε 24-48 ώρες στην πόρτα σας',
  },
  {
    emoji: '🇬🇷',
    label: 'Greek flag',
    title: '100% Ελληνικά',
    subtitle: 'Αυθεντικά τοπικά προϊόντα',
  },
  {
    emoji: '🤝',
    label: 'handshake',
    title: 'Δίκαιο Εμπόριο',
    subtitle: 'Πάνω από 80% στον παραγωγό',
  },
];

export default function TrustBar() {
  return (
    <section className="py-14 sm:py-18 bg-white border-y border-neutral-200/50">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6">
          {SIGNALS.map(({ emoji, label, title, subtitle }) => (
            <div key={title} className="flex flex-col items-center text-center gap-3">
              <span className="text-4xl" role="img" aria-label={label}>{emoji}</span>
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
