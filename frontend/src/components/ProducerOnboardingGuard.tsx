'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';

type GuardState = 'loading' | 'active' | 'pending' | 'redirect';

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
      // API error — redirect to onboarding as safest fallback
      router.replace('/producer/onboarding');
      setState('redirect');
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
