'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FaqItem {
  q: string;
  a: string;
}

const sections: { title: string; items: FaqItem[] }[] = [
  {
    title: 'Παραγγελίες & Αποστολή',
    items: [
      {
        q: 'Πώς μπορώ να κάνω μια παραγγελία;',
        a: 'Επιλέξτε τα προϊόντα που θέλετε, προσθέστε τα στο καλάθι σας και προχωρήστε στο ταμείο. Μπορείτε να πληρώσετε με κάρτα ή αντικαταβολή.',
      },
      {
        q: 'Ποιοι είναι οι τρόποι πληρωμής;',
        a: 'Δεχόμαστε πιστωτικές/χρεωστικές κάρτες μέσω Stripe και αντικαταβολή (με επιπλέον χρέωση 4€).',
      },
      {
        q: 'Πόσο κοστίζουν τα μεταφορικά;',
        a: 'Τα μεταφορικά υπολογίζονται αυτόματα με βάση τον ταχυδρομικό κώδικα και το βάρος. Κάθε παραγωγός μπορεί να προσφέρει δωρεάν αποστολή πάνω από ένα ελάχιστο ποσό.',
      },
      {
        q: 'Πώς μπορώ να παρακολουθήσω την παραγγελία μου;',
        a: 'Μετά την ολοκλήρωση της παραγγελίας, θα λάβετε email επιβεβαίωσης με σύνδεσμο παρακολούθησης. Μπορείτε επίσης να χρησιμοποιήσετε την αναζήτηση παραγγελίας.',
      },
    ],
  },
  {
    title: 'Προϊόντα & Ποιότητα',
    items: [
      {
        q: 'Τα προϊόντα είναι φρέσκα;',
        a: 'Ναι! Τα προϊόντα μας προέρχονται απευθείας από Έλληνες παραγωγούς και αποστέλλονται κατά παραγγελία για μέγιστη φρεσκάδα.',
      },
      {
        q: 'Υπάρχουν βιολογικά προϊόντα;',
        a: 'Πολλοί παραγωγοί μας προσφέρουν βιολογικά προϊόντα. Μπορείτε να φιλτράρετε τα προϊόντα ανά βιολογικά στη σελίδα αναζήτησης.',
      },
      {
        q: 'Μπορώ να επιστρέψω ένα προϊόν;',
        a: 'Αν λάβατε ελαττωματικό ή κατεστραμμένο προϊόν, επικοινωνήστε μαζί μας μέσω της σελίδας επικοινωνίας εντός 48 ωρών και θα βρούμε λύση.',
      },
    ],
  },
  {
    title: 'Λογαριασμός & Ασφάλεια',
    items: [
      {
        q: 'Πώς δημιουργώ λογαριασμό;',
        a: 'Πατήστε "Εγγραφή" στο μενού και συμπληρώστε τα στοιχεία σας. Η εγγραφή είναι δωρεάν.',
      },
      {
        q: 'Τα στοιχεία μου είναι ασφαλή;',
        a: 'Απολύτως. Χρησιμοποιούμε κρυπτογράφηση SSL σε όλες τις συναλλαγές. Οι πληρωμές γίνονται μέσω Stripe, χωρίς να αποθηκεύουμε στοιχεία καρτών.',
      },
    ],
  },
  {
    title: 'Για Παραγωγούς',
    items: [
      {
        q: 'Πώς μπορώ να γίνω παραγωγός στο Dixis;',
        a: 'Επισκεφθείτε τη σελίδα εγγραφής παραγωγού, συμπληρώστε τη φόρμα ενδιαφέροντος και η ομάδα μας θα επικοινωνήσει μαζί σας.',
      },
      {
        q: 'Υπάρχει κόστος εγγραφής;',
        a: 'Η εγγραφή ως παραγωγός είναι δωρεάν. Χρεώνουμε μόνο μια μικρή προμήθεια ανά πώληση.',
      },
    ],
  },
];

function AccordionItem({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-neutral-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left hover:text-primary transition-colors"
        aria-expanded={open}
      >
        <span className="font-medium text-neutral-900 pr-4">{item.q}</span>
        <svg
          className={`w-5 h-5 flex-shrink-0 text-neutral-500 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="pb-4 text-neutral-600 leading-relaxed">
          {item.a}
        </div>
      )}
    </div>
  );
}

export default function FaqPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Συχνές Ερωτήσεις</h1>
      <p className="text-neutral-600 mb-8">
        Βρείτε απαντήσεις στα πιο συνηθισμένα ερωτήματα σχετικά με το Dixis.
      </p>

      {sections.map((section) => (
        <section key={section.title} className="mb-8">
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">
            {section.title}
          </h2>
          <div className="bg-white rounded-lg border border-neutral-200 divide-y-0 px-4">
            {section.items.map((item) => (
              <AccordionItem key={item.q} item={item} />
            ))}
          </div>
        </section>
      ))}

      <div className="mt-8 p-6 bg-primary-pale rounded-lg text-center">
        <p className="text-neutral-700 mb-3">
          Δεν βρήκατε αυτό που ψάχνατε;
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center bg-primary hover:bg-primary-light text-white font-medium py-2 px-6 rounded-lg transition"
        >
          Επικοινωνήστε μαζί μας
        </Link>
      </div>
    </main>
  );
}
