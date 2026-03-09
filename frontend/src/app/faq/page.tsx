import type { Metadata } from 'next';
import FaqClient from './FaqClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dixis.gr';

export const metadata: Metadata = {
  title: 'Συχνές Ερωτήσεις',
  description: 'Απαντήσεις σε συνηθισμένες ερωτήσεις για παραγγελίες, αποστολές, πληρωμές και ποιότητα προϊόντων στο Dixis.',
  alternates: {
    canonical: '/faq',
  },
  openGraph: {
    title: 'Συχνές Ερωτήσεις | Dixis',
    description: 'Απαντήσεις σε συνηθισμένες ερωτήσεις για παραγγελίες, αποστολές, πληρωμές και ποιότητα προϊόντων.',
    url: `${siteUrl}/faq`,
  },
};

/**
 * FAQPage structured data for Google rich snippets.
 * Shows expandable Q&A directly in search results.
 */
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Πώς μπορώ να κάνω μια παραγγελία;',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Επιλέξτε τα προϊόντα που θέλετε, προσθέστε τα στο καλάθι σας και προχωρήστε στο ταμείο. Μπορείτε να πληρώσετε με κάρτα ή αντικαταβολή.',
      },
    },
    {
      '@type': 'Question',
      name: 'Ποιοι είναι οι τρόποι πληρωμής;',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Δεχόμαστε πιστωτικές/χρεωστικές κάρτες μέσω Stripe και αντικαταβολή (με επιπλέον χρέωση 4\u20AC).',
      },
    },
    {
      '@type': 'Question',
      name: 'Πόσο κοστίζουν τα μεταφορικά;',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Τα μεταφορικά υπολογίζονται αυτόματα με βάση τον ταχυδρομικό κώδικα και το βάρος. Κάθε παραγωγός μπορεί να προσφέρει δωρεάν αποστολή πάνω από ένα ελάχιστο ποσό.',
      },
    },
    {
      '@type': 'Question',
      name: 'Πώς εξασφαλίζεται η ποιότητα;',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Τα προϊόντα μας προέρχονται απευθείας από επιλεγμένους Έλληνες παραγωγούς και αποστέλλονται κατά παραγγελία με αυστηρά κριτήρια ποιότητας.',
      },
    },
    {
      '@type': 'Question',
      name: 'Υπάρχουν βιολογικά προϊόντα;',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Πολλοί παραγωγοί μας προσφέρουν βιολογικά προϊόντα. Μπορείτε να φιλτράρετε τα προϊόντα ανά βιολογικά στη σελίδα αναζήτησης.',
      },
    },
    {
      '@type': 'Question',
      name: 'Πώς μπορώ να γίνω παραγωγός στο Dixis;',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Επισκεφθείτε τη σελίδα εγγραφής παραγωγού, συμπληρώστε τη φόρμα ενδιαφέροντος και η ομάδα μας θα επικοινωνήσει μαζί σας.',
      },
    },
  ],
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <FaqClient />
    </>
  );
}
