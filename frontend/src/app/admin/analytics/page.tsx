'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminAnalytics() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // In a real app, you'd check for admin role
    // For demo purposes, any authenticated user can access
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
      
      <main data-testid="page-root" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" data-testid="breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <a href="/" className="hover:text-green-600">Home</a>
            </li>
            <li>/</li>
            <li>
              <a href="/admin" className="hover:text-green-600">Admin</a>
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