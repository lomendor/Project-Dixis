'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'consumer' as 'consumer' | 'producer',
  });
  const [error, setError] = useState<string | null>(null);
  const { register, registerLoading, isAuthenticated, user, getIntendedDestination, clearIntendedDestination } = useAuth();
  const { showSuccess, showError } = useToast();
  const router = useRouter();

  // Redirect authenticated users away from register page
  useEffect(() => {
    if (isAuthenticated && user) {
      const intendedDestination = getIntendedDestination?.();
      clearIntendedDestination?.();
      
      // PRODUCER-ONBOARD-01: New producers go to onboarding, not dashboard
      const destination = intendedDestination && intendedDestination !== '/'
        ? intendedDestination
        : user.role === 'producer'
          ? '/producer/onboarding'
          : '/';
      
      router.push(destination);
    }
  }, [isAuthenticated, user, router, getIntendedDestination, clearIntendedDestination]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation with Greek messages
    if (!formData.name || !formData.email || !formData.password) {
      const message = 'Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία';
      setError(message);
      showError(message);
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      const message = 'Οι κωδικοί δεν ταιριάζουν';
      setError(message);
      showError(message);
      return;
    }

    if (formData.password.length < 8) {
      const message = 'Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες';
      setError(message);
      showError(message);
      return;
    }

    try {
      setError(null);
      await register(formData);
      // Success message is now handled in AuthContext with Greek text
    } catch (err) {
      console.error('❌ Registration failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Η εγγραφή απέτυχε';
      setError(errorMessage);
      // Error toast is already shown by AuthContext
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
            Δημιουργία Λογαριασμού
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Ή{' '}
            <Link
              href="/auth/login"
              className="font-medium text-green-600 hover:text-green-500"
            >
              συνδεθείτε στον υπάρχοντα λογαριασμό σας
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit} data-testid="register-form">
            {error && (
              <div className="rounded-md bg-red-50 p-4" data-testid="register-error">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Ονοματεπώνυμο
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  data-testid="register-name"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Εισάγετε το ονοματεπώνυμό σας"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  data-testid="register-email"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Εισάγετε το email σας"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Τύπος Λογαριασμού
              </label>
              <div className="mt-1">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  data-testid="register-role"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="consumer">Καταναλωτής (Αγορά προϊόντων)</option>
                  <option value="producer">Παραγωγός (Πώληση προϊόντων)</option>
                </select>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Επιλέξτε &ldquo;Καταναλωτής&rdquo; για αγορά ή &ldquo;Παραγωγός&rdquo; για πώληση προϊόντων
              </p>
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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  data-testid="register-password"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Δημιουργήστε έναν κωδικό"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες
              </p>
            </div>

            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                Επιβεβαίωση Κωδικού
              </label>
              <div className="mt-1">
                <input
                  id="password_confirmation"
                  name="password_confirmation"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  data-testid="register-password-confirm"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Επιβεβαιώστε τον κωδικό σας"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={registerLoading}
                data-testid="register-submit"
                className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {registerLoading && (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {registerLoading ? 'Δημιουργία λογαριασμού...' : 'Δημιουργία Λογαριασμού'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="text-center">
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-green-600"
              >
                ← Επιστροφή στα Προϊόντα
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}