import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Πολιτική Απορρήτου | Dixis',
  description: 'Πολιτική απορρήτου και προστασία προσωπικών δεδομένων του dixis.gr.',
};

export default function PrivacyPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Πολιτική Απορρήτου</h1>
      <p className="text-sm text-gray-500 mb-8">Τελευταία ενημέρωση: Φεβρουάριος 2026</p>

      <div className="prose prose-gray max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Ποιοι είμαστε</h2>
          <p className="text-gray-700 leading-relaxed">
            Η πλατφόρμα <strong>Dixis</strong> (dixis.gr) είναι μια ηλεκτρονική αγορά
            τοπικών Ελλήνων παραγωγών. Υπεύθυνος επεξεργασίας δεδομένων είναι η εταιρεία
            που διαχειρίζεται το dixis.gr, με έδρα στην Ελλάδα.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Δεδομένα που συλλέγουμε</h2>
          <p className="text-gray-700 leading-relaxed mb-3">Κατά τη χρήση του dixis.gr ενδέχεται να συλλέγουμε:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li><strong>Στοιχεία εγγραφής:</strong> Ονοματεπώνυμο, email, τηλέφωνο</li>
            <li><strong>Στοιχεία παραγγελίας:</strong> Διεύθυνση αποστολής, ταχυδρομικός κώδικας</li>
            <li><strong>Στοιχεία πληρωμής:</strong> Τα δεδομένα πληρωμής διαχειρίζονται αποκλειστικά από τον πάροχο πληρωμών (Viva Wallet) — δεν αποθηκεύουμε αριθμούς καρτών</li>
            <li><strong>Τεχνικά δεδομένα:</strong> Διεύθυνση IP, τύπος browser, cookies λειτουργικότητας</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Σκοπός επεξεργασίας</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Εκτέλεση και παράδοση παραγγελιών</li>
            <li>Επικοινωνία σχετικά με παραγγελίες (email ενημερώσεις)</li>
            <li>Βελτίωση της λειτουργίας της πλατφόρμας</li>
            <li>Συμμόρφωση με νομικές υποχρεώσεις (φορολογικά παραστατικά)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Νομική βάση</h2>
          <p className="text-gray-700 leading-relaxed">
            Η επεξεργασία βασίζεται στην εκτέλεση σύμβασης (παραγγελίες), στη συγκατάθεσή σας
            (newsletter, cookies) και στα έννομα συμφέροντά μας (ασφάλεια πλατφόρμας),
            σύμφωνα με τον GDPR (ΕΕ 2016/679).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Κοινοποίηση δεδομένων</h2>
          <p className="text-gray-700 leading-relaxed mb-3">Τα δεδομένα σας μπορεί να κοινοποιηθούν σε:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li><strong>Παραγωγούς:</strong> Όνομα και διεύθυνση αποστολής για εκτέλεση παραγγελίας</li>
            <li><strong>Πάροχο πληρωμών:</strong> Viva Wallet για ασφαλείς συναλλαγές</li>
            <li><strong>Μεταφορικές εταιρείες:</strong> Διεύθυνση αποστολής για παράδοση</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-3">
            Δεν πωλούμε ή κοινοποιούμε τα δεδομένα σας σε τρίτους για διαφημιστικούς σκοπούς.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Cookies</h2>
          <p className="text-gray-700 leading-relaxed">
            Χρησιμοποιούμε μόνο απαραίτητα cookies λειτουργικότητας (session, authentication).
            Δεν χρησιμοποιούμε cookies παρακολούθησης ή διαφήμισης.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Τα δικαιώματά σας</h2>
          <p className="text-gray-700 leading-relaxed mb-3">Σύμφωνα με τον GDPR, έχετε δικαίωμα:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Πρόσβασης στα δεδομένα σας</li>
            <li>Διόρθωσης ανακριβών δεδομένων</li>
            <li>Διαγραφής (δικαίωμα στη λήθη)</li>
            <li>Περιορισμού της επεξεργασίας</li>
            <li>Φορητότητας δεδομένων</li>
            <li>Ανάκλησης συγκατάθεσης</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-3">
            Για άσκηση των δικαιωμάτων σας, επικοινωνήστε μαζί μας στο{' '}
            <a href="mailto:privacy@dixis.gr" className="text-green-600 hover:text-green-700 underline">
              privacy@dixis.gr
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Ασφάλεια</h2>
          <p className="text-gray-700 leading-relaxed">
            Εφαρμόζουμε κατάλληλα τεχνικά και οργανωτικά μέτρα ασφάλειας,
            συμπεριλαμβανομένης κρυπτογράφησης SSL/TLS και ασφαλούς αποθήκευσης κωδικών.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Επικοινωνία</h2>
          <p className="text-gray-700 leading-relaxed">
            Για ερωτήσεις σχετικά με την προστασία δεδομένων:{' '}
            <a href="mailto:privacy@dixis.gr" className="text-green-600 hover:text-green-700 underline">
              privacy@dixis.gr
            </a>
          </p>
          <p className="text-gray-700 leading-relaxed mt-2">
            Εποπτική αρχή: Αρχή Προστασίας Δεδομένων Προσωπικού Χαρακτήρα (
            <a href="https://www.dpa.gr" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 underline">
              www.dpa.gr
            </a>)
          </p>
        </section>
      </div>
    </main>
  );
}
