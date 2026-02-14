'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ProducerProfile {
  id: number;
  status: string;
  business_name?: string;
  rejection_reason?: string | null;
}

export default function ProducerOnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState<ProducerProfile | null>(null);

  const [form, setForm] = useState({
    business_name: '',
    phone: '',
    city: '',
    region: '',
    description: '',
    tax_id: '',
  });

  // Check auth + load existing profile
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (user?.role !== 'producer') {
      router.push('/');
      return;
    }
    loadProfile();
  }, [isAuthenticated, user]);

  const loadProfile = async () => {
    try {
      const data = await apiClient.getProducerMe();
      if (data.has_profile && data.producer) {
        setProfile(data.producer as ProducerProfile);
        // If already active, go to dashboard
        if (data.producer.status === 'active') {
          router.push('/producer/dashboard');
          return;
        }
      }
    } catch {
      // No profile yet — show form (this is expected for new registrations)
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.business_name || !form.phone || !form.city) {
      setError('Συμπληρώστε τα υποχρεωτικά πεδία (Επωνυμία, Τηλέφωνο, Πόλη)');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await apiClient.updateProducerProfile(form);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Κάτι πήγε στραβά. Δοκιμάστε ξανά.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Rejected state
  if (profile?.status === 'inactive' && profile.rejection_reason) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4" data-testid="page-title">
              Ενημέρωση Αίτησης
            </h1>
            <div className="border rounded-lg p-6 bg-red-50 border-red-200 text-red-800">
              <h3 className="font-semibold text-lg mb-2">Η αίτησή σας δεν εγκρίθηκε</h3>
              <p className="mb-2"><strong>Λόγος:</strong> {profile.rejection_reason}</p>
              <p>
                Για περισσότερες πληροφορίες, επικοινωνήστε μαζί μας στο{' '}
                <a href="mailto:info@dixis.gr" className="underline font-medium">info@dixis.gr</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pending state — already submitted
  if (profile?.status === 'pending' && (success || profile.business_name)) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4" data-testid="page-title">
              Γίνετε Παραγωγός
            </h1>
            <div className="border rounded-lg p-6 bg-yellow-50 border-yellow-200 text-yellow-800" data-testid="pending-banner">
              <h3 className="font-semibold text-lg mb-2">Η αίτησή σας βρίσκεται υπό έλεγχο</h3>
              <p>
                Θα σας ειδοποιήσουμε μόλις η αίτησή σας εγκριθεί.
                Μπορείτε να δείτε το dashboard σας, αλλά η προσθήκη προϊόντων
                θα ενεργοποιηθεί μετά την έγκριση.
              </p>
            </div>
            <button
              onClick={() => router.push('/producer/dashboard')}
              className="mt-6 w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Μετάβαση στο Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success just submitted
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4" data-testid="page-title">
              Γίνετε Παραγωγός
            </h1>
            <div className="border rounded-lg p-6 bg-green-50 border-green-200 text-green-800" data-testid="success-banner">
              <h3 className="font-semibold text-lg mb-2">Τα στοιχεία σας καταχωρήθηκαν!</h3>
              <p>
                Η αίτησή σας βρίσκεται υπό έλεγχο.
                Θα σας ειδοποιήσουμε μόλις εγκριθεί.
              </p>
            </div>
            <button
              onClick={() => router.push('/producer/dashboard')}
              className="mt-6 w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Μετάβαση στο Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form state — show onboarding form
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2" data-testid="page-title">
            Γίνετε Παραγωγός
          </h1>
          <p className="text-gray-600 mb-6">
            Συμπληρώστε τα στοιχεία σας για να ξεκινήσετε να πουλάτε στο Dixis.
          </p>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-6" data-testid="form-error">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" data-testid="onboarding-form">
            <div>
              <label htmlFor="business_name" className="block text-sm font-medium text-gray-700">
                Επωνυμία Επιχείρησης <span className="text-red-500">*</span>
              </label>
              <input
                id="business_name"
                name="business_name"
                type="text"
                required
                value={form.business_name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="π.χ. Αγρόκτημα Παπαδόπουλου"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Τηλέφωνο <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={form.phone}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="69XXXXXXXX"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  Πόλη <span className="text-red-500">*</span>
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  value={form.city}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="π.χ. Ηράκλειο"
                />
              </div>
              <div>
                <label htmlFor="region" className="block text-sm font-medium text-gray-700">
                  Περιφέρεια
                </label>
                <select
                  id="region"
                  name="region"
                  value={form.region}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Επιλέξτε...</option>
                  <option value="Αττική">Αττική</option>
                  <option value="Κεντρική Μακεδονία">Κεντρική Μακεδονία</option>
                  <option value="Δυτική Μακεδονία">Δυτική Μακεδονία</option>
                  <option value="Ανατολική Μακεδονία και Θράκη">Αν. Μακεδονία και Θράκη</option>
                  <option value="Ήπειρος">Ήπειρος</option>
                  <option value="Θεσσαλία">Θεσσαλία</option>
                  <option value="Ιόνια Νησιά">Ιόνια Νησιά</option>
                  <option value="Δυτική Ελλάδα">Δυτική Ελλάδα</option>
                  <option value="Στερεά Ελλάδα">Στερεά Ελλάδα</option>
                  <option value="Πελοπόννησος">Πελοπόννησος</option>
                  <option value="Βόρειο Αιγαίο">Βόρειο Αιγαίο</option>
                  <option value="Νότιο Αιγαίο">Νότιο Αιγαίο</option>
                  <option value="Κρήτη">Κρήτη</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Περιγραφή Επιχείρησης
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Πείτε μας λίγα λόγια για την επιχείρησή σας..."
              />
            </div>

            <div>
              <label htmlFor="tax_id" className="block text-sm font-medium text-gray-700">
                ΑΦΜ <span className="text-gray-400 text-xs">(προαιρετικό)</span>
              </label>
              <input
                id="tax_id"
                name="tax_id"
                type="text"
                value={form.tax_id}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="9 ψηφία"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              data-testid="onboarding-submit"
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? 'Υποβολή...' : 'Υποβολή Αίτησης'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
