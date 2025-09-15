'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

interface Product {
  id: number;
  title: string;
  name: string;
  description?: string;
  price: number;
  price_cents?: number;
  stock: number;
  weight_grams?: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  is_active: boolean;
}

export default function EditProductPage() {
  return (
    <AuthGuard requireAuth={true} requireRole="producer">
      <EditProductContent />
    </AuthGuard>
  );
}

function EditProductContent() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

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
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [error, setError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [productNotFound, setProductNotFound] = useState(false);

  // Load existing product data
  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoadingProduct(true);
      const response = await fetch(`/api/producer/products/${productId}`, {
        headers: {
          'Authorization': 'Bearer mock_token',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const product: Product = data.product;

        // Convert product data to form format
        setFormData({
          title: product.title || product.name,
          description: product.description || '',
          priceCents: product.price_cents || Math.round(product.price * 100),
          stockQty: product.stock,
          weightGrams: product.weight_grams || 0,
          lengthCm: product.length_cm || 0,
          widthCm: product.width_cm || 0,
          heightCm: product.height_cm || 0,
          isActive: product.is_active,
        });
      } else if (response.status === 404) {
        setProductNotFound(true);
      } else {
        setError('Αποτυχία φόρτωσης προϊόντος');
      }
    } catch (err) {
      setError('Σφάλμα δικτύου κατά τη φόρτωση');
    } finally {
      setLoadingProduct(false);
    }
  };

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
      const response = await fetch(`/api/producer/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock_token',
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
        router.push('/producer/products?updated=success');
      } else {
        setError(data.error || 'Παρουσιάστηκε σφάλμα κατά την ενημέρωση του προϊόντος');
      }
    } catch (err) {
      setError('Σφάλμα δικτύου κατά την ενημέρωση του προϊόντος');
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

  // Loading state
  if (loadingProduct) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Product not found
  if (productNotFound) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4" data-testid="not-found-title">
              Προϊόν Δεν Βρέθηκε
            </h1>
            <p className="text-gray-600 mb-6" data-testid="not-found-message">
              Το προϊόν που προσπαθείτε να επεξεργαστείτε δεν υπάρχει ή δεν έχετε δικαιώματα πρόσβασης.
            </p>
            <button
              onClick={() => router.push('/producer/products')}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              data-testid="back-to-products-btn"
            >
              Επιστροφή στα Προϊόντα
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900" data-testid="page-title">
              Επεξεργασία Προϊόντος
            </h1>
            <p className="mt-1 text-gray-600">
              Ενημερώστε τα στοιχεία του προϊόντος σας
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
                {loading ? 'Ενημέρωση...' : 'Ενημέρωση Προϊόντος'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}