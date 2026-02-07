import Link from 'next/link';

export const metadata = { title: 'Γίνε Παραγωγός | Dixis' };

/**
 * PUBLIC-PRODUCER-PAGES-01: Producer recruitment landing page
 * Moved from /producers to /producers/join
 */
export default function ProducersJoinPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900">
          Γίνε μέλος του <span className="text-green-600">Dixis</span>
        </h1>
        <p className="text-xl text-gray-600 mt-4">
          Φέρνουμε τους τοπικούς παραγωγούς πιο κοντά σε καταναλωτές & επιχειρήσεις.
          Χωρίς αποθήκες — απευθείας από εσένα.
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="mt-12 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-8">
          Γιατί να μας επιλέξεις
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="border rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="text-3xl mb-3">📦</div>
            <h3 className="font-semibold text-gray-900">Κατάλογος Προϊόντων</h3>
            <p className="text-sm text-gray-600 mt-2">
              Δημιούργησε τον δικό σου κατάλογο με φωτογραφίες, περιγραφές και τιμές.
            </p>
          </div>
          <div className="border rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="text-3xl mb-3">✅</div>
            <h3 className="font-semibold text-gray-900">Υποστήριξη Πιστοποιήσεων</h3>
            <p className="text-sm text-gray-600 mt-2">
              Βοήθεια με ΠΟΠ, ΠΓΕ, βιολογικά και άλλες πιστοποιήσεις.
            </p>
          </div>
          <div className="border rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="font-semibold text-gray-900">Δίκαιη Προμήθεια</h3>
            <p className="text-sm text-gray-600 mt-2">
              Διαφανείς όροι χωρίς κρυφές χρεώσεις. Εσύ ορίζεις τις τιμές.
            </p>
          </div>
          <div className="border rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="text-3xl mb-3">📈</div>
            <h3 className="font-semibold text-gray-900">Προώθηση & SEO</h3>
            <p className="text-sm text-gray-600 mt-2">
              Τα προϊόντα σου εμφανίζονται στις μηχανές αναζήτησης.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-12 text-center">
        <Link
          href="/producers/register"
          className="inline-flex h-12 px-8 rounded-full bg-green-600 text-white font-semibold text-lg items-center hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
        >
          Εγγραφή Παραγωγού →
        </Link>
        <p className="text-sm text-gray-500 mt-4">
          Θα χρειαστεί να συνδεθείς με το κινητό σου
        </p>
      </div>

      {/* Browse Producers Link */}
      <div className="mt-16 text-center border-t pt-8">
        <p className="text-gray-600">
          Θέλεις να δεις τους παραγωγούς μας;
        </p>
        <Link
          href="/producers"
          className="inline-flex items-center gap-2 text-green-600 font-medium mt-2 hover:underline"
        >
          Δες τους παραγωγούς →
        </Link>
      </div>
    </main>
  );
}
