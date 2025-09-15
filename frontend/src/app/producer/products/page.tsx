'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AuthGuard from '@/components/AuthGuard';

interface ProducerProduct {
  id: number;
  name: string;
  title: string;
  price: number;
  currency: string;
  stock: number;
  is_active: boolean;
  status: 'available' | 'unavailable' | 'seasonal';
  created_at: string;
  updated_at: string;
}

interface ProducerStatus {
  isApproved: boolean;
  status: 'pending' | 'active' | 'inactive' | null;
  profileExists: boolean;
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
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ProducerProduct[]>([]);
  const [producerStatus, setProducerStatus] = useState<ProducerStatus>({
    isApproved: false,
    status: null,
    profileExists: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    if (user?.id) {
      checkProducerStatus();
    }
  }, [user?.id]);

  // Handle success messages from URL params
  useEffect(() => {
    const created = searchParams.get('created');
    const updated = searchParams.get('updated');

    if (created === 'success') {
      setSuccess('Το προϊόν δημιουργήθηκε επιτυχώς!');
      // Clean up URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('created');
      router.replace(`/producer/products?${newParams.toString()}`);
    } else if (updated === 'success') {
      setSuccess('Το προϊόν ενημερώθηκε επιτυχώς!');
      // Clean up URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('updated');
      router.replace(`/producer/products?${newParams.toString()}`);
    }
  }, [searchParams, router]);

  const checkProducerStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/producer/status');
      if (response.ok) {
        const data = await response.json();
        const status: ProducerStatus = {
          isApproved: data.status === 'active',
          status: data.status,
          profileExists: !!data.profile,
        };
        setProducerStatus(status);

        // If approved, load products
        if (status.isApproved) {
          await loadProducts();
        }
      } else {
        setError('Αποτυχία ελέγχου κατάστασης παραγωγού');
      }
    } catch (err) {
      setError('Σφάλμα δικτύου');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/producer/products', {
        headers: {
          'Authorization': 'Bearer mock_token',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      } else {
        setError('Αποτυχία φόρτωσης προϊόντων');
      }
    } catch (err) {
      setError('Σφάλμα φόρτωσης προϊόντων');
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    setDeletingProductId(productId);
    setError('');

    try {
      const response = await fetch(`/api/producer/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer mock_token',
        },
      });

      if (response.ok) {
        // Remove product from local state
        setProducts(prev => prev.filter(p => p.id !== productId));
        setSuccess('Το προϊόν διαγράφηκε επιτυχώς!');
      } else {
        const data = await response.json();
        setError(data.error || 'Αποτυχία διαγραφής προϊόντος');
      }
    } catch (err) {
      setError('Σφάλμα δικτύου κατά τη διαγραφή');
    } finally {
      setDeletingProductId(null);
      setShowDeleteConfirm(null);
    }
  };

  const getProductSlug = (product: ProducerProduct): string => {
    // Generate slug from title or name
    const text = product.title || product.name;
    return text.toLowerCase()
      .replace(/[^\u0370-\u03FF\u1F00-\u1FFFa-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center" data-testid="not-approved-notice">
              {!producerStatus.profileExists ? (
                // No profile submitted yet
                <div>
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📝</span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2" data-testid="no-profile-title">
                    Απαιτείται Αίτηση Παραγωγού
                  </h2>
                  <p className="text-gray-600 mb-6" data-testid="no-profile-message">
                    Για να διαχειρίζεστε προϊόντα, πρέπει πρώτα να υποβάλετε αίτηση παραγωγού και να εγκριθείτε.
                  </p>
                  <button
                    onClick={() => router.push('/producer/onboarding')}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                    data-testid="goto-onboarding-btn"
                  >
                    Υποβολή Αίτησης Παραγωγού
                  </button>
                </div>
              ) : producerStatus.status === 'pending' ? (
                // Profile submitted, awaiting approval
                <div>
                  <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">⏳</span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2" data-testid="pending-approval-title">
                    Αναμένεται Έγκριση
                  </h2>
                  <p className="text-gray-600 mb-6" data-testid="pending-approval-message">
                    Η αίτησή σας έχει υποβληθεί και βρίσκεται υπό εξέταση. Θα μπορέσετε να διαχειρίζεστε προϊόντα μόλις εγκριθείτε.
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
                      className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                      data-testid="goto-dashboard-btn"
                    >
                      Πίνακας Ελέγχου
                    </button>
                  </div>
                </div>
              ) : (
                // Profile rejected
                <div>
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">❌</span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2" data-testid="rejected-title">
                    Αίτηση Απορρίφθηκε
                  </h2>
                  <p className="text-gray-600 mb-6" data-testid="rejected-message">
                    Δυστυχώς η αίτησή σας δεν μπορεί να εγκριθεί αυτή τη στιγμή. Επικοινωνήστε μαζί μας για περισσότερες πληροφορίες.
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => router.push('/producer/onboarding')}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                      data-testid="resubmit-btn"
                    >
                      Νέα Αίτηση
                    </button>
                    <br />
                    <button
                      onClick={() => router.push('/contact')}
                      className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900" data-testid="page-title">
                  Διαχείριση Προϊόντων
                </h1>
                <p className="mt-1 text-gray-600">
                  Προσθήκη και επεξεργασία των προϊόντων σας
                </p>
              </div>
              <button
                onClick={() => router.push('/producer/products/create')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
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

          {success && (
            <div className="mx-6 mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg" data-testid="success-message">
              {success}
              <button
                onClick={() => setSuccess('')}
                className="ml-2 text-green-600 hover:text-green-500"
              >
                ×
              </button>
            </div>
          )}

          <div className="p-6" data-testid="products-section">
            {products.length === 0 ? (
              <div className="text-center py-12" data-testid="no-products-state">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📦</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Κανένα προϊόν ακόμα
                </h3>
                <p className="text-gray-600 mb-6">
                  Ξεκινήστε προσθέτοντας το πρώτο σας προϊόν για να το δουν οι πελάτες.
                </p>
                <button
                  onClick={() => router.push('/producer/products/create')}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                  data-testid="add-first-product-btn"
                >
                  Προσθήκη Πρώτου Προϊόντος
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200" data-testid="products-table">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Προϊόν
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Τιμή
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Απόθεμα
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Κατάσταση
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ενέργειες
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} data-testid={`product-row-${product.id}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900" data-testid={`product-name-${product.id}`}>
                              {product.title || product.name}
                            </div>
                            <div className="text-sm text-gray-500">{product.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" data-testid={`product-price-${product.id}`}>
                          {product.price.toFixed(2)} {product.currency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" data-testid={`product-stock-${product.id}`}>
                          {product.stock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" data-testid={`product-status-${product.id}`}>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {product.is_active ? 'Ενεργό' : 'Ανενεργό'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <button
                            onClick={() => router.push(`/producer/products/${product.id}/edit`)}
                            className="text-blue-600 hover:text-blue-900"
                            data-testid={`edit-product-${product.id}`}
                          >
                            Επεξεργασία
                          </button>
                          <button
                            onClick={() => router.push(`/products/${getProductSlug(product)}`)}
                            className="text-green-600 hover:text-green-900"
                            data-testid={`view-product-${product.id}`}
                          >
                            Προβολή
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(product.id)}
                            disabled={deletingProductId === product.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            data-testid={`delete-product-${product.id}`}
                          >
                            {deletingProductId === product.id ? 'Διαγραφή...' : 'Διαγραφή'}
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
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="delete-confirmation">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Επιβεβαίωση Διαγραφής
            </h3>
            <p className="text-gray-600 mb-6">
              Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το προϊόν; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.
            </p>
            <div className="flex items-center justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                disabled={deletingProductId !== null}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                data-testid="cancel-delete-btn"
              >
                Ακύρωση
              </button>
              <button
                onClick={() => handleDeleteProduct(showDeleteConfirm)}
                disabled={deletingProductId !== null}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400"
                data-testid="confirm-delete-btn"
              >
                {deletingProductId === showDeleteConfirm ? 'Διαγραφή...' : 'Διαγραφή'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}