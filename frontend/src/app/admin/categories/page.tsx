'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';

interface Category {
  id: string;
  slug: string;
  name: string;
  nameEn: string | null;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
}

/**
 * Pass FIX-CATEGORIES-AUTH-01: Removed AuthGuard wrapper.
 *
 * AuthGuard uses useAuth() → apiClient.getProfile() which checks Laravel
 * consumer/producer auth. Admin OTP login creates a dixis_session JWT,
 * NOT a Laravel session, so AuthGuard always fails → redirect to /auth/login.
 *
 * Server-side auth is already handled by admin/layout.tsx (requireAdmin()),
 * so the client-side AuthGuard was redundant AND broken for admin pages.
 */
export default function AdminCategoriesPage() {
  const { showSuccess, showError } = useToast();

  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [editSortOrder, setEditSortOrder] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    try {
      const response = await fetch('/api/public/categories');
      if (!response.ok) throw new Error('Failed to load categories');

      const data = await response.json();
      // Fetch ALL categories (not just active) for admin view
      const allCategoriesResponse = await fetch('/api/public/categories?includeInactive=true');
      const allData = allCategoriesResponse.ok
        ? await allCategoriesResponse.json()
        : data;

      setCategories(allData.categories || []);
    } catch (error) {
      showError('Αποτυχία φόρτωσης κατηγοριών');
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(category: Category) {
    if (processingIds.has(category.id)) return;

    setProcessingIds(prev => new Set(prev).add(category.id));

    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !category.isActive })
      });

      if (!response.ok) throw new Error('Failed to toggle active status');

      showSuccess(`Η κατηγορία ${category.isActive ? 'απενεργοποιήθηκε' : 'ενεργοποιήθηκε'}`);
      await loadCategories(); // Refresh list
    } catch (error) {
      showError('Αποτυχία αλλαγής κατάστασης κατηγορίας');
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(category.id);
        return next;
      });
    }
  }

  function handleEditClick(category: Category) {
    setCategoryToEdit(category);
    setEditName(category.name);
    setEditIcon(category.icon || '');
    setEditSortOrder(category.sortOrder);
    setEditModalOpen(true);
  }

  async function handleSaveEdit() {
    if (!categoryToEdit) return;

    // Validation
    if (editName.trim().length < 2) {
      showError('Το όνομα πρέπει να έχει τουλάχιστον 2 χαρακτήρες');
      return;
    }

    if (editSortOrder < 0) {
      showError('Η σειρά ταξινόμησης πρέπει να είναι θετικός αριθμός');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/admin/categories/${categoryToEdit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          icon: editIcon.trim() || null,
          sortOrder: editSortOrder
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update category');
      }

      showSuccess('Η κατηγορία ενημερώθηκε επιτυχώς');
      setEditModalOpen(false);
      await loadCategories(); // Refresh list
    } catch (error: unknown) {
      if (error instanceof Error) {
        showError(error.message || 'Σφάλμα κατά την ενημέρωση');
      } else {
        showError('Σφάλμα κατά την ενημέρωση');
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Filter categories by search query
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900" data-testid="page-title">
            Διαχείριση Κατηγοριών
          </h1>
          <p className="mt-2 text-gray-600">
            Προβολή και επεξεργασία κατηγοριών προϊόντων
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Αναζήτηση κατηγορίας..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            data-testid="search-input"
          />
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200" data-testid="categories-table">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Εικόνα
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Όνομα
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Σειρά
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
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {searchQuery ? 'Δεν βρέθηκαν κατηγορίες' : 'Δεν υπάρχουν κατηγορίες'}
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category.id} data-testid={`category-row-${category.id}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-2xl">
                      {category.icon || '📦'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {category.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{category.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{category.sortOrder}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          category.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                        data-testid={`category-status-${category.id}`}
                      >
                        {category.isActive ? 'Ενεργή' : 'Ανενεργή'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => toggleActive(category)}
                        disabled={processingIds.has(category.id)}
                        className={`${
                          category.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        data-testid={`toggle-active-${category.id}`}
                      >
                        {processingIds.has(category.id)
                          ? '...'
                          : category.isActive ? 'Απενεργοποίηση' : 'Ενεργοποίηση'
                        }
                      </button>
                      <button
                        onClick={() => handleEditClick(category)}
                        className="text-blue-600 hover:text-blue-900"
                        data-testid={`edit-category-${category.id}`}
                      >
                        Επεξεργασία
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Edit Category Modal */}
        {editModalOpen && categoryToEdit && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            data-testid="edit-modal"
          >
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-4" data-testid="edit-modal-title">
                Επεξεργασία Κατηγορίας
              </h3>

              <div className="space-y-4">
                {/* Name Field */}
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Όνομα *
                  </label>
                  <input
                    id="edit-name"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="π.χ. Λαχανικά"
                    required
                    data-testid="edit-name-input"
                  />
                </div>

                {/* Icon Field */}
                <div>
                  <label htmlFor="edit-icon" className="block text-sm font-medium text-gray-700 mb-1">
                    Εικόνα (Emoji)
                  </label>
                  <input
                    id="edit-icon"
                    type="text"
                    value={editIcon}
                    onChange={(e) => setEditIcon(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="π.χ. 🥬"
                    data-testid="edit-icon-input"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Πληκτρολογήστε ένα emoji ή αφήστε κενό
                  </p>
                </div>

                {/* Sort Order Field */}
                <div>
                  <label htmlFor="edit-sort-order" className="block text-sm font-medium text-gray-700 mb-1">
                    Σειρά Ταξινόμησης *
                  </label>
                  <input
                    id="edit-sort-order"
                    type="number"
                    min="0"
                    value={editSortOrder}
                    onChange={(e) => setEditSortOrder(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                    data-testid="edit-sort-order-input"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Μικρότερος αριθμός = εμφανίζεται πρώτος
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditModalOpen(false)}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  data-testid="edit-modal-cancel"
                >
                  Ακύρωση
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  data-testid="edit-modal-save"
                >
                  {submitting ? 'Αποθήκευση...' : 'Αποθήκευση'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
