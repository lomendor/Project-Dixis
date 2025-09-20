'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';

interface AdminStats {
  totalProducers: number;
  pendingProducers: number;
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
}

export default function AdminPanel() {
  const [stats, setStats] = useState<AdminStats>({
    totalProducers: 0,
    pendingProducers: 0,
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      // Mock stats for now - in real app would fetch from API
      await new Promise(resolve => setTimeout(resolve, 500));
      setStats({
        totalProducers: 12,
        pendingProducers: 3,
        totalProducts: 45,
        activeProducts: 38,
        totalOrders: 127,
        pendingOrders: 8,
      });
    } catch (error) {
      console.error('Failed to load admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const adminSections = [
    {
      title: 'Διαχείριση Παραγωγών',
      description: 'Έγκριση και διαχείριση παραγωγών',
      path: '/admin/producers',
      icon: '👨‍🌾',
      stat: `${stats.pendingProducers} εκκρεμεί`,
      testId: 'admin-producers-section'
    },
    {
      title: 'Επισκόπηση Προϊόντων',
      description: 'Προβολή και διαχείριση όλων των προϊόντων',
      path: '/admin/products',
      icon: '📦',
      stat: `${stats.totalProducts} σύνολο`,
      testId: 'admin-products-section'
    },
    {
      title: 'Επισκόπηση Παραγγελιών',
      description: 'Παρακολούθηση παραγγελιών και στατιστικά',
      path: '/admin/orders',
      icon: '📋',
      stat: `${stats.pendingOrders} εκκρεμεί`,
      testId: 'admin-orders-section'
    },
    {
      title: 'Κατάσταση Προϊόντων',
      description: 'Ενεργοποίηση/απενεργοποίηση προϊόντων',
      path: '/admin/toggle',
      icon: '🔄',
      stat: `${stats.activeProducts} ενεργά`,
      testId: 'admin-toggle-section'
    },
    {
      title: 'Διαχείριση Τιμών',
      description: 'Ενημέρωση τιμών και αποθεμάτων',
      path: '/admin/pricing',
      icon: '💰',
      stat: 'Διαθέσιμο',
      testId: 'admin-pricing-section'
    },
    {
      title: 'Αναφορές Analytics',
      description: 'Στατιστικά και αναλυτικά στοιχεία',
      path: '/admin/analytics',
      icon: '📊',
      stat: 'Πραγματικός χρόνος',
      testId: 'admin-analytics-section'
    },
  ];

  return (
    <AuthGuard requireAuth={true} requireRole="admin">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900" data-testid="admin-panel-title">
              Πάνελ Διαχείρισης
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Κεντρικός πίνακας διαχείρισης για το Dixis Marketplace
            </p>
          </div>

          {/* Stats Overview */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" data-testid="admin-stats">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-sm font-medium text-gray-500">Παραγωγοί</div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.totalProducers}
                  <span className="text-sm text-orange-600 ml-2">
                    ({stats.pendingProducers} εκκρεμεί)
                  </span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-sm font-medium text-gray-500">Προϊόντα</div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.totalProducts}
                  <span className="text-sm text-green-600 ml-2">
                    ({stats.activeProducts} ενεργά)
                  </span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-sm font-medium text-gray-500">Παραγγελίες</div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.totalOrders}
                  <span className="text-sm text-blue-600 ml-2">
                    ({stats.pendingOrders} εκκρεμεί)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Admin Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminSections.map((section) => (
              <div
                key={section.path}
                className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(section.path)}
                data-testid={section.testId}
              >
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">{section.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {section.description}
                    </p>
                    <div className="text-sm font-medium text-blue-600">
                      {section.stat}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <span className="text-sm text-gray-400">→</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Γρήγορες Ενέργειες</h3>
            <div className="flex flex-wrap gap-3">
              <button
                className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                onClick={() => router.push('/admin/producers')}
                data-testid="quick-approve-producers"
              >
                Έγκριση Παραγωγών
              </button>
              <button
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => router.push('/admin/orders')}
                data-testid="quick-view-orders"
              >
                Προβολή Παραγγελιών
              </button>
              <button
                className="px-4 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
                onClick={() => router.push('/admin/products')}
                data-testId="quick-manage-products"
              >
                Διαχείριση Προϊόντων
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}