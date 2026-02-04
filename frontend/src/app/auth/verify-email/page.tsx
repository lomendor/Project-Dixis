'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from '@/contexts/LocaleContext';
import { API_BASE_URL } from '@/env';

type VerificationState = 'loading' | 'success' | 'error' | 'expired' | 'missing';

/**
 * Pass EMAIL-VERIFY-01: Email verification form component.
 *
 * Reads token and email from URL query params, calls verify endpoint.
 */
function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const t = useTranslations();

  const [state, setState] = useState<VerificationState>('loading');
  const [message, setMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!token || !email) {
      setState('missing');
      setMessage(t('auth.verifyEmail.missingParams'));
      return;
    }

    verifyEmail();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, email]);

  const verifyEmail = async () => {
    try {
      setState('loading');

      // SSOT: Use centralized API_BASE_URL (already includes /api/v1)
      const response = await fetch(`${API_BASE_URL}/auth/email/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ token, email }),
      });

      const data = await response.json();

      if (response.ok) {
        setState('success');
        setMessage(data.message || t('auth.verifyEmail.success'));
      } else if (data.message?.includes('expired')) {
        setState('expired');
        setMessage(data.message || t('auth.verifyEmail.expired'));
      } else {
        setState('error');
        setMessage(data.message || t('auth.verifyEmail.error'));
      }
    } catch {
      setState('error');
      setMessage(t('auth.verifyEmail.error'));
    }
  };

  const handleResend = async () => {
    if (!email) return;

    try {
      setResendLoading(true);

      const response = await fetch(`${API_BASE_URL}/auth/email/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setResendSuccess(true);
      }
    } catch {
      // Silent fail - don't reveal if email exists
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold text-green-600">
            Dixis
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-gray-900" data-testid="page-title">
            {t('auth.verifyEmail.title')}
          </h1>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Loading State */}
          {state === 'loading' && (
            <div className="text-center" data-testid="verify-loading">
              <svg
                className="animate-spin h-12 w-12 text-green-600 mx-auto"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="mt-4 text-gray-600">{t('auth.verifyEmail.verifying')}</p>
            </div>
          )}

          {/* Success State */}
          {state === 'success' && (
            <div className="text-center" data-testid="verify-success">
              <div className="rounded-full bg-green-100 p-3 mx-auto w-fit">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="mt-4 text-lg font-medium text-gray-900">
                {t('auth.verifyEmail.successTitle')}
              </h2>
              <p className="mt-2 text-sm text-gray-600">{message}</p>
              <Link
                href="/auth/login"
                data-testid="login-link"
                className="mt-6 inline-block w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                {t('auth.verifyEmail.goToLogin')}
              </Link>
            </div>
          )}

          {/* Expired State */}
          {state === 'expired' && (
            <div className="text-center" data-testid="verify-expired">
              <div className="rounded-full bg-yellow-100 p-3 mx-auto w-fit">
                <svg
                  className="h-8 w-8 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="mt-4 text-lg font-medium text-gray-900">
                {t('auth.verifyEmail.expiredTitle')}
              </h2>
              <p className="mt-2 text-sm text-gray-600">{message}</p>

              {resendSuccess ? (
                <div className="mt-4 rounded-md bg-green-50 p-4">
                  <p className="text-sm text-green-700">
                    {t('auth.verifyEmail.resendSuccess')}
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resendLoading}
                  data-testid="resend-button"
                  className="mt-4 inline-flex items-center justify-center gap-2 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
                >
                  {resendLoading && (
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  )}
                  {t('auth.verifyEmail.resendButton')}
                </button>
              )}
            </div>
          )}

          {/* Error State */}
          {state === 'error' && (
            <div className="text-center" data-testid="verify-error">
              <div className="rounded-full bg-red-100 p-3 mx-auto w-fit">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="mt-4 text-lg font-medium text-gray-900">
                {t('auth.verifyEmail.errorTitle')}
              </h2>
              <p className="mt-2 text-sm text-gray-600">{message}</p>
              <Link
                href="/auth/login"
                className="mt-6 inline-block text-sm font-medium text-green-600 hover:text-green-500"
              >
                {t('auth.verifyEmail.backToLogin')}
              </Link>
            </div>
          )}

          {/* Missing Params State */}
          {state === 'missing' && (
            <div className="text-center" data-testid="verify-missing">
              <div className="rounded-full bg-gray-100 p-3 mx-auto w-fit">
                <svg
                  className="h-8 w-8 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="mt-4 text-lg font-medium text-gray-900">
                {t('auth.verifyEmail.missingTitle')}
              </h2>
              <p className="mt-2 text-sm text-gray-600">{message}</p>
              <Link
                href="/auth/login"
                className="mt-6 inline-block text-sm font-medium text-green-600 hover:text-green-500"
              >
                {t('auth.verifyEmail.backToLogin')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Pass EMAIL-VERIFY-01: Email verification page wrapper.
 *
 * Wraps the form in Suspense as required by Next.js for useSearchParams.
 */
export default function VerifyEmail() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
