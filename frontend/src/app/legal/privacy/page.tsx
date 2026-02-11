import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Πολιτική Απορρήτου | Dixis',
  description: 'Πολιτική απορρήτου και προστασίας δεδομένων (GDPR) της πλατφόρμας Dixis.',
};

/**
 * Pass LEGAL-PAGES-01: Full privacy policy in Greek (GDPR-aware)
 */
export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <article className="max-w-3xl mx-auto bg-white rounded-xl border p-6 sm:p-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Πολιτική Απορρήτου</h1>
        <p className="text-sm text-gray-500 mb-8">Τελευταία ενημέρωση: Φεβρουάριος 2026</p>

        <div className="prose prose-gray max-w-none space-y-6 text-[15px] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">1. Εισαγωγή</h2>
            <p>
              Η πλατφόρμα <strong>Dixis</strong> (dixis.gr) σέβεται το απόρρητο των χρηστών
              και εφαρμόζει τον Γενικό Κανονισμό Προστασίας Δεδομένων (GDPR - ΕΕ 2016/679).
              Η παρούσα πολιτική εξηγεί ποια δεδομένα συλλέγουμε, γιατί, και πώς τα
              προστατεύουμε.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">2. Δεδομένα που Συλλέγουμε</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Αριθμός τηλεφώνου</strong> — για ταυτοποίηση μέσω OTP και
                επικοινωνία σχετικά με παραγγελίες.
              </li>
              <li>
                <strong>Στοιχεία παράδοσης</strong> — όνομα, διεύθυνση, πόλη, ΤΚ — για
                την αποστολή παραγγελιών.
              </li>
              <li>
                <strong>Ιστορικό παραγγελιών</strong> — προϊόντα, ποσά, ημερομηνίες —
                για την παρακολούθηση και εξυπηρέτηση.
              </li>
              <li>
                <strong>Δεδομένα πληρωμής</strong> — δεν αποθηκεύονται στους servers μας.
                Οι πληρωμές επεξεργάζονται από τον πάροχο Stripe (PCI DSS Level 1).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">3. Σκοπός Επεξεργασίας</h2>
            <p>Τα δεδομένα χρησιμοποιούνται αποκλειστικά για:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Εκτέλεση και παράδοση παραγγελιών</li>
              <li>Ταυτοποίηση χρήστη (OTP login)</li>
              <li>Αποστολή ενημερώσεων κατάστασης παραγγελίας</li>
              <li>Εξυπηρέτηση πελατών</li>
              <li>Βελτίωση της πλατφόρμας (ανώνυμα αναλυτικά στοιχεία)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">4. Νομική Βάση</h2>
            <p>
              Η επεξεργασία βασίζεται στην εκτέλεση σύμβασης (παραγγελία), στη συγκατάθεση
              (εγγραφή), και σε έννομο συμφέρον (βελτίωση υπηρεσιών, ασφάλεια).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">5. Cookies και Analytics</h2>
            <p>
              Η πλατφόρμα χρησιμοποιεί ελάχιστα τεχνικά cookies απαραίτητα για τη λειτουργία
              (session, cart). Δεν χρησιμοποιούμε cookies παρακολούθησης τρίτων.
            </p>
            <p>
              Τα αναλυτικά στοιχεία (αν ενεργοποιηθούν) είναι ανώνυμα και δεν χρησιμοποιούν
              cookies — σύμφωνα με τις αρχές privacy-by-design.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">6. Διατήρηση Δεδομένων</h2>
            <p>
              Τα δεδομένα παραγγελιών διατηρούνται για 5 έτη (φορολογικές υποχρεώσεις).
              Τα δεδομένα λογαριασμού διατηρούνται για όσο ο λογαριασμός είναι ενεργός.
              Μετά τη διαγραφή, τα δεδομένα αφαιρούνται εντός 30 ημερών.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">7. Ασφάλεια</h2>
            <p>
              Εφαρμόζουμε τεχνικά και οργανωτικά μέτρα ασφαλείας: κρυπτογράφηση HTTPS,
              HttpOnly cookies, rate limiting, και τακτικούς ελέγχους ασφαλείας.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">8. Δικαιώματα Χρηστών (GDPR)</h2>
            <p>Έχετε δικαίωμα:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Πρόσβασης στα δεδομένα σας</li>
              <li>Διόρθωσης ανακριβών δεδομένων</li>
              <li>Διαγραφής (&quot;δικαίωμα στη λήθη&quot;)</li>
              <li>Περιορισμού ή εναντίωσης στην επεξεργασία</li>
              <li>Φορητότητας δεδομένων</li>
            </ul>
            <p className="mt-2">
              Για να ασκήσετε τα δικαιώματά σας, επικοινωνήστε μαζί μας μέσω της
              σελίδας{' '}
              <Link href="/contact" className="text-emerald-700 hover:underline">
                Επικοινωνία
              </Link>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">9. Τρίτοι Πάροχοι</h2>
            <p>Μοιραζόμαστε δεδομένα μόνο με:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Stripe</strong> — επεξεργασία πληρωμών (PCI DSS Level 1)</li>
              <li><strong>Παραγωγούς</strong> — στοιχεία παράδοσης για εκτέλεση παραγγελιών</li>
              <li><strong>Resend</strong> — αποστολή email (αποδείξεις, ενημερώσεις)</li>
            </ul>
            <p className="mt-2">
              Δεν πουλάμε και δεν μοιραζόμαστε δεδομένα με τρίτους για διαφημιστικούς σκοπούς.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">10. Αλλαγές στην Πολιτική</h2>
            <p>
              Σε περίπτωση ουσιωδών αλλαγών, θα ενημερώσουμε τους χρήστες μέσω email
              ή μέσω ειδοποίησης στην πλατφόρμα.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">11. Επικοινωνία</h2>
            <p>
              Για ερωτήσεις σχετικά με την πολιτική απορρήτου ή τα δεδομένα σας,
              επικοινωνήστε μαζί μας στη σελίδα{' '}
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
