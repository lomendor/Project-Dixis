'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import UploadImage from '@/components/UploadImage.client';
import { apiClient } from '@/lib/api';

type Category = {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
};

export default function CreateProductPage() {
  return (
    <AuthGuard requireAuth={true} requireRole="producer">
      <CreateProductContent />
    </AuthGuard>
  );
}

function CreateProductContent() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>('');

  // Dynamic categories from API
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => {
        setCategories(data.categories || []);
        setCategoriesLoading(false);
      })
      .catch(() => setCategoriesLoading(false));
  }, []);

  // Units
  const units = ['kg', 'g', 'L', 'ml', 'τεμ'];

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);

    try {
      // AUTH-UNIFY-02: Call Laravel directly via apiClient (snake_case fields)
      await apiClient.createProducerProduct({
        name: title,
        slug,
        category,
        price: parseFloat(price),
        unit,
        stock: parseInt(stock),
        description: description || undefined,
        image_url: imageUrl,
        is_active: isActive,
      });

      router.push('/my/products');
    } catch (err: any) {
      setError(err.message || 'Σφάλμα δημιουργίας προϊόντος');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900" data-testid="page-title">
              Νέο Προϊόν
            </h1>
            <p className="mt-1 text-gray-600">
              Προσθέστε ένα νέο προϊόν στον κατάλογό σας
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
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                Όνομα (slug) *
              </label>
              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => {
                  // Auto-normalize: lowercase, replace spaces with dashes, remove invalid chars
                  const normalized = e.target.value
                    .toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^a-z0-9-]/g, '');
                  setSlug(normalized);
                }}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="π.χ. biologikes-tomates"
                data-testid="slug-input"
              />
              <p className="mt-1 text-sm text-gray-500">
                Χρησιμοποιείται στο URL (μόνο λατινικά, παύλες)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Κατηγορία *
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  disabled={categoriesLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                  data-testid="category-select"
                >
                  <option value="">
                    {categoriesLoading ? 'Φόρτωση...' : 'Επιλέξτε κατηγορία'}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.icon ? `${cat.icon} ${cat.name}` : cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                  Μονάδα Μέτρησης *
                </label>
                <select
                  id="unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  data-testid="unit-select"
                >
                  <option value="">Επιλέξτε μονάδα</option>
                  {units.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Περιγραφή
              </label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Περιγραφή προϊόντος..."
                data-testid="description-textarea"
              />
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
                {busy ? 'Δημιουργία...' : 'Δημιουργία Προϊόντος'}
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
