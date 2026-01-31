'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AuthGuard from '@/components/AuthGuard';

interface OnboardingFormData {
  displayName: string;
  taxId: string;
  phone: string;
  acceptTerms: boolean;
}

interface ProducerStatus {
  status: 'pending' | 'active' | 'inactive' | null;
  submittedAt?: string;
}

export default function ProducerOnboardingPage() {
  return (
    <AuthGuard requireAuth={true}>
      <ProducerOnboardingContent />
    </AuthGuard>
  );
}

function ProducerOnboardingContent() {
  const { user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState<OnboardingFormData>({
    displayName: '',
    taxId: '',
    phone: '',
    acceptTerms: false,
  });

  const [producerStatus, setProducerStatus] = useState<ProducerStatus>({
    status: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Load current producer status on mount
  useEffect(() => {
    if (user?.id) {
      loadProducerStatus();
    }
  }, [user?.id]);

  const loadProducerStatus = async () => {
    try {
      const response = await fetch('/api/producer/status');
      if (response.ok) {
        const data = await response.json();
        setProducerStatus(data);

        // Pre-fill form if producer profile exists
        if (data.profile) {
          setFormData({
            displayName: data.profile.name || '',
            taxId: data.profile.tax_id || '',
            phone: data.profile.phone || '',
            acceptTerms: true, // Assumed already accepted if profile exists
          });
        }
      }
    } catch (err) {
      console.error('Failed to load producer status:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.displayName.trim()) {
      setError('Το όνομα εμφάνισης είναι υποχρεωτικό');
      return;
    }

    if (!formData.acceptTerms) {
      setError('Πρέπει να αποδεχτείτε τους όρους χρήσης');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/producer/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: formData.displayName.trim(),
          taxId: formData.taxId.trim(),
          phone: formData.phone.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Η αίτηση υποβλήθηκε επιτυχώς! Θα ελέγξουμε τα στοιχεία σας και θα ενημερωθείτε σύντομα.');
        setProducerStatus({ status: 'pending', submittedAt: new Date().toISOString() });
      } else {
        setError(data.error || 'Παρουσιάστηκε σφάλμα κατά την υποβολή');
      }
    } catch {
      setError('Παρουσιάστηκε σφάλμα δικτύου');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof OnboardingFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear error on input change
  };

  const renderStatusBanner = () => {
    if (!producerStatus.status) return null;

    const statusConfig = {
      pending: {
        className: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        icon: '⏳',
        title: 'Ολοκληρώστε το Προφίλ σας',
        message: 'Το προφίλ σας δεν έχει ενεργοποιηθεί ακόμα. Συμπληρώστε τα στοιχεία σας για να ξεκινήσετε.'
      },
      active: {
        className: 'bg-green-50 border-green-200 text-green-800',
        icon: '✅',
        title: 'Ενεργός Παραγωγός',
        message: 'Καλώς ήρθατε! Μπορείτε να διαχειρίζεστε τα προϊόντα σας.'
      },
      inactive: {
        className: 'bg-red-50 border-red-200 text-red-800',
        icon: '❌',
        title: 'Λογαριασμός Ανενεργός',
        message: 'Ο λογαριασμός σας είναι προσωρινά ανενεργός. Επικοινωνήστε μαζί μας για περισσότερες πληροφορίες.'
      }
    };

    const config = statusConfig[producerStatus.status];

    return (
      <div className={`border rounded-lg p-4 mb-6 ${config.className}`} data-testid="status-banner">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <h3 className="font-semibold text-lg" data-testid="status-title">{config.title}</h3>
            <p className="mt-1" data-testid="status-message">{config.message}</p>
            {producerStatus.submittedAt && (
              <p className="mt-2 text-sm opacity-75">
                Υποβολή: {new Date(producerStatus.submittedAt).toLocaleDateString('el-GR')}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // If producer is already approved, show success state and link to products
  if (producerStatus.status === 'active') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6" data-testid="page-title">
              Επιβεβαίωση Παραγωγού
            </h1>

            {renderStatusBanner()}

            <div className="space-y-4">
              <button
                onClick={() => router.push('/producer/products')}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
                data-testid="goto-products-btn"
              >
                Διαχείριση Προϊόντων
              </button>

              <button
                onClick={() => router.push('/producer/dashboard')}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                data-testid="goto-dashboard-btn"
              >
                Πίνακας Ελέγχου
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2" data-testid="page-title">
            Αίτηση Παραγωγού
          </h1>
          <p className="text-gray-600 mb-6">
            Συμπληρώστε τα στοιχεία σας για να γίνετε πιστοποιημένος παραγωγός στην πλατφόρμα μας.
          </p>

          {renderStatusBanner()}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4" data-testid="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4" data-testid="success-message">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="onboarding-form">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                Όνομα Εμφάνισης *
              </label>
              <input
                type="text"
                id="displayName"
                required
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="π.χ. Αγρόκτημα Παπαδόπουλος"
                data-testid="display-name-input"
                disabled={loading || producerStatus.status === 'pending'}
              />
            </div>

            <div>
              <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-2">
                ΑΦΜ (προαιρετικό)
              </label>
              <input
                type="text"
                id="taxId"
                value={formData.taxId}
                onChange={(e) => handleInputChange('taxId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="π.χ. 123456789"
                data-testid="tax-id-input"
                disabled={loading || producerStatus.status === 'pending'}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Τηλέφωνο (προαιρετικό)
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="π.χ. +30 210 1234567"
                data-testid="phone-input"
                disabled={loading || producerStatus.status === 'pending'}
              />
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={formData.acceptTerms}
                onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                data-testid="accept-terms-checkbox"
                disabled={loading || producerStatus.status === 'pending'}
              />
              <label htmlFor="acceptTerms" className="text-sm text-gray-700">
                Συμφωνώ με τους{' '}
                <a href="/terms" target="_blank" className="text-green-600 hover:text-green-500 underline">
                  όρους χρήσης
                </a>{' '}
                και την{' '}
                <a href="/privacy" target="_blank" className="text-green-600 hover:text-green-500 underline">
                  πολιτική απορρήτου
                </a>
              </label>
            </div>

            {producerStatus.status !== 'pending' && (
              <button
                type="submit"
                disabled={loading || !formData.acceptTerms}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                data-testid="submit-btn"
              >
                {loading ? 'Υποβολή...' : 'Υποβολή Αίτησης'}
              </button>
            )}
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Έχετε ήδη λογαριασμό παραγωγού;{' '}
              <button
                onClick={() => router.push('/producer/dashboard')}
                className="text-green-600 hover:text-green-500 underline"
                data-testid="goto-dashboard-link"
              >
                Πίνακας Ελέγχου
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}