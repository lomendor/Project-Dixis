import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Όροι Χρήσης',
  description: 'Όροι και προϋποθέσεις χρήσης της πλατφόρμας dixis.gr.',
};

export default function TermsPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Όροι Χρήσης</h1>
      <p className="text-sm text-gray-500 mb-8">Τελευταία ενημέρωση: Φεβρουάριος 2026</p>

      <div className="prose prose-gray max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Γενικά</h2>
          <p className="text-gray-700 leading-relaxed">
            Οι παρόντες όροι χρήσης ρυθμίζουν τη σχέση μεταξύ του χρήστη και της πλατφόρμας
            <strong> Dixis</strong> (dixis.gr). Χρησιμοποιώντας το dixis.gr, αποδέχεστε
            τους παρόντες όρους στο σύνολό τους.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Περιγραφή υπηρεσίας</h2>
          <p className="text-gray-700 leading-relaxed">
            Το Dixis είναι ηλεκτρονική αγορά (marketplace) που συνδέει τοπικούς Έλληνες
            παραγωγούς με καταναλωτές. Η πλατφόρμα διευκολύνει τις συναλλαγές αλλά δεν
            αποτελεί η ίδια πωλητή των προϊόντων.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Εγγραφή χρήστη</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Η εγγραφή απαιτεί έγκυρο email και κωδικό πρόσβασης</li>
            <li>Είστε υπεύθυνοι για τη διατήρηση της εμπιστευτικότητας του λογαριασμού σας</li>
            <li>Πρέπει να είστε τουλάχιστον 18 ετών για να πραγματοποιήσετε αγορές</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Παραγγελίες & Πληρωμές</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Οι τιμές εμφανίζονται σε Ευρώ (€) και περιλαμβάνουν ΦΠΑ όπου ισχύει</li>
            <li>Η παραγγελία επιβεβαιώνεται με email μετά την ολοκλήρωση της πληρωμής</li>
            <li>Αποδεκτοί τρόποι πληρωμής: Πιστωτική/χρεωστική κάρτα μέσω Viva Wallet, αντικαταβολή</li>
            <li>Η αντικαταβολή επιβαρύνεται με κόστος 2,00 €</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Αποστολή & Παράδοση</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Η αποστολή γίνεται εντός 1-2 εργάσιμων ημερών από την επιβεβαίωση</li>
            <li>Τα μεταφορικά υπολογίζονται βάσει βάρους, περιοχής και αριθμού παραγωγών</li>
            <li>Δωρεάν αποστολή για παραγγελίες άνω των 30 € ανά παραγωγό</li>
            <li>Η παράδοση γίνεται στη διεύθυνση που δηλώνετε κατά την παραγγελία</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Επιστροφές & Ακυρώσεις</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Δικαίωμα υπαναχώρησης εντός 14 ημερών σύμφωνα με την ελληνική νομοθεσία</li>
            <li>Λόγω φύσης (φρέσκα τρόφιμα), ορισμένα προϊόντα εξαιρούνται από επιστροφή</li>
            <li>Σε περίπτωση ελαττωματικού προϊόντος, επικοινωνήστε μαζί μας εντός 48 ωρών</li>
            <li>Η επιστροφή χρημάτων γίνεται στον ίδιο τρόπο πληρωμής εντός 5 εργάσιμων</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Ευθύνη πλατφόρμας</h2>
          <p className="text-gray-700 leading-relaxed">
            Το Dixis λειτουργεί ως διαμεσολαβητής μεταξύ παραγωγών και καταναλωτών.
            Κάθε παραγωγός είναι υπεύθυνος για την ποιότητα, τη σήμανση και την ασφάλεια
            των προϊόντων του. Το Dixis δεν φέρει ευθύνη για ελαττωματικά προϊόντα, αλλά
            διαμεσολαβεί για την επίλυση κάθε προβλήματος.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Για παραγωγούς</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Η εγγραφή ως παραγωγός υπόκειται σε έγκριση</li>
            <li>Ο παραγωγός είναι υπεύθυνος για την ακρίβεια των πληροφοριών προϊόντων</li>
            <li>Η τιμολόγηση καθορίζεται από τον παραγωγό</li>
            <li>Το Dixis παρακρατεί προμήθεια ανά πώληση σύμφωνα με τη σύμβαση συνεργασίας</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Πνευματική ιδιοκτησία</h2>
          <p className="text-gray-700 leading-relaxed">
            Το σύνολο του περιεχομένου του dixis.gr (λογότυπο, σχεδιασμός, κώδικας)
            προστατεύεται από τη νομοθεσία περί πνευματικής ιδιοκτησίας.
            Απαγορεύεται η αναπαραγωγή χωρίς γραπτή άδεια.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">10. Εφαρμοστέο δίκαιο</h2>
          <p className="text-gray-700 leading-relaxed">
            Οι παρόντες όροι διέπονται από το ελληνικό δίκαιο. Αρμόδια δικαστήρια
            για τυχόν διαφορές ορίζονται τα δικαστήρια Αθηνών.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">11. Επικοινωνία</h2>
          <p className="text-gray-700 leading-relaxed">
            Για ερωτήσεις σχετικά με τους όρους χρήσης:{' '}
            <a href="mailto:info@dixis.gr" className="text-green-600 hover:text-green-700 underline">
              info@dixis.gr
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
