'use client';

import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';
import PriceStockEditor from '../components/PriceStockEditor';
import { pricingApi, ProductWithProducer, ProductUpdateData } from '@/lib/admin/pricingApi';
import { useToast } from '@/contexts/ToastContext';

export default function AdminPricingPage() {
  const [products, setProducts] = useState<ProductWithProducer[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await pricingApi.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      showToast('error', 'Απέτυχε η φόρτωση των προϊόντων');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);


  const handleUpdateProduct = async (productId: number, updates: ProductUpdateData) => {
    await pricingApi.updateProduct(productId, updates);
    
    // Optimistic update
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, ...updates }
        : product
    ));
  };

  return (
    <AuthGuard requireAuth={true} requireRole="admin">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Διαχείριση Τιμών & Αποθέματος</h1>
            <p className="mt-2 text-sm text-gray-600">
              Ενημέρωση τιμών και επιπέδων αποθέματος προϊόντων
            </p>
          </div>

          <PriceStockEditor 
            products={products}
            loading={loading}
            onUpdateProduct={handleUpdateProduct}
          />
        </div>
      </div>
    </AuthGuard>
  );
}