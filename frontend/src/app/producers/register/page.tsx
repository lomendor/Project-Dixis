'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface Category {
  id: string;
  slug: string;
  name: string;
  icon?: string;
}

interface ProducerStatus {
  status: 'pending' | 'active' | 'inactive' | null;
  profile?: {
    id: string;
    name: string;
    approvalStatus: string;
    rejectionReason?: string;
  };
  profileExists: boolean;
}

/**
 * Pass AUTH-UNIFICATION-01: Producer registration page
 * Requires authenticated consumer to register as producer
 */
export default function ProducerRegisterPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, loading: authLoading, user } = useAuth();

  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    region: '',
    category: '',
    description: '',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [existingStatus, setExistingStatus] = useState<ProducerStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch categories
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.categories || []))
      .catch(err => console.error('Failed to fetch categories:', err));
  }, []);

  // Check existing producer status
  useEffect(() => {
    if (!isHydrated || authLoading) return;

    if (!isAuthenticated) {
      // Will redirect in the render
      setCheckingStatus(false);
      return;
    }

    fetch('/api/producer/status', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setExistingStatus(data);
        if (data.profile) {
          // Pre-fill form with existing data
          setFormData(prev => ({
            ...prev,
            displayName: data.profile.name || '',
            email: data.profile.email || '',
            region: data.profile.region || '',
            category: data.profile.category || '',
            description: data.profile.description || '',
          }));
        }
      })
      .catch(err => console.error('Failed to check producer status:', err))
      .finally(() => setCheckingStatus(false));
  }, [isAuthenticated, isHydrated, authLoading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/producer/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Παρουσιάστηκε σφάλμα');
        return;
      }

      setSuccess(true);
    } catch {
      setError('Σφάλμα δικτύου. Δοκιμάστε ξανά.');
    } finally {
      setLoading(false);
    }
  }

  // Show loading state while checking auth
  if (!isHydrated || authLoading || checkingStatus) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </main>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-md mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Απαιτείται Σύνδεση
          </h1>
          <p className="text-gray-600 mb-8">
            Για να γίνεις παραγωγός, πρέπει πρώτα να συνδεθείς.
          </p>
          <Link
            href={`/auth/login?from=${encodeURIComponent('/producers/register')}`}
            className="inline-flex h-12 px-8 rounded-full bg-green-600 text-white font-semibold items-center hover:bg-green-700 transition-colors"
          >
            Σύνδεση →
          </Link>
        </div>
      </main>
    );
  }

  // Show existing application status
  if (existingStatus?.profileExists && existingStatus.profile) {
    const { approvalStatus, rejectionReason } = existingStatus.profile;

    if (approvalStatus === 'approved') {
      return (
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-md mx-auto px-4 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Καλώς ήρθες Παραγωγέ!
            </h1>
            <p className="text-gray-600 mb-8">
              Η αίτησή σου έχει εγκριθεί. Μπορείς να διαχειριστείς τα προϊόντα σου.
            </p>
            <Link
              href="/producer/dashboard"
              className="inline-flex h-12 px-8 rounded-full bg-green-600 text-white font-semibold items-center hover:bg-green-700 transition-colors"
            >
              Πάμε στο Dashboard →
            </Link>
          </div>
        </main>
      );
    }

    if (approvalStatus === 'pending') {
      return (
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-md mx-auto px-4 text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Η αίτησή σου είναι υπό εξέταση
            </h1>
            <p className="text-gray-600 mb-4">
              Ευχαριστούμε για την αίτησή σου! Η ομάδα μας θα την εξετάσει σύντομα.
            </p>
            <p className="text-sm text-gray-500">
              Θα λάβεις ειδοποίηση μόλις εγκριθεί.
            </p>
            <div className="mt-8">
              <Link
                href="/"
                className="text-green-600 hover:underline"
              >
                ← Επιστροφή στην αρχική
              </Link>
            </div>
          </div>
        </main>
      );
    }

    if (approvalStatus === 'rejected') {
      return (
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-md mx-auto px-4 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Η αίτηση απορρίφθηκε
            </h1>
            {rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-700 text-sm">{rejectionReason}</p>
              </div>
            )}
            <p className="text-gray-600 mb-8">
              Μπορείς να υποβάλεις νέα αίτηση με ενημερωμένα στοιχεία.
            </p>
            <button
              onClick={() => setExistingStatus(null)}
              className="inline-flex h-12 px-8 rounded-full bg-green-600 text-white font-semibold items-center hover:bg-green-700 transition-colors"
            >
              Νέα Αίτηση →
            </button>
          </div>
        </main>
      );
    }
  }

  // Show success state
  if (success) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Η αίτηση υποβλήθηκε!
          </h1>
          <p className="text-gray-600 mb-8">
            Ευχαριστούμε! Η ομάδα μας θα εξετάσει την αίτησή σου σύντομα.
          </p>
          <Link
            href="/"
            className="inline-flex h-12 px-8 rounded-full bg-green-600 text-white font-semibold items-center hover:bg-green-700 transition-colors"
          >
            Επιστροφή στην Αρχική →
          </Link>
        </div>
      </main>
    );
  }

  // Show registration form
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Γίνε Παραγωγός στο Dixis
          </h1>
          <p className="text-gray-600 mt-2">
            Συνδεδεμένος ως: <span className="font-medium">{user?.name}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8">
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-6">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Display Name */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                Όνομα Επιχείρησης / Παραγωγού *
              </label>
              <input
                type="text"
                id="displayName"
                required
                value={formData.displayName}
                onChange={e => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="π.χ. Αγρόκτημα Παπαδόπουλου"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email επικοινωνίας
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="email@example.com"
              />
            </div>

            {/* Region */}
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                Περιοχή / Τοποθεσία
              </label>
              <input
                type="text"
                id="region"
                value={formData.region}
                onChange={e => setFormData(prev => ({ ...prev, region: e.target.value }))}
                className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="π.χ. Λήμνος, Βόρειο Αιγαίο"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Κατηγορία Προϊόντων
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Επιλέξτε κατηγορία</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
                <option value="other">Άλλο</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Περιγραφή
              </label>
              <textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Πες μας λίγα λόγια για εσένα και τα προϊόντα σου..."
              />
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-full bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {loading ? 'Υποβολή...' : 'Υποβολή Αίτησης'}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            Με την υποβολή αποδέχεστε τους{' '}
            <Link href="/terms" className="text-green-600 hover:underline">
              Όρους Χρήσης
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
