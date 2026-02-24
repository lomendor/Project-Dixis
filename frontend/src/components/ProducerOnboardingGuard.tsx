'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';

type GuardState = 'loading' | 'active' | 'pending' | 'redirect' | 'error';

interface Props {
  children: ReactNode;
}

/**
 * Wraps producer pages. Checks onboarding status and:
 * - active → render children normally
 * - pending + onboarding completed → render children with "under review" banner
 * - pending + no onboarding → redirect to onboarding form
 * - inactive + rejection → redirect to onboarding form (shows rejection there)
 */
export default function ProducerOnboardingGuard({ children }: Props) {
  const router = useRouter();
  const [state, setState] = useState<GuardState>('loading');

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const data = await apiClient.getProducerMe();
      if (!data.has_profile || !data.producer) {
        // No profile at all — redirect to onboarding
        router.replace('/producer/onboarding');
        setState('redirect');
        return;
      }

      const p = data.producer;

      if (p.status === 'active' || p.is_active) {
        setState('active');
        return;
      }

      if (p.status === 'inactive' && p.rejection_reason) {
        // Rejected — redirect to onboarding (form shows rejection reason)
        router.replace('/producer/onboarding');
        setState('redirect');
        return;
      }

      if (p.onboarding_completed_at) {
        // Pending with completed onboarding — show dashboard with banner
        setState('pending');
        return;
      }

      // Pending but onboarding not completed — redirect to complete it
      router.replace('/producer/onboarding');
      setState('redirect');
    } catch {
      // Pass FIX-ONBOARDING-GUARD-01: Show error + retry instead of blind redirect.
      // The old catch-all redirect caused a loop: guard → onboarding → same API fails
      // → blank form (user thinks they lost their data).
      setState('error');
    }
  };

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (state === 'redirect') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center p-8 max-w-sm">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-neutral-700 mb-4">
            Σφάλμα φόρτωσης. Παρακαλώ δοκιμάστε ξανά.
          </p>
          <button
            onClick={() => { setState('loading'); checkOnboardingStatus(); }}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            data-testid="retry-button"
          >
            Δοκιμάστε ξανά
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {state === 'pending' && (
        <div
          className="bg-yellow-50 border-b border-yellow-200"
          data-testid="pending-review-banner"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-yellow-600 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-yellow-800">
                <strong>Τα στοιχεία σας ελέγχονται.</strong> Ετοιμάστε τα προϊόντα σας —
                θα εμφανιστούν μόλις εγκριθείτε.
              </p>
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  );
}
