'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Παρακαλώ συμπληρώστε όλα τα πεδία');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔐 Starting login process...', { email });
      await login(email, password);
      console.log('✅ Login successful, redirecting to home...');
      
      // Small delay to ensure toast renders before redirect
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Redirect to home page after successful login
      router.push('/');
    } catch (err) {
      console.error('❌ Login failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      
      // Set inline error display for form
      setError(errorMessage);
      // Note: Toast error is already handled by AuthContext
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
            Σύνδεση στον Λογαριασμό σας
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Ή{' '}
            <Link
              href="/auth/register"
              className="font-medium text-green-600 hover:text-green-500"
            >
              δημιουργήστε νέο λογαριασμό
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
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Διεύθυνση Email
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
                  placeholder="Εισάγετε το email σας"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Κωδικός Πρόσβασης
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
                  placeholder="Εισάγετε τον κωδικό σας"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                data-testid="login-submit"
                className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading && (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {loading ? 'Σύνδεση...' : 'Σύνδεση'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="text-center">
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-green-600"
              >
                ← Πίσω στα Προϊόντα
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}