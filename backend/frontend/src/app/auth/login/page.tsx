'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Guard: Redirect authenticated users away from login page
  useEffect(() => {
    if (!authLoading && user) {
      // Check for intended destination first
      const intended = typeof window !== 'undefined'
        ? sessionStorage.getItem('intended_destination')
        : null;
      
      if (intended) {
        sessionStorage.removeItem('intended_destination');
        router.push(intended);
        return;
      }
      
      // Role-based redirect
      router.push(user.role === 'producer' ? '/producer/dashboard' : '/');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔐 Starting login process...', { email });
      await login(email, password);
      console.log('✅ Login successful, checking redirect...');
      
      // Small delay to ensure toast renders before redirect
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 1) Smart redirect - check for intended destination
      const intended = typeof window !== 'undefined'
        ? sessionStorage.getItem('intended_destination')
        : null;
      
      if (intended) {
        console.log('🔄 Redirecting to intended destination:', intended);
        sessionStorage.removeItem('intended_destination');
        router.push(intended);
        return;
      }
      
      // 2) Role-based redirect - get fresh user profile
      const userProfile = await apiClient.getProfile().catch(() => null);
      
      if (userProfile?.role === 'producer') {
        console.log('🏪 Redirecting producer to dashboard');
        router.push('/producer/dashboard');
      } else {
        console.log('🏠 Redirecting consumer to home');
        router.push('/');
      }
    } catch (err) {
      console.error('❌ Login failed:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold text-green-600">
            Project Dixis
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link
              href="/auth/register"
              className="font-medium text-green-600 hover:text-green-500"
            >
              create a new account
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
                Email address
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
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
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
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                data-testid="login-submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="text-center">
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-green-600"
              >
                ← Back to Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}