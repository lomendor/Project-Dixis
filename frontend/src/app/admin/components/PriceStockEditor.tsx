'use client';

import { useState } from 'react';
import { ProductWithProducer } from '@/lib/admin/adminApi';
import { ProductUpdateData, validateProductUpdate, formatPrice } from '@/lib/validation/productValidation';
import { useToast } from '@/contexts/ToastContext';

interface PriceStockEditorProps {
  products: ProductWithProducer[];
  loading: boolean;
  onUpdateProduct: (productId: number, updates: ProductUpdateData) => Promise<void>;
}

export default function PriceStockEditor({ products, loading, onUpdateProduct }: PriceStockEditorProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<ProductUpdateData>({ price: 0, stock: 0 });
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showToast } = useToast();

  const startEdit = (product: ProductWithProducer) => {
    setEditingId(product.id);
    setEditForm({ price: product.price, stock: product.stock });
    setErrors({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ price: 0, stock: 0 });
    setErrors({});
  };

  const saveEdit = async () => {
    if (!editingId) return;

    try {
      const validatedData = validateProductUpdate(editForm);
      setUpdatingIds(prev => new Set([...prev, editingId]));
      
      await onUpdateProduct(editingId, validatedData);
      
      showToast('success', 'Το προϊόν ενημερώθηκε επιτυχώς');
      setEditingId(null);
      setErrors({});
    } catch (error: any) {
      if (error.errors) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      } else {
        showToast('error', 'Απέτυχε η ενημέρωση του προϊόντος');
      }
    } finally {
      setUpdatingIds(prev => {
        const next = new Set(prev);
        next.delete(editingId);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-4 bg-gray-100 rounded">
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-gray-300 rounded w-16"></div>
                  <div className="h-8 bg-gray-300 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow sm:rounded-md">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
          Διαχείριση Τιμών & Αποθέματος ({products.length})
        </h3>

        <div className="space-y-4">
          {products.map((product) => {
            const isEditing = editingId === product.id;
            const isUpdating = updatingIds.has(product.id);

            return (
              <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-500 mb-3">Παραγωγός: {product.producer.name}</p>
                    
                    {isEditing ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Τιμή (€)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={editForm.price}
                            onChange={(e) => setEditForm(prev => ({ 
                              ...prev, 
                              price: parseFloat(e.target.value) || 0 
                            }))}
                            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                              errors.price ? 'border-red-500' : ''
                            }`}
                          />
                          {errors.price && (
                            <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Απόθεμα
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={editForm.stock}
                            onChange={(e) => setEditForm(prev => ({ 
                              ...prev, 
                              stock: parseInt(e.target.value) || 0 
                            }))}
                            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                              errors.stock ? 'border-red-500' : ''
                            }`}
                          />
                          {errors.stock && (
                            <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">
                        <span className="inline-block mr-4">
                          <strong>Τιμή:</strong> {formatPrice(product.price)}
                        </span>
                        <span className="inline-block">
                          <strong>Απόθεμα:</strong> {product.stock} τεμάχια
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex space-x-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={saveEdit}
                          disabled={isUpdating}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                          {isUpdating ? 'Αποθήκευση...' : 'Αποθήκευση'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Ακύρωση
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEdit(product)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Επεξεργασία
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {products.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">Δεν βρέθηκαν προϊόντα</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}