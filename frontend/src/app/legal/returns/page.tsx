import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Πολιτική Επιστροφών',
  description: 'Πολιτική επιστροφών και ακυρώσεων της πλατφόρμας Dixis.',
};

/**
 * Standalone return policy page — consolidates return info
 * from /terms (section 6) and /legal/terms (section 5).
 */
export default function ReturnsPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <article className="max-w-3xl mx-auto bg-white rounded-xl border p-6 sm:p-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Πολιτική Επιστροφών
        </h1>
        <p className="text-sm text-gray-500 mb-8">Τελευταία ενημέρωση: Φεβρουάριος 2026</p>

        <div className="prose prose-gray max-w-none space-y-6 text-[15px] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">1. Γενικά</h2>
            <p>
              Η πλατφόρμα <strong>Dixis</strong> (dixis.gr) λειτουργεί ως ηλεκτρονική αγορά
              τοπικών τροφίμων. Λόγω της φύσης των προϊόντων (ευπαθή, φρέσκα τρόφιμα),
              η πολιτική επιστροφών ακολουθεί ειδικούς κανόνες σύμφωνα με την ελληνική
              και ευρωπαϊκή νομοθεσία.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              2. Δικαίωμα Υπαναχώρησης
            </h2>
            <p>
              Σύμφωνα με την ευρωπαϊκή νομοθεσία (Οδηγία 2011/83/ΕΕ), οι καταναλωτές
              έχουν δικαίωμα υπαναχώρησης εντός 14 ημερών χωρίς αιτιολόγηση.
            </p>
            <p className="mt-2">
              <strong>Εξαίρεση:</strong> Τα τρόφιμα και τα ευπαθή προϊόντα εξαιρούνται
              από το δικαίωμα υπαναχώρησης λόγω της φύσης τους
              (Άρθρο 16, στοιχείο δ&apos; της Οδηγίας).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              3. Ελαττωματικά ή Λανθασμένα Προϊόντα
            </h2>
            <p>
              Σε περίπτωση που λάβετε ελαττωματικό, κατεστραμμένο ή λανθασμένο προϊόν,
              δικαιούστε πλήρη επιστροφή χρημάτων ή αντικατάσταση. Παρακαλούμε:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Επικοινωνήστε μαζί μας εντός <strong>48 ωρών</strong> από την παράδοση</li>
              <li>Αναφέρετε τον αριθμό παραγγελίας</li>
              <li>Στείλτε φωτογραφία του προϊόντος που δείχνει το πρόβλημα</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              4. Διαδικασία Επιστροφής
            </h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                <strong>Επικοινωνία:</strong> Υποβάλετε αίτημα μέσω της{' '}
                <Link href="/contact" className="text-emerald-700 hover:underline">
                  σελίδας επικοινωνίας
                </Link>
              </li>
              <li>
                <strong>Τεκμηρίωση:</strong> Στείλτε φωτογραφίες και περιγραφή του προβλήματος
              </li>
              <li>
                <strong>Αξιολόγηση:</strong> Η ομάδα μας θα αξιολογήσει το αίτημα εντός 2 εργάσιμων ημερών
              </li>
              <li>
                <strong>Επίλυση:</strong> Εφόσον εγκριθεί, θα λάβετε οδηγίες επιστροφής ή
                άμεση επιστροφή χρημάτων
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              5. Επιστροφή Χρημάτων
            </h2>
            <p>
              Η επιστροφή χρημάτων γίνεται στο ίδιο μέσο πληρωμής που χρησιμοποιήθηκε
              κατά την παραγγελία. Ο χρόνος επιστροφής είναι έως <strong>5 εργάσιμες
              ημέρες</strong> από την έγκριση του αιτήματος.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">6. Ακυρώσεις</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Πριν την αποστολή:</strong> Μπορείτε να ακυρώσετε την παραγγελία σας
                χωρίς χρέωση, εφόσον δεν έχει αποσταλεί ακόμη
              </li>
              <li>
                <strong>Μετά την αποστολή:</strong> Ισχύει η πολιτική επιστροφών
                (ελαττωματικά/λανθασμένα προϊόντα)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">7. Επικοινωνία</h2>
            <p>
              Για ερωτήσεις σχετικά με επιστροφές ή ακυρώσεις, επικοινωνήστε μαζί μας
              στη σελίδα{' '}
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
