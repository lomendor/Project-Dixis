'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AuthGuard from '@/components/AuthGuard';

interface ProductFormData {
  title: string;
  description: string;
  priceCents: number;
  stockQty: number;
  weightGrams: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  isActive: boolean;
}

export default function CreateProductPage() {
  return (
    <AuthGuard requireAuth={true} requireRole="producer">
      <CreateProductContent />
    </AuthGuard>
  );
}

function CreateProductContent() {
  const { user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    priceCents: 0,
    stockQty: 0,
    weightGrams: 0,
    lengthCm: 0,
    widthCm: 0,
    heightCm: 0,
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof ProductFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
    setError('');
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Ο τίτλος είναι υποχρεωτικός';
    }

    if (formData.priceCents <= 0) {
      errors.priceCents = 'Η τιμή πρέπει να είναι μεγαλύτερη από 0';
    }

    if (formData.stockQty < 0) {
      errors.stockQty = 'Το απόθεμα δεν μπορεί να είναι αρνητικό';
    }

    if (formData.weightGrams < 0) {
      errors.weightGrams = 'Το βάρος δεν μπορεί να είναι αρνητικό';
    }

    if (formData.lengthCm < 0 || formData.widthCm < 0 || formData.heightCm < 0) {
      errors.dimensions = 'Οι διαστάσεις δεν μπορούν να είναι αρνητικές';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/producer/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock_token', // Mock auth token
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          priceCents: formData.priceCents,
          stockQty: formData.stockQty,
          weightGrams: formData.weightGrams,
          lengthCm: formData.lengthCm,
          widthCm: formData.widthCm,
          heightCm: formData.heightCm,
          isActive: formData.isActive,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to products list with success message
        router.push('/producer/products?created=success');
      } else {
        setError(data.error || 'Παρουσιάστηκε σφάλμα κατά τη δημιουργία του προϊόντος');
      }
    } catch (err) {
      setError('Σφάλμα δικτύου κατά τη δημιουργία του προϊόντος');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (cents: number): string => {
    return (cents / 100).toFixed(2);
  };

  const parsePriceInput = (value: string): number => {
    const euros = parseFloat(value) || 0;
    return Math.round(euros * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900" data-testid="page-title">
              Δημιουργία Νέου Προϊόντος
            </h1>
            <p className="mt-1 text-gray-600">
              Προσθέστε ένα νέο προϊόν στο κατάστημά σας
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6" data-testid="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="product-form">
            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Τίτλος Προϊόντος *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    fieldErrors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="π.χ. Βιολογικές Ντομάτες Κρήτης"
                  data-testid="title-input"
                  disabled={loading}
                />
                {fieldErrors.title && (
                  <p className="mt-1 text-sm text-red-600" data-testid="title-error">{fieldErrors.title}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Περιγραφή
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Περιγραφή του προϊόντος..."
                  data-testid="description-input"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Τιμή (€) *
                </label>
                <input
                  type="number"
                  id="price"
                  step="0.01"
                  min="0"
                  required
                  value={formatPrice(formData.priceCents)}
                  onChange={(e) => handleInputChange('priceCents', parsePriceInput(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    fieldErrors.priceCents ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                  data-testid="price-input"
                  disabled={loading}
                />
                {fieldErrors.priceCents && (
                  <p className="mt-1 text-sm text-red-600" data-testid="price-error">{fieldErrors.priceCents}</p>
                )}
              </div>

              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                  Απόθεμα *
                </label>
                <input
                  type="number"
                  id="stock"
                  min="0"
                  required
                  value={formData.stockQty}
                  onChange={(e) => handleInputChange('stockQty', parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    fieldErrors.stockQty ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  data-testid="stock-input"
                  disabled={loading}
                />
                {fieldErrors.stockQty && (
                  <p className="mt-1 text-sm text-red-600" data-testid="stock-error">{fieldErrors.stockQty}</p>
                )}
              </div>
            </div>

            {/* Physical Properties */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Φυσικά Χαρακτηριστικά</h3>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                    Βάρος (γρ)
                  </label>
                  <input
                    type="number"
                    id="weight"
                    min="0"
                    value={formData.weightGrams}
                    onChange={(e) => handleInputChange('weightGrams', parseInt(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      fieldErrors.weightGrams ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0"
                    data-testid="weight-input"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="length" className="block text-sm font-medium text-gray-700 mb-2">
                    Μήκος (εκ)
                  </label>
                  <input
                    type="number"
                    id="length"
                    min="0"
                    step="0.1"
                    value={formData.lengthCm}
                    onChange={(e) => handleInputChange('lengthCm', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="0.0"
                    data-testid="length-input"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="width" className="block text-sm font-medium text-gray-700 mb-2">
                    Πλάτος (εκ)
                  </label>
                  <input
                    type="number"
                    id="width"
                    min="0"
                    step="0.1"
                    value={formData.widthCm}
                    onChange={(e) => handleInputChange('widthCm', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="0.0"
                    data-testid="width-input"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-2">
                    Ύψος (εκ)
                  </label>
                  <input
                    type="number"
                    id="height"
                    min="0"
                    step="0.1"
                    value={formData.heightCm}
                    onChange={(e) => handleInputChange('heightCm', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="0.0"
                    data-testid="height-input"
                    disabled={loading}
                  />
                </div>
              </div>

              {fieldErrors.dimensions && (
                <p className="mt-2 text-sm text-red-600" data-testid="dimensions-error">{fieldErrors.dimensions}</p>
              )}
            </div>

            {/* Product Status */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                data-testid="active-checkbox"
                disabled={loading}
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Ενεργό προϊόν (ορατό στους πελάτες)
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/producer/products')}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                data-testid="cancel-btn"
                disabled={loading}
              >
                Ακύρωση
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                data-testid="submit-btn"
              >
                {loading ? 'Δημιουργία...' : 'Δημιουργία Προϊόντος'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}