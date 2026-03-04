import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Συχνές Ερωτήσεις (FAQ)',
  description:
    'Βρείτε απαντήσεις στα πιο συνηθισμένα ερωτήματα σχετικά με παραγγελίες, αποστολή, πληρωμές και ποιότητα στο Dixis.',
  openGraph: {
    title: 'Συχνές Ερωτήσεις | Dixis',
    description:
      'Απαντήσεις σε ερωτήσεις για παραγγελίες, αποστολή, πληρωμές, ποιότητα και εγγραφή παραγωγών.',
    type: 'website',
    locale: 'el_GR',
    siteName: 'Dixis',
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
