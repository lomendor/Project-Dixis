'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';

interface SettingsFormData {
  name: string;
  business_name: string;
  slug: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  postal_code: string;
  region: string;
  location: string;
  tax_id: string;
  tax_office: string;
  social_media: string[];
  // Pass PRODUCER-THRESHOLD-POSTALCODE-01: Per-producer free shipping threshold
  free_shipping_threshold_eur: string; // String for form input, converted on submit
}

export default function ProducerSettingsPage() {
  return (
    <AuthGuard requireAuth={true} requireRole="producer">
      <ProducerSettingsContent />
    </AuthGuard>
  );
}

function ProducerSettingsContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState<SettingsFormData>({
    name: '',
    business_name: '',
    slug: '',
    description: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    postal_code: '',
    region: '',
    location: '',
    tax_id: '',
    tax_office: '',
    social_media: [''],
    free_shipping_threshold_eur: '', // Empty means use system default
  });

  // Load current producer data
  useEffect(() => {
    fetch('/api/v1/producer/me')
      .then((r) => r.json())
      .then((data) => {
        const producer = data.producer;
        setFormData({
          name: producer.name || '',
          business_name: producer.business_name || '',
          slug: producer.slug || '',
          description: producer.description || '',
          email: producer.email || '',
          phone: producer.phone || '',
          website: producer.website || '',
          address: producer.address || '',
          city: producer.city || '',
          postal_code: producer.postal_code || '',
          region: producer.region || '',
          location: producer.location || '',
          tax_id: producer.tax_id || '',
          tax_office: producer.tax_office || '',
          social_media: producer.social_media && producer.social_media.length > 0
            ? producer.social_media
            : [''],
          // Pass PRODUCER-THRESHOLD-POSTALCODE-01: Load per-producer threshold
          free_shipping_threshold_eur: producer.free_shipping_threshold_eur != null
            ? String(producer.free_shipping_threshold_eur)
            : '',
        });
        setLoading(false);
      })
      .catch(() => {
        setError('Σφάλμα φόρτωσης προφίλ');
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setBusy(true);

    try {
      // Filter out empty social media links and convert threshold to number or null
      const cleanedData = {
        ...formData,
        social_media: formData.social_media.filter((link) => link.trim() !== ''),
        // Pass PRODUCER-THRESHOLD-POSTALCODE-01: Convert threshold to number or null
        free_shipping_threshold_eur: formData.free_shipping_threshold_eur.trim() !== ''
          ? parseFloat(formData.free_shipping_threshold_eur)
          : null,
      };

      const response = await fetch('/api/v1/producer/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Αποτυχία ενημέρωσης');
      }

      setSuccess('Οι αλλαγές αποθηκεύτηκαν επιτυχώς');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Σφάλμα ενημέρωσης');
    } finally {
      setBusy(false);
    }
  };

  // Social media link handlers
  const addSocialLink = () => {
    setFormData((prev) => ({
      ...prev,
      social_media: [...prev.social_media, ''],
    }));
  };

  const removeSocialLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      social_media: prev.social_media.filter((_, i) => i !== index),
    }));
  };

  const updateSocialLink = (index: number, value: string) => {
    const updated = [...formData.social_media];
    updated[index] = value;
    setFormData((prev) => ({
      ...prev,
      social_media: updated,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Ρυθμίσεις Παραγωγού</h1>
            <p className="mt-1 text-gray-600">
              Διαχειριστείτε τα στοιχεία της επιχείρησής σας
            </p>
          </div>

          {error && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mx-6 mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Βασικά Στοιχεία</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Όνομα Παραγωγού *
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="π.χ. Αγροκτήμα Κουτσογιάννη"
                    />
                  </div>

                  <div>
                    <label htmlFor="business_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Επωνυμία Επιχείρησης
                    </label>
                    <input
                      id="business_name"
                      type="text"
                      value={formData.business_name}
                      onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="π.χ. ΚΟΥΤΣΟΓΙΑΝΝΗΣ ΚΑΙ ΣΙΑ ΟΕ"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                    Αναγνωριστικό URL (Slug)
                  </label>
                  <input
                    id="slug"
                    type="text"
                    value={formData.slug}
                    onChange={(e) => {
                      // Auto-normalize: lowercase, replace spaces with dashes, remove invalid chars
                      const normalized = e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, '-')
                        .replace(/[^a-z0-9-]/g, '');
                      setFormData({ ...formData, slug: normalized });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="π.χ. agrotima-koutsogianni"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Χρησιμοποιείται στο URL (μόνο λατινικά, παύλες)
                  </p>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Περιγραφή
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Περιγράψτε την επιχείρησή σας..."
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Στοιχεία Επικοινωνίας</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Τηλέφωνο
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="210 1234567"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                    Ιστοσελίδα
                  </label>
                  <input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="https://www.example.com"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Διεύθυνση
                  </label>
                  <input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Οδός, αριθμός"
                  />
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Στοιχεία Τοποθεσίας</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    Πόλη
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="π.χ. Αθήνα"
                  />
                </div>

                <div>
                  <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1">
                    Τ.Κ.
                  </label>
                  <input
                    id="postal_code"
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="π.χ. 12345"
                  />
                </div>

                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                    Περιφέρεια
                  </label>
                  <input
                    id="region"
                    type="text"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="π.χ. Αττική"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Τοποθεσία (Εμφάνιση)
                  </label>
                  <input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="π.χ. Κρήτη, Ελλάδα"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Settings - Pass PRODUCER-THRESHOLD-POSTALCODE-01 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Ρυθμίσεις Αποστολής</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="free_shipping_threshold_eur" className="block text-sm font-medium text-gray-700 mb-1">
                    Όριο Δωρεάν Αποστολής (€)
                  </label>
                  <input
                    id="free_shipping_threshold_eur"
                    type="number"
                    step="0.01"
                    min="0"
                    max="9999.99"
                    value={formData.free_shipping_threshold_eur}
                    onChange={(e) => setFormData({ ...formData, free_shipping_threshold_eur: e.target.value })}
                    className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="35.00"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Αφήστε κενό για χρήση του προεπιλεγμένου ορίου (€35). Οι πελάτες θα έχουν δωρεάν αποστολή όταν η παραγγελία τους από εσάς ξεπερνά αυτό το ποσό.
                  </p>
                </div>
              </div>
            </div>

            {/* Business Details */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Φορολογικά Στοιχεία</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="tax_id" className="block text-sm font-medium text-gray-700 mb-1">
                      ΑΦΜ
                    </label>
                    <input
                      id="tax_id"
                      type="text"
                      value={formData.tax_id}
                      onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="π.χ. 123456789"
                    />
                  </div>

                  <div>
                    <label htmlFor="tax_office" className="block text-sm font-medium text-gray-700 mb-1">
                      ΔΟΥ
                    </label>
                    <input
                      id="tax_office"
                      type="text"
                      value={formData.tax_office}
                      onChange={(e) => setFormData({ ...formData, tax_office: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="π.χ. ΔΟΥ Αθηνών"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Κοινωνικά Δίκτυα
                  </label>
                  <div className="space-y-2">
                    {formData.social_media.map((link, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="url"
                          value={link}
                          onChange={(e) => updateSocialLink(i, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="https://facebook.com/..."
                        />
                        {formData.social_media.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSocialLink(i)}
                            className="px-3 py-2 text-red-600 hover:text-red-800 border border-red-300 rounded-lg hover:bg-red-50"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addSocialLink}
                      className="text-sm text-green-600 hover:text-green-800 font-medium"
                    >
                      + Προσθήκη Συνδέσμου
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={busy}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {busy ? 'Αποθήκευση...' : 'Αποθήκευση Αλλαγών'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                disabled={busy}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
              >
                Ακύρωση
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
