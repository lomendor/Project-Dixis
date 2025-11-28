export default function Trust() {
  const items = [
    {
      icon: (
        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      title: 'Απευθείας από παραγωγούς',
      desc: 'Στηρίζουμε μικρούς Έλληνες παραγωγούς με διαφάνεια στην τιμολόγηση.'
    },
    {
      icon: (
        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Διαφανείς αποστολές',
      desc: 'Καθαρό κόστος μεταφορικών πριν το checkout. Χωρίς κρυφές χρεώσεις.'
    },
    {
      icon: (
        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      title: 'Παρακολούθηση παραγγελίας',
      desc: 'Ζωντανή ενημέρωση κατάστασης με email notifications.'
    },
  ];

  return (
    <section className="py-10 sm:py-16">
      {/* Section header - Mobile-first */}
      <div className="text-center mb-8 sm:mb-12 px-2">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900">
          Γιατί <span className="text-primary">Dixis</span>
        </h2>
        <p className="mt-2 sm:mt-3 text-sm sm:text-base text-neutral-600 max-w-xl sm:max-w-2xl mx-auto">
          Η πλατφόρμα που φέρνει κοντά παραγωγούς και καταναλωτές
        </p>
      </div>

      {/* Cards - 1 column mobile, 3 columns md+ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {items.map((item, i) => (
          <div
            key={i}
            className="bg-white rounded-md p-5 sm:p-8 shadow-card hover:shadow-card-hover transition-all duration-200 md:hover:-translate-y-1 active:scale-[0.99] text-center touch-manipulation"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary-pale mb-3 sm:mb-5">
              {item.icon}
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-1.5 sm:mb-2">{item.title}</h3>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
