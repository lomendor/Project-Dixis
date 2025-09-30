'use client';

import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';
import ProductToggle from '../components/ProductToggle';
import { adminApi, ProductWithProducer } from '@/lib/admin/adminApi';
import { useToast } from '@/contexts/ToastContext';

export default function AdminTogglePage() {
  const [products, setProducts] = useState<ProductWithProducer[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getProducts();
      setProducts(data);
    } catch {
      showToast('error', 'Απέτυχε η φόρτωση των προϊόντων');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleToggleStatus = async (productId: number, isActive: boolean) => {
    await adminApi.toggleProductStatus(productId, isActive);
    
    // Optimistic update
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, is_active: isActive }
        : product
    ));
  };

  return (
    <AuthGuard requireAuth={true} requireRole="admin">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Διαχείριση Κατάστασης Προϊόντων</h1>
            <p className="mt-2 text-sm text-gray-600">
              Ενεργοποίηση και απενεργοποίηση προϊόντων
            </p>
          </div>

          <ProductToggle 
            products={products}
            loading={loading}
            onToggleStatus={handleToggleStatus}
          />
        </div>
      </div>
    </AuthGuard>
  );
}