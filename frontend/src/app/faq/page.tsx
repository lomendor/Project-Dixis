import type { Metadata } from 'next';
import FaqClient from './FaqClient';

export const metadata: Metadata = {
  title: 'Συχνές Ερωτήσεις',
  description: 'Απαντήσεις σε συνηθισμένες ερωτήσεις για παραγγελίες, αποστολές, πληρωμές και ποιότητα προϊόντων στο Dixis.',
  alternates: {
    canonical: '/faq',
  },
};

export default function FaqPage() {
  return <FaqClient />;
}
