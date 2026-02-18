import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Σχετικά με εμάς',
  description:
    'Η Dixis συνδέει Έλληνες μικροπαραγωγούς απευθείας με καταναλωτές — χωρίς μεσάζοντες, με διαφάνεια και σεβασμό στην ποιότητα.',
}

const values = [
  {
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Απευθείας από τον Παραγωγό',
    description:
      'Κάθε προϊόν ταξιδεύει απευθείας από τον παραγωγό στην πόρτα σας, χωρίς μεσάζοντες. Αυτό σημαίνει αυθεντικότητα, ποιότητα και δίκαιη τιμή.',
  },
  {
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Πλήρης Διαφάνεια',
    description:
      'Ξέρετε ακριβώς πού πάει κάθε ευρώ. Ο παραγωγός λαμβάνει το 88% της τιμής — μόνο 12% παρακρατείται για τη λειτουργία της πλατφόρμας.',
  },
  {
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    title: 'Στήριξη Τοπικών Κοινοτήτων',
    description:
      'Κάθε αγορά ενισχύει τον Έλληνα μικροπαραγωγό, τη βιώσιμη γεωργία και τις τοπικές κοινότητες σε ολόκληρη την Ελλάδα.',
  },
  {
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
      </svg>
    ),
    title: 'Βιωσιμότητα',
    description:
      'Προωθούμε βιώσιμες μεθόδους παραγωγής, εποχικά προϊόντα και μικρότερο περιβαλλοντικό αποτύπωμα στην αλυσίδα τροφίμων.',
  },
]

const stats = [
  { value: '100%', label: 'Ελληνικά Προϊόντα' },
  { value: '88%', label: 'Πηγαίνει στον Παραγωγό' },
  { value: '0', label: 'Μεσάζοντες' },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-pale to-white py-16 sm:py-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
            Η Ιστορία μας
          </h1>
          <p className="text-lg sm:text-xl text-neutral-700 leading-relaxed max-w-3xl mx-auto">
            Η Dixis γεννήθηκε από μια απλή πεποίθηση: ότι κάθε Έλληνας μικροπαραγωγός αξίζει
            πρόσβαση στην αγορά, και κάθε καταναλωτής αξίζει να ξέρει ακριβώς από πού
            προέρχεται η τροφή του.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-4">
                Η Αποστολή μας
              </h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Δημιουργήσαμε το Dixis για να γεφυρώσουμε το χάσμα μεταξύ των Ελλήνων
                μικροπαραγωγών και των καταναλωτών. Στο σημερινό σύστημα τροφίμων, οι μεσάζοντες
                απορροφούν μεγάλο μέρος της αξίας — ο παραγωγός παίρνει ελάχιστα, ενώ ο
                καταναλωτής πληρώνει πολλά.
              </p>
              <p className="text-neutral-700 leading-relaxed">
                Εμείς αλλάζουμε αυτό. Στο Dixis, κάθε αγορά γίνεται απευθείας: από τον ελαιώνα,
                το μελισσοκομείο ή το εργαστήριο, κατευθείαν στην πόρτα σας. Χωρίς ενδιάμεσους,
                χωρίς κρυφές χρεώσεις, με πλήρη διαφάνεια.
              </p>
            </div>
            <div className="bg-primary-pale rounded-2xl p-8 flex flex-col items-center justify-center">
              <div className="grid grid-cols-3 gap-6 w-full">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-primary">
                      {stat.value}
                    </div>
                    <div className="text-xs sm:text-sm text-neutral-600 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 bg-neutral-50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 text-center mb-12">
            Οι Αξίες μας
          </h2>
          <div className="grid sm:grid-cols-2 gap-8">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-white rounded-xl p-6 border border-neutral-200 hover:border-primary/30 transition-colors"
              >
                <div className="mb-4">{value.icon}</div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{value.title}</h3>
                <p className="text-neutral-600 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 text-center mb-12">
            Πώς Λειτουργεί
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Οι Παραγωγοί Ανεβάζουν',
                desc: 'Έλληνες μικροπαραγωγοί παρουσιάζουν τα προϊόντα τους με φωτογραφίες, περιγραφές και πληροφορίες καλλιέργειας.',
              },
              {
                step: '02',
                title: 'Εσείς Ψωνίζετε',
                desc: 'Ανακαλύψτε, συγκρίνετε και παραγγείλτε ποιοτικά τρόφιμα με ασφαλή πληρωμή μέσω κάρτας ή αντικαταβολή.',
              },
              {
                step: '03',
                title: 'Αποστολή στην Πόρτα σας',
                desc: 'Ο παραγωγός συσκευάζει και αποστέλλει απευθείας σε εσάς. Παρακολουθήστε την παραγγελία σας σε κάθε βήμα.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white font-bold text-lg mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{item.title}</h3>
                <p className="text-neutral-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-primary-pale to-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-4">
            Γίνετε Μέρος της Κοινότητάς μας
          </h2>
          <p className="text-neutral-700 mb-8 max-w-2xl mx-auto">
            Είτε είστε παραγωγός που θέλει να φτάσει σε περισσότερους πελάτες, είτε καταναλωτής
            που αναζητά αυθεντικά ελληνικά προϊόντα — υπάρχει χώρος για εσάς στο Dixis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center bg-primary hover:bg-primary-light text-white font-medium py-3 px-8 rounded-lg transition-colors"
            >
              Εξερευνήστε Προϊόντα
            </Link>
            <Link
              href="/auth/register?role=producer"
              className="inline-flex items-center justify-center border-2 border-primary text-primary hover:bg-primary hover:text-white font-medium py-3 px-8 rounded-lg transition-colors"
            >
              Γίνετε Παραγωγός
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
