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
              <Link href="/" className="hover:text-green-600">Home</Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/admin" className="hover:text-green-600">Admin</Link>
            </li>
            <li>/</li>
            <li className="text-gray-900">Analytics</li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor user behavior and marketplace performance metrics
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
                Analytics Information
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  This dashboard displays real-time analytics data from user interactions across the Dixis marketplace.
                  Events are tracked client-side and include page views, product interactions, cart activities, and order completions.
                </p>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  <li>Data is updated in real-time as users interact with the platform</li>
                  <li>Events are batched for optimal performance</li>
                  <li>All data respects user privacy and GDPR compliance</li>
                  <li>Session tracking helps understand user journeys</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
