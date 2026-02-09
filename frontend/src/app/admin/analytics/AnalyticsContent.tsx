'use client';

import Link from 'next/link';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

export default function AnalyticsContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" data-testid="breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-green-600">Αρχική</Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/admin" className="hover:text-green-600">Διαχείριση</Link>
            </li>
            <li>/</li>
            <li className="text-gray-900">Αναλυτικά</li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Πίνακας Αναλυτικών
          </h1>
          <p className="text-gray-600">
            Παρακολουθήστε τη συμπεριφορά χρηστών και τις μετρήσεις απόδοσης της αγοράς
          </p>
        </div>

        {/* Analytics Dashboard */}
        <AnalyticsDashboard />

        {/* Footer Information */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6" data-testid="analytics-info">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Πληροφορίες Αναλυτικών
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Αυτός ο πίνακας εμφανίζει δεδομένα αναλυτικών σε πραγματικό χρόνο από τις αλληλεπιδράσεις χρηστών
                  στην αγορά Dixis. Τα γεγονότα καταγράφονται στην πλευρά του πελάτη και περιλαμβάνουν προβολές σελίδων,
                  αλληλεπιδράσεις προϊόντων, δραστηριότητες καλαθιού και ολοκληρώσεις παραγγελιών.
                </p>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  <li>Τα δεδομένα ενημερώνονται σε πραγματικό χρόνο</li>
                  <li>Τα γεγονότα ομαδοποιούνται για βέλτιστη απόδοση</li>
                  <li>Όλα τα δεδομένα σέβονται το απόρρητο χρηστών και τη συμμόρφωση GDPR</li>
                  <li>Η παρακολούθηση συνεδριών βοηθά στην κατανόηση της πορείας των χρηστών</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
