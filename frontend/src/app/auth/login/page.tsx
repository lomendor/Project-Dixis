'use client';

import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from '@/contexts/LocaleContext';

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const { login, loading, isAuthenticated, user } = useAuth();

  // Support both 'from' and 'redirect' params
  const redirectTo = searchParams.get('redirect') || searchParams.get('from') || null;

  // Redirect if already authenticated - use role-based routing
  useEffect(() => {
    if (isAuthenticated && user) {
      // If explicit redirect specified, use it (e.g., /admin)
      if (redirectTo) {
        router.push(redirectTo);
        return;
      }
      // Otherwise, role-based default routing
      if (user.role === 'admin') {
        router.push('/admin');
      } else if (user.role === 'producer') {
        router.push('/producer/dashboard');
      } else {
        router.push('/');
      }
    }
  }, [isAuthenticated, user, router, redirectTo]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError(t('auth.login.fillAllFields'));
      return;
    }

    setError(null);

    try {
      await login(email, password);
      // Success - useEffect will handle role-based redirect when user state updates
    } catch (err) {
      console.error('❌ Login failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Η σύνδεση απέτυχε';
      setError(errorMessage);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold text-green-600">
            Dixis
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-gray-900" data-testid="page-title">
            {t('auth.login.title')}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {t('auth.login.subtitle')}{' '}
            <Link
              href="/auth/register"
              className="font-medium text-green-600 hover:text-green-500"
            >
              {t('auth.login.createAccount')}
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit} data-testid="login-form">
            {error && (
              <div className="rounded-md bg-red-50 p-4" role="alert" data-testid="error-toast">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('auth.login.email')}
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
                  data-testid="login-email"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder={t('auth.login.emailPlaceholder')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('auth.login.password')}
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="login-password"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder={t('auth.login.passwordPlaceholder')}
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-green-600 hover:text-green-500"
              >
                Ξεχάσατε τον κωδικό σας;
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              data-testid="login-submit"
              className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading && <LoadingSpinner />}
              {loading ? t('auth.login.submitting') : t('auth.login.submit')}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-green-600"
              >
                ← {t('auth.login.backToProducts')}
              </Link>
            </div>
          </div>

          {/* OTP fallback for existing phone-only users */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">
                Έχετε λογαριασμό με κινητό τηλέφωνο;
              </p>
              <Link
                href="/auth/login-otp"
                className="text-sm text-gray-600 hover:text-green-600"
              >
                Σύνδεση με OTP →
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><LoadingSpinner /></div>}>
      <LoginContent />
    </Suspense>
  );
}
