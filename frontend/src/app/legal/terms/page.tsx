import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Όροι Χρήσης | Dixis',
  description: 'Όροι χρήσης της πλατφόρμας Dixis — ηλεκτρονική αγορά τοπικών προϊόντων.',
};

/**
 * Pass LEGAL-PAGES-01: Full terms of service in Greek
 */
export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <article className="max-w-3xl mx-auto bg-white rounded-xl border p-6 sm:p-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Όροι Χρήσης</h1>
        <p className="text-sm text-gray-500 mb-8">Τελευταία ενημέρωση: Φεβρουάριος 2026</p>

        <div className="prose prose-gray max-w-none space-y-6 text-[15px] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">1. Γενικά</h2>
            <p>
              Η πλατφόρμα <strong>Dixis</strong> (dixis.gr) λειτουργεί ως ηλεκτρονική αγορά που
              συνδέει τοπικούς Έλληνες παραγωγούς με καταναλωτές. Η χρήση της πλατφόρμας
              συνεπάγεται αποδοχή των παρόντων όρων.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">2. Εγγραφή και Λογαριασμός</h2>
            <p>
              Η πρόσβαση στην πλατφόρμα γίνεται μέσω αριθμού τηλεφώνου και κωδικού OTP.
              Ο χρήστης ευθύνεται για την ασφάλεια της πρόσβασης στον λογαριασμό του.
              Δεν επιτρέπεται η κοινοποίηση κωδικών σε τρίτους.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">3. Παραγγελίες και Πληρωμές</h2>
            <p>
              Οι τιμές αναγράφονται σε ευρώ (EUR) και περιλαμβάνουν ΦΠΑ.
              Τα μεταφορικά υπολογίζονται κατά το checkout.
              Αποδεκτοί τρόποι πληρωμής: αντικαταβολή, πιστωτική/χρεωστική κάρτα (μέσω Stripe).
            </p>
            <p>
              Η παραγγελία ολοκληρώνεται μετά την επιβεβαίωση πληρωμής.
              Ο παραγωγός ευθύνεται για την ετοιμασία και αποστολή.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">4. Αποστολή και Παράδοση</h2>
            <p>
              Ο χρόνος παράδοσης εξαρτάται από τον παραγωγό και τη γεωγραφική θέση.
              Η πλατφόρμα δεν ευθύνεται για καθυστερήσεις που οφείλονται σε τρίτους
              μεταφορείς ή ανωτέρα βία.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">5. Επιστροφές και Ακυρώσεις</h2>
            <p>
              Λόγω της φύσης των προϊόντων (φρέσκα τρόφιμα), οι επιστροφές γίνονται
              αποδεκτές μόνο σε περιπτώσεις ελαττωματικού ή λανθασμένου προϊόντος.
              Η αίτηση επιστροφής πρέπει να υποβληθεί εντός 24 ωρών από την παράδοση.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">6. Υποχρεώσεις Παραγωγών</h2>
            <p>
              Οι παραγωγοί ευθύνονται για την ακρίβεια των πληροφοριών (τίτλος, περιγραφή,
              τιμή, απόθεμα) και την ποιότητα των προϊόντων τους. Η πλατφόρμα ενεργεί ως
              διαμεσολαβητής και δεν εγγυάται την ποιότητα μεμονωμένων προϊόντων.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">7. Πνευματική Ιδιοκτησία</h2>
            <p>
              Το περιεχόμενο της πλατφόρμας (λογότυπο, σχεδιασμός, κώδικας) ανήκει στο
              Dixis. Απαγορεύεται η αντιγραφή ή αναπαραγωγή χωρίς γραπτή άδεια.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">8. Περιορισμός Ευθύνης</h2>
            <p>
              Η πλατφόρμα παρέχεται &quot;ως έχει&quot;. Δεν φέρουμε ευθύνη για ζημίες
              που προκύπτουν από τη χρήση ή αδυναμία χρήσης της πλατφόρμας,
              εκτός αν προβλέπεται διαφορετικά από τον νόμο.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">9. Τροποποιήσεις</h2>
            <p>
              Διατηρούμε το δικαίωμα τροποποίησης των όρων χρήσης. Σε περίπτωση ουσιωδών
              αλλαγών, θα ενημερώσουμε τους χρήστες μέσω της πλατφόρμας ή μέσω email.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">10. Εφαρμοστέο Δίκαιο</h2>
            <p>
              Οι παρόντες όροι διέπονται από το ελληνικό δίκαιο. Για κάθε διαφορά
              αρμόδια είναι τα δικαστήρια Αθηνών.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">11. Επικοινωνία</h2>
            <p>
              Για ερωτήσεις σχετικά με τους όρους χρήσης, επικοινωνήστε μαζί μας στη
              σελίδα{' '}
              <Link href="/contact" className="text-emerald-700 hover:underline">
                Επικοινωνία
              </Link>.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
