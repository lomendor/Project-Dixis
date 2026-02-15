'use client';

import Link from 'next/link';
import ProducerAnalyticsDashboard from '@/components/producer/ProducerAnalyticsDashboard';
import AuthGuard from '@/components/AuthGuard';

/**
 * Pass PRODUCER-DASH-FIX-01: Use AuthGuard with requireRole="producer"
 * Previously used manual useAuth+useEffect that didn't check producer role,
 * allowing any logged-in user (consumer/admin) to hit the page and see
 * "Σφάλμα Φόρτωσης Αναλυτικών" when the API rejected non-producer tokens.
 */
export default function ProducerAnalytics() {
  return (
    <AuthGuard requireAuth={true} requireRole="producer">
      <div className="min-h-screen bg-neutral-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex mb-8" data-testid="breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-neutral-500">
              <li>
                <Link href="/" className="hover:text-primary">Αρχική</Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/producer/dashboard" className="hover:text-primary">Πίνακας Παραγωγού</Link>
              </li>
              <li>/</li>
              <li className="text-neutral-900">Αναλυτικά</li>
            </ol>
          </nav>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Αναλυτικά Παραγωγού
            </h1>
            <p className="text-neutral-600">
              Παρακολουθήστε την απόδοση των προϊόντων και τα αναλυτικά πωλήσεων
            </p>
          </div>

          {/* Producer Analytics Dashboard */}
          <ProducerAnalyticsDashboard />

          {/* Footer Information */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6" data-testid="producer-analytics-info">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Πληροφορίες Αναλυτικών Παραγωγού
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Αυτός ο πίνακας εμφανίζει αναλυτικά δεδομένα για τα προϊόντα και τις παραγγελίες σας.
                    Παρακολουθήστε πωλήσεις, τάσεις παραγγελιών και δημοτικότητα προϊόντων.
                  </p>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>Τα δεδομένα αφορούν μόνο παραγγελίες που περιέχουν τα προϊόντα σας</li>
                    <li>Τα αναλυτικά πωλήσεων αντικατοπτρίζουν τα έσοδα από τα προϊόντα σας</li>
                    <li>Τα αναλυτικά παραγγελιών περιλαμβάνουν όλες τις παραγγελίες με τα προϊόντα σας</li>
                    <li>Η κατάταξη προϊόντων βασίζεται στην απόδοση του χαρτοφυλακίου σας</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}