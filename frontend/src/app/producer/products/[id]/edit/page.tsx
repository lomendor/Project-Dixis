'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import UploadImage from '@/components/UploadImage.client';

export default function EditProductPage() {
  return (
    <AuthGuard requireAuth={true} requireRole="producer">
      <EditProductContent />
    </AuthGuard>
  );
}

function EditProductContent() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Form state
  const [title, setTitle] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  async function loadProduct() {
    try {
      setLoading(true);
      const response = await fetch(`/api/producer/products/${productId}`);

      if (!response.ok) {
        throw new Error('Αποτυχία φόρτωσης προϊόντος');
      }

      const data = await response.json();
      setTitle(data.title || '');
      setName(data.name || '');
      setPrice(data.price?.toString() || '');
      setStock(data.stock?.toString() || '');
      setImageUrl(data.image_url || null);
      setIsActive(data.is_active ?? true);
    } catch (err: any) {
      setError(err.message || 'Σφάλμα φόρτωσης προϊόντος');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);

    try {
      const response = await fetch(`/api/producer/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          name,
          price: parseFloat(price),
          stock: parseInt(stock),
          image_url: imageUrl,
          is_active: isActive,
          currency: 'EUR',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Αποτυχία ενημέρωσης προϊόντος');
      }

      router.push('/producer/products');
    } catch (err: any) {
      setError(err.message || 'Σφάλμα ενημέρωσης προϊόντος');
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900" data-testid="page-title">
              Επεξεργασία Προϊόντος
            </h1>
            <p className="mt-1 text-gray-600">
              Ενημερώστε τα στοιχεία του προϊόντος σας
            </p>
          </div>

          {error && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" data-testid="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Τίτλος Προϊόντος *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="π.χ. Βιολογικές Ντομάτες Κρήτης"
                data-testid="title-input"
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Όνομα (slug) *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="π.χ. biologikes-tomates"
                data-testid="name-input"
              />
              <p className="mt-1 text-sm text-gray-500">
                Χρησιμοποιείται στο URL (μόνο λατινικά, παύλες)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Τιμή (€) *
                </label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="π.χ. 3.50"
                  data-testid="price-input"
                />
              </div>

              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                  Απόθεμα *
                </label>
                <input
                  id="stock"
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="π.χ. 25"
                  data-testid="stock-input"
                />
              </div>
            </div>

            <div>
              <UploadImage
                value={imageUrl}
                onChange={setImageUrl}
                accept="image/*"
                maxMB={5}
                label="Εικόνα Προϊόντος"
              />
            </div>

            <div className="flex items-center">
              <input
                id="is_active"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                data-testid="active-checkbox"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                Ενεργό προϊόν (ορατό στους πελάτες)
              </label>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={busy}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                data-testid="submit-btn"
              >
                {busy ? 'Ενημέρωση...' : 'Ενημέρωση Προϊόντος'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                disabled={busy}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
                data-testid="cancel-btn"
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
