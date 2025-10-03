'use client';

import { useState } from 'react';
import { ProductWithProducer } from '@/lib/admin/adminApi';
import { useToast } from '@/contexts/ToastContext';

interface ProductToggleProps {
  products: ProductWithProducer[];
  loading: boolean;
  // eslint-disable-next-line no-unused-vars
  onToggleStatus: (productId: number, isActive: boolean) => Promise<void>;
}

export default function ProductToggle({ products, loading, onToggleStatus }: ProductToggleProps) {
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useToast();

  const handleToggleStatus = async (productId: number, currentStatus: boolean) => {
    try {
      setUpdatingIds(prev => new Set([...prev, productId]));
      await onToggleStatus(productId, !currentStatus);
      showToast('success', `Το προϊόν ${!currentStatus ? 'ενεργοποιήθηκε' : 'απενεργοποιήθηκε'} επιτυχώς`);
    } catch {
      showToast('error', 'Απέτυχε η ενημέρωση του προϊόντος');
    } finally {
      setUpdatingIds(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-white shadow sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-100 rounded">
                <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                <div className="h-6 bg-gray-300 rounded w-12"></div>
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 sm:mb-0">
            Κατάσταση Προϊόντων ({filteredProducts.length})
          </h3>
          
          <div className="flex space-x-3">
            <input
              type="text"
              placeholder="Αναζήτηση προϊόντων..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredProducts.map((product) => {
            const isUpdating = updatingIds.has(product.id);
            
            return (
              <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
                  <p className="text-xs text-gray-500">Παραγωγός: {product.producer.name}</p>
                  <p className="text-xs text-gray-400">
                    Τιμή: €{product.price} | Απόθεμα: {product.stock}
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    product.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.is_active ? 'Ενεργό' : 'Ανενεργό'}
                  </span>
                  
                  <button
                    onClick={() => handleToggleStatus(product.id, product.is_active)}
                    disabled={isUpdating}
                    className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded ${
                      product.is_active
                        ? 'text-red-700 bg-red-100 hover:bg-red-200'
                        : 'text-green-700 bg-green-100 hover:bg-green-200'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50`}
                  >
                    {isUpdating ? 'Ενημέρωση...' : (product.is_active ? 'Απενεργοποίηση' : 'Ενεργοποίηση')}
                  </button>
                </div>
              </div>
            );
          })}
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">Δεν βρέθηκαν προϊόντα</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}