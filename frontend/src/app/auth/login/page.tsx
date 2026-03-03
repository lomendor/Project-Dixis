'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from '@/contexts/LocaleContext';

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ) : (
    <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );
}

/**
 * Validate redirect URL to prevent open redirect attacks.
 * Only allows relative paths starting with '/'.
 */
function safeRedirect(url: string | null): string {
  if (!url) return '/';
  // Block absolute URLs, protocol-relative URLs, and data: URIs
  if (url.startsWith('//') || url.includes('://') || url.startsWith('data:')) return '/';
  // Only allow paths starting with /
  if (!url.startsWith('/')) return '/';
  return url;
}

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();

  // Strategic Fix 2B: Read redirect param set by middleware
  const redirectTo = safeRedirect(searchParams.get('redirect'));

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
      const errorMessage = err instanceof Error ? err.message : 'Η σύνδεση απέτυχε';

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
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="login-password"
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-neutral-300 rounded-md placeholder-neutral-400 focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder={t('auth.login.passwordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Απόκρυψη κωδικού' : 'Εμφάνιση κωδικού'}
                >
                  <EyeIcon open={showPassword} />
                </button>
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
