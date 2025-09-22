'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import ProducerAnalyticsDashboard from '@/components/producer/ProducerAnalyticsDashboard';
import { useAuth } from '@/contexts/AuthContext';

export default function ProducerAnalytics() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // In a real app, you'd check for producer role/association
    // The API will handle producer access validation
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" data-testid="breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-green-600">Home</Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/producer/dashboard" className="hover:text-green-600">Producer Dashboard</Link>
            </li>
            <li>/</li>
            <li className="text-gray-900">Analytics</li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Producer Analytics
          </h1>
          <p className="text-gray-600">
            Monitor your products&apos; performance and sales analytics
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
                Producer Analytics Information
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  This dashboard displays analytics data specific to your products and orders.
                  Track your sales performance, order trends, and product popularity over time.
                </p>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  <li>Data shows only orders containing your products</li>
                  <li>Sales analytics reflect revenue from your product sales</li>
                  <li>Order analytics include all orders with your products</li>
                  <li>Product rankings are based on your portfolio performance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}