'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/contexts/LocaleContext';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const t = useTranslations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError(t('auth.login.fillAllFields'));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/v1/auth/password/forgot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Request failed');
      }

      setSuccess(true);
    } catch (err) {
      console.error('Forgot password failed:', err);
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
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
            {t('auth.forgotPassword.title')}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {t('auth.forgotPassword.subtitle')}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {success ? (
            <div className="text-center">
              <div className="rounded-md bg-green-50 p-4 mb-6" data-testid="success-message">
                <div className="text-sm text-green-700">
                  {t('auth.forgotPassword.success')}
                </div>
              </div>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-green-600 hover:text-green-500"
              >
                {t('auth.forgotPassword.backToLogin')}
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit} data-testid="forgot-password-form">
              {error && (
                <div className="rounded-md bg-red-50 p-4" data-testid="error-message" role="alert">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {t('auth.forgotPassword.email')}
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-testid="forgot-password-email"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder={t('auth.forgotPassword.emailPlaceholder')}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  data-testid="forgot-password-submit"
                  className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading && (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {loading ? t('auth.forgotPassword.submitting') : t('auth.forgotPassword.submit')}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6">
            <div className="text-center">
              <Link
                href="/auth/login"
                className="text-sm text-gray-600 hover:text-green-600"
              >
                {t('auth.forgotPassword.backToLogin')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
