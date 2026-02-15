'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from '@/contexts/LocaleContext';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();

  // Strategic Fix 2B: Read redirect param set by middleware
  const redirectTo = searchParams.get('redirect') || '/';

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError(t('auth.login.fillAllFields'));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await login(email, password);

      // Small delay to ensure toast renders before redirect
      await new Promise(resolve => setTimeout(resolve, 100));

      // Strategic Fix 2B: Redirect to intended destination (from middleware) or home
      router.push(redirectTo);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';

      // Set inline error display for form
      setError(errorMessage);
      // Note: Toast error is already handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold text-primary">
            Dixis
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-neutral-900" data-testid="page-title">
            {t('auth.login.title')}
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            {t('auth.login.subtitle')}{' '}
            <Link
              href="/auth/register"
              className="font-medium text-primary hover:text-primary-light"
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
              <div className="rounded-md bg-red-50 p-4" data-testid="error-toast" role="alert">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
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
                  className="appearance-none block w-full px-3 py-2 border border-neutral-300 rounded-md placeholder-neutral-400 focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder={t('auth.login.emailPlaceholder')}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                  {t('auth.login.password')}
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary hover:text-primary-light"
                  data-testid="forgot-password-link"
                >
                  {t('auth.forgotPassword.title')}
                </Link>
              </div>
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
                  className="appearance-none block w-full px-3 py-2 border border-neutral-300 rounded-md placeholder-neutral-400 focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder={t('auth.login.passwordPlaceholder')}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                data-testid="login-submit"
                className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-neutral-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading && (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {loading ? t('auth.login.submitting') : t('auth.login.submit')}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="text-center">
              <Link
                href="/"
                className="text-sm text-neutral-600 hover:text-primary"
              >
                ← {t('auth.login.backToProducts')}
              </Link>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-neutral-200">
            <div className="text-center">
              <Link
                href="/auth/admin-login"
                className="text-sm text-neutral-600 hover:text-primary"
              >
                Είσοδος Διαχειριστή
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Strategic Fix 2B: Suspense wrapper required for useSearchParams() in Next.js 15.
 * The middleware sets ?redirect=/original/path when redirecting to login.
 */
export default function Login() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
