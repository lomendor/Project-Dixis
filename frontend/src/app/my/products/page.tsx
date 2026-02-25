'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/contexts/ToastContext';
import AuthGuard from '@/components/AuthGuard';
import { apiClient } from '@/lib/api';

interface ProducerProduct {
  id: number;
  name: string;
  title: string;
  price: number;
  currency: string;
  stock: number;
  is_active: boolean;
  status: 'available' | 'unavailable' | 'seasonal';
  image_url?: string;
  category?: string;
  created_at: string;
  updated_at: string;
}

interface ProducerStatus {
  isApproved: boolean;
  status: 'pending' | 'active' | 'inactive' | null;
  profileExists: boolean;
}

interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
}

export default function ProducerProductsPage() {
  return (
    <AuthGuard requireAuth={true} requireRole="producer">
      <ProducerProductsContent />
    </AuthGuard>
  );
}

function ProducerProductsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const [products, setProducts] = useState<ProducerProduct[]>([]);
  const [producerStatus, setProducerStatus] = useState<ProducerStatus>({
    isApproved: false,
    status: null,
    profileExists: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Search/filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Dynamic categories from API
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Inline stock editing state
  const [editingStockId, setEditingStockId] = useState<number | null>(null);
  const [editingStockValue, setEditingStockValue] = useState('');
  const [savingStockId, setSavingStockId] = useState<number | null>(null);

  // Toggle active state
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: number; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      checkProducerStatus();
    }
  }, [user?.id]);

  // Fetch categories from API
  useEffect(() => {
    fetch('/api/public/categories')
      .then((r) => r.json())
      .then((data) => {
        setCategories(data.categories || []);
        setCategoriesLoading(false);
      })
      .catch(() => setCategoriesLoading(false));
  }, []);

  const checkProducerStatus = async () => {
    try {
      setLoading(true);
      // AUTH-UNIFY-01: Call Laravel directly via apiClient (replaces broken /api/producer/status proxy)
      const data = await apiClient.getProducerMe();
      // PRODUCER-ONBOARD-01: Use has_profile flag from backend
      const status: ProducerStatus = {
        isApproved: data.producer?.status === 'active' && data.producer?.is_active !== false,
        status: (data.producer?.status as ProducerStatus['status']) || null,
        profileExists: data.has_profile ?? !!data.producer,
      };
      setProducerStatus(status);

      // If approved, load products
      if (status.isApproved) {
        await loadProducts();
      }
    } catch (err: any) {
      // PRODUCER-ONBOARD-01: Backend now returns 200 even without profile
      // Only catch network/unexpected errors
      setError('Αποτυχία ελέγχου κατάστασης παραγωγού');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (q = '', category = '') => {
    try {
      // AUTH-UNIFY-01: Call Laravel directly via apiClient (replaces broken /api/me/products proxy)
      const data = await apiClient.getProducerProducts({
        search: q || undefined,
      });
      // Laravel returns { data: Product[] } — map to ProducerProduct[]
      const mapped: ProducerProduct[] = (data.data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        title: p.title || p.name,
        price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
        currency: p.currency || 'EUR',
        stock: p.stock ?? 0,
        is_active: p.is_active ?? true,
        status: p.status || 'available',
        image_url: p.image_url,
        category: p.category,
        created_at: p.created_at,
        updated_at: p.updated_at,
      }));
      // Client-side category filter (Laravel doesn't support it as query param)
      const filtered = category
        ? mapped.filter((p) => p.category?.toLowerCase() === category.toLowerCase())
        : mapped;
      setProducts(filtered);
    } catch {
      setError('Σφάλμα φόρτωσης προϊόντων');
    }
  };

  // Reload products when filters change (debounced for search)
  useEffect(() => {
    if (!producerStatus.isApproved) return undefined;

    const timeoutId = setTimeout(() => {
      loadProducts(searchQuery, categoryFilter);
    }, 300); // 300ms debounce for search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, categoryFilter, producerStatus.isApproved]);

  const handleStockSave = async (productId: number) => {
    const newStock = parseInt(editingStockValue, 10);
    if (isNaN(newStock) || newStock < 0) { setEditingStockId(null); return; }
    setSavingStockId(productId);
    try {
      await apiClient.updateProductStock(productId, newStock);
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
      showSuccess('Το απόθεμα ενημερώθηκε');
    } catch (err: any) {
      showError(err.message || 'Σφάλμα ενημέρωσης αποθέματος');
    } finally {
      setSavingStockId(null);
      setEditingStockId(null);
    }
  };

  const handleToggleActive = async (product: ProducerProduct) => {
    setTogglingId(product.id);
    try {
      await apiClient.updateProducerProduct(product.id, { is_active: !product.is_active });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_active: !p.is_active } : p));
      showSuccess(product.is_active ? 'Το προϊόν απενεργοποιήθηκε' : 'Το προϊόν ενεργοποιήθηκε');
    } catch (err: any) {
      showError(err.message || 'Σφάλμα αλλαγής κατάστασης');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteClick = (product: { id: number; name: string }) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    setDeleting(true);
    try {
      // AUTH-UNIFY-01: Call Laravel directly via apiClient
      await apiClient.deleteProducerProduct(productToDelete.id);

      showSuccess('Το προϊόν διαγράφηκε επιτυχώς');

      // Refresh product list
      await loadProducts();

      // Close modal
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (err: any) {
      showError(err.message || 'Σφάλμα κατά τη διαγραφή');
    } finally {
      setDeleting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="animate-pulse">
              <div className="h-6 bg-neutral-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-neutral-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to onboarding if not approved
  if (!producerStatus.isApproved) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center" data-testid="not-approved-notice">
              {!producerStatus.profileExists ? (
                // No profile submitted yet
                <div>
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📝</span>
                  </div>
                  <h2 className="text-xl font-semibold text-neutral-900 mb-2" data-testid="no-profile-title">
                    Απαιτείται Αίτηση Παραγωγού
                  </h2>
                  <p className="text-neutral-600 mb-6" data-testid="no-profile-message">
                    Για να διαχειρίζεστε προϊόντα, πρέπει πρώτα να υποβάλετε αίτηση παραγωγού και να εγκριθείτε.
                  </p>
                  <button
                    onClick={() => router.push('/producer/onboarding')}
                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-light transition-colors"
                    data-testid="goto-onboarding-btn"
                  >
                    Υποβολή Αίτησης Παραγωγού
                  </button>
                </div>
              ) : producerStatus.status === 'pending' ? (
                // Profile not yet complete/activated
                <div>
                  <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">⏳</span>
                  </div>
                  <h2 className="text-xl font-semibold text-neutral-900 mb-2" data-testid="pending-approval-title">
                    Ολοκληρώστε το Προφίλ σας
                  </h2>
                  <p className="text-neutral-600 mb-6" data-testid="pending-approval-message">
                    Το προφίλ σας δεν έχει ενεργοποιηθεί ακόμα. Ολοκληρώστε τη ρύθμιση για να διαχειρίζεστε προϊόντα.
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => router.push('/producer/onboarding')}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                      data-testid="check-status-btn"
                    >
                      Έλεγχος Κατάστασης
                    </button>
                    <br />
                    <button
                      onClick={() => router.push('/producer/dashboard')}
                      className="bg-neutral-100 text-neutral-700 px-6 py-3 rounded-lg hover:bg-neutral-200 transition-colors"
                      data-testid="goto-dashboard-btn"
                    >
                      Πίνακας Ελέγχου
                    </button>
                  </div>
                </div>
              ) : (
                // Profile inactive/suspended
                <div>
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">❌</span>
                  </div>
                  <h2 className="text-xl font-semibold text-neutral-900 mb-2" data-testid="rejected-title">
                    Λογαριασμός Ανενεργός
                  </h2>
                  <p className="text-neutral-600 mb-6" data-testid="rejected-message">
                    Ο λογαριασμός σας είναι προσωρινά ανενεργός. Επικοινωνήστε μαζί μας για περισσότερες πληροφορίες.
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => router.push('/producer/onboarding')}
                      className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-light transition-colors"
                      data-testid="resubmit-btn"
                    >
                      Νέα Αίτηση
                    </button>
                    <br />
                    <button
                      onClick={() => router.push('/contact')}
                      className="bg-neutral-100 text-neutral-700 px-6 py-3 rounded-lg hover:bg-neutral-200 transition-colors"
                      data-testid="contact-support-btn"
                    >
                      Επικοινωνία
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Approved producer - show products management
  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900" data-testid="page-title">
                  Διαχείριση Προϊόντων
                </h1>
                <p className="mt-1 text-neutral-600">
                  Προσθήκη και επεξεργασία των προϊόντων σας
                </p>
              </div>
              <button
                onClick={() => router.push('/my/products/create')}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-light transition-colors"
                data-testid="add-product-btn"
              >
                + Νέο Προϊόν
              </button>
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" data-testid="error-message">
              {error}
            </div>
          )}

          {/* Search and Filter */}
          <div className="px-6 py-4 border-b border-neutral-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Αναζήτηση προϊόντος..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  data-testid="search-input"
                />
              </div>
              <div className="sm:w-48">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  data-testid="category-filter"
                >
                  <option value="">Όλες οι κατηγορίες</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.icon ? `${cat.icon} ${cat.name}` : cat.name}
                    </option>
                  ))}
                </select>
              </div>
              {(searchQuery || categoryFilter) && (
                <button
                  onClick={() => { setSearchQuery(''); setCategoryFilter(''); }}
                  className="px-4 py-2 text-neutral-600 hover:text-neutral-800 border border-neutral-300 rounded-lg hover:bg-neutral-50"
                  data-testid="clear-filters-btn"
                >
                  Καθαρισμός
                </button>
              )}
            </div>
          </div>

          <div className="p-6" data-testid="products-section">
            {products.length === 0 ? (
              <div className="text-center py-12" data-testid="no-products-state">
                <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">{searchQuery || categoryFilter ? '🔍' : '📦'}</span>
                </div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  {searchQuery || categoryFilter ? 'Δεν βρέθηκαν προϊόντα' : 'Κανένα προϊόν ακόμα'}
                </h3>
                <p className="text-neutral-600 mb-6">
                  {searchQuery || categoryFilter
                    ? 'Δοκιμάστε διαφορετικούς όρους αναζήτησης ή φίλτρα.'
                    : 'Ξεκινήστε προσθέτοντας το πρώτο σας προϊόν για να το δουν οι πελάτες.'}
                </p>
                {searchQuery || categoryFilter ? (
                  <button
                    onClick={() => { setSearchQuery(''); setCategoryFilter(''); }}
                    className="bg-neutral-100 text-neutral-700 px-6 py-3 rounded-lg hover:bg-neutral-200 transition-colors"
                    data-testid="clear-filters-empty-btn"
                  >
                    Καθαρισμός Φίλτρων
                  </button>
                ) : (
                  <button
                    onClick={() => router.push('/my/products/create')}
                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-light transition-colors"
                    data-testid="add-first-product-btn"
                  >
                    Προσθήκη Πρώτου Προϊόντος
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200" data-testid="products-table">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Εικόνα
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Προϊόν
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Τιμή
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Απόθεμα
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Κατάσταση
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Ενέργειες
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {products.map((product) => (
                      <tr key={product.id} data-testid={`product-row-${product.id}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {(product as any).image_url ? (
                            <img
                              src={(product as any).image_url}
                              alt={product.title || product.name}
                              className="w-12 h-12 object-cover rounded"
                              data-testid={`product-thumbnail-${product.id}`}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-neutral-200 rounded flex items-center justify-center" data-testid={`product-placeholder-${product.id}`}>
                              <span className="text-neutral-400 text-xs">📦</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-neutral-900" data-testid={`product-name-${product.id}`}>
                              {product.title || product.name}
                            </div>
                            <div className="text-sm text-neutral-500">{product.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900" data-testid={`product-price-${product.id}`}>
                          {product.price.toFixed(2)} {product.currency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900" data-testid={`product-stock-${product.id}`}>
                          {editingStockId === product.id ? (
                            <input
                              type="number"
                              min="0"
                              value={editingStockValue}
                              onChange={(e) => setEditingStockValue(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleStockSave(product.id); if (e.key === 'Escape') setEditingStockId(null); }}
                              onBlur={() => handleStockSave(product.id)}
                              autoFocus
                              className="w-20 px-2 py-1 border border-primary rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                              disabled={savingStockId === product.id}
                            />
                          ) : (
                            <button
                              onClick={() => { setEditingStockId(product.id); setEditingStockValue(String(product.stock)); }}
                              className="hover:bg-neutral-100 px-2 py-1 rounded cursor-pointer transition-colors"
                              title="Κλικ για επεξεργασία"
                            >
                              {product.stock} <span className="text-neutral-400 text-xs">✏️</span>
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" data-testid={`product-status-${product.id}`}>
                          <button
                            onClick={() => handleToggleActive(product)}
                            disabled={togglingId === product.id}
                            className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-all ${
                              product.is_active ? 'bg-primary-pale text-primary hover:bg-green-200' : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
                            } ${togglingId === product.id ? 'opacity-50' : ''}`}
                            title={product.is_active ? 'Κλικ για απενεργοποίηση' : 'Κλικ για ενεργοποίηση'}
                          >
                            {product.is_active ? 'Ενεργό' : 'Ανενεργό'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <button
                            onClick={() => router.push(`/my/products/${product.id}/edit`)}
                            className="text-blue-600 hover:text-blue-900"
                            data-testid={`edit-product-${product.id}`}
                          >
                            Επεξεργασία
                          </button>
                          <button
                            onClick={() => router.push(`/products/${product.id}`)}
                            className="text-primary hover:text-primary-light"
                            data-testid={`view-product-${product.id}`}
                          >
                            Προβολή
                          </button>
                          <button
                            onClick={() => handleDeleteClick({ id: product.id, name: product.title || product.name })}
                            className="text-red-600 hover:text-red-900"
                            data-testid={`delete-product-${product.id}`}
                          >
                            Διαγραφή
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="delete-modal">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
              <h3 className="text-xl font-bold text-neutral-900 mb-4" data-testid="delete-modal-title">
                Επιβεβαίωση Διαγραφής
              </h3>
              <p className="text-neutral-600 mb-6" data-testid="delete-modal-message">
                Είστε σίγουροι ότι θέλετε να διαγράψετε το προϊόν{' '}
                <strong className="text-neutral-900">&quot;{productToDelete?.name}&quot;</strong>;
                <br />
                Η ενέργεια αυτή δεν μπορεί να αναιρεθεί.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={deleting}
                  className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  data-testid="delete-modal-cancel"
                >
                  Ακύρωση
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  data-testid="delete-modal-confirm"
                >
                  {deleting ? 'Διαγραφή...' : 'Διαγραφή'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}