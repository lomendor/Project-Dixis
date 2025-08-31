'use client';

import { useState } from 'react';
import { ProductWithProducer, formatCurrency } from '@/lib/admin/adminApi';
import { useToast } from '@/contexts/ToastContext';

interface ProductGridProps {
  products: ProductWithProducer[];
  loading: boolean;
  onToggleStatus: (productId: number, isActive: boolean) => Promise<void>;
}

export default function ProductGrid({ products, loading, onToggleStatus }: ProductGridProps) {
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducer, setSelectedProducer] = useState<string>('all');
  const { showToast } = useToast();

  const handleToggleStatus = async (productId: number, currentStatus: boolean) => {
    try {
      setUpdatingIds(prev => new Set([...prev, productId]));
      await onToggleStatus(productId, !currentStatus);
      showToast('success', `Το προϊόν ${!currentStatus ? 'ενεργοποιήθηκε' : 'απενεργοποιήθηκε'} επιτυχώς`);
    } catch (error) {
      showToast('error', 'Απέτυχε η ενημέρωση του προϊόντος');
    } finally {
      setUpdatingIds(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  // Filter products based on search and producer selection
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.producer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProducer = selectedProducer === 'all' || 
                           product.producer.id.toString() === selectedProducer;
    return matchesSearch && matchesProducer;
  });

  // Get unique producers for filter dropdown
  const producers = [...new Map(products.map(p => [p.producer.id, p.producer])).values()];

  const getProductImage = (product: ProductWithProducer) => {
    const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
    return primaryImage?.url || primaryImage?.image_path || '/placeholder-product.jpg';
  };

  if (loading) {
    return (
      <div className="bg-white shadow sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/4"></div>
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
            Διαχείριση Προϊόντων ({filteredProducts.length})
          </h3>
          
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Αναζήτηση προϊόντων..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <select
              value={selectedProducer}
              onChange={(e) => setSelectedProducer(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
            >
              <option value="all">Όλοι οι παραγωγοί</option>
              {producers.map(producer => (
                <option key={producer.id} value={producer.id.toString()}>
                  {producer.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="mt-2 text-sm text-gray-500">
              {searchQuery || selectedProducer !== 'all' ? 'Δεν βρέθηκαν προϊόντα με τα τρέχοντα κριτήρια' : 'Δεν βρέθηκαν προϊόντα'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="relative bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                {/* Product Status Badge */}
                <div className="absolute top-2 left-2 z-10">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    product.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.is_active ? 'Ενεργό' : 'Ανενεργό'}
                  </span>
                </div>

                {/* Product Image */}
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-gray-200">
                  <img
                    src={getProductImage(product)}
                    alt={product.name}
                    className="h-48 w-full object-cover object-center group-hover:opacity-75"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-product.jpg';
                    }}
                  />
                </div>

                {/* Product Details */}
                <div className="p-4">
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                    {product.name}
                  </h4>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {product.producer.name}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-semibold text-gray-900">
                      {formatCurrency(product.price)}
                    </span>
                    <span className="text-sm text-gray-500">
                      /{product.unit}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>Στοκ: {product.stock || 'N/A'}</span>
                    <span className="text-xs">
                      {product.categories?.map(cat => cat.name).join(', ')}
                    </span>
                  </div>

                  {/* Action Button */}
                  <button
                    type="button"
                    disabled={updatingIds.has(product.id)}
                    onClick={() => handleToggleStatus(product.id, product.is_active)}
                    className={`w-full inline-flex justify-center items-center px-3 py-2 border text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      product.is_active
                        ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-500'
                        : 'border-transparent text-white bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    }`}
                  >
                    {updatingIds.has(product.id) ? (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : null}
                    {product.is_active ? 'Απενεργοποίηση' : 'Ενεργοποίηση'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}