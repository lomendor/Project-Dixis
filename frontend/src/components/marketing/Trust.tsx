/**
 * Trust Section - Build confidence with key value propositions
 *
 * Features:
 * - 3 trust indicators (freshness, local producers, fast delivery)
 * - Mobile-first 1-column, scales to 3-column on desktop
 * - Generous whitespace and readable icons
 * - Brand color accents
 */
export default function Trust() {
  const trustPoints = [
    {
      icon: (
        <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Φρεσκάδα Εγγυημένη',
      description: 'Όλα τα προϊόντα μας είναι φρέσκα και συλλέγονται την ίδια μέρα ή την προηγούμενη της παράδοσης.',
    },
    {
      icon: (
        <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Τοπικοί Παραγωγοί',
      description: 'Γνωρίστε τους ανθρώπους πίσω από κάθε προϊόν. Υποστηρίζουμε μικρούς Έλληνες παραγωγούς.',
    },
    {
      icon: (
        <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Γρήγορη Παράδοση',
      description: 'Παραλάβετε τα προϊόντα σας εντός 24-48 ωρών. Δωρεάν παράδοση για παραγγελίες άνω των 30€.',
    },
  ];

  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section header - mobile-optimized */}
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4 sm:text-4xl">
            Γιατί να επιλέξετε το Dixis;
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Η δέσμευσή μας για ποιότητα, φρεσκάδα και υποστήριξη των τοπικών κοινοτήτων.
          </p>
        </div>

        {/* Trust cards - mobile-first grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {trustPoints.map((point, index) => (
            <div
              key={index}
              className="bg-primary-pale rounded-xl p-6 sm:p-8 text-center hover:shadow-card transition-shadow duration-200"
            >
              {/* Icon - centered, generous spacing */}
              <div className="flex justify-center mb-5">
                {point.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                {point.title}
              </h3>

              {/* Description */}
              <p className="text-neutral-600 leading-relaxed">
                {point.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
