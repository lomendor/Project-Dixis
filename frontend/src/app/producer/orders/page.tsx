'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { validateOrderStatusUpdate, type OrderStatus } from '@/lib/order-status-validator';
import { useToast } from '@/contexts/ToastContext';

interface Order {
  id: number;
  user_id: number;
  status: OrderStatus;
  total_amount: string;
  payment_status: string;
  shipping_method: string;
  shipping_address?: string;
  city?: string;
  postal_code?: string;
  notes?: string;
  created_at: string;
  items: OrderItem[];
}

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: string;
  product_name: string;
  product_unit: string;
}

const statusLabels: Record<OrderStatus, string> = {
  draft: 'Προσχέδιο',
  pending: 'Εκκρεμής',
  paid: 'Πληρωμένη',
  shipped: 'Σε αποστολή',
  delivered: 'Παραδόθηκε',
  cancelled: 'Ακυρώθηκε'
};

const statusColors: Record<OrderStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

export default function ProducerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [shipping, setShipping] = useState<number | null>(null);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await apiClient.getOrders();
      setOrders(response.orders as Order[]);
    } catch (error) {
      console.error('Σφάλμα φόρτωσης παραγγελιών:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsShipped = async (orderId: number) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const validation = validateOrderStatusUpdate(order.status, 'shipped');
    if (!validation.isValid) {
      showError(validation.error || 'Δεν είναι δυνατή η αποστολή αυτής της παραγγελίας');
      return;
    }

    setShipping(orderId);

    try {
      await fetch(`/api/producer/orders/${orderId}/ship`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiClient.getToken()}`
        }
      });

      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, status: 'shipped' as OrderStatus } : o
      ));
      showSuccess(`Η παραγγελία #${orderId} σημειώθηκε ως απεσταλμένη`);
    } catch (error) {
      console.error('Σφάλμα ενημέρωσης αποστολής:', error);
      showError('Σφάλμα ενημέρωσης αποστολής παραγγελίας');
    } finally {
      setShipping(null);
    }
  };

  const canMarkAsShipped = (status: OrderStatus): boolean => {
    return status === 'paid';
  };

  const filteredOrders = orders.filter(order =>
    order.status !== 'draft' && order.status !== 'cancelled'
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Φόρτωση παραγγελιών...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Παραγγελίες Προς Αποστολή</h1>
        <p className="mt-2 text-gray-600">Διαχειριστείτε τις παραγγελίες σας και σημειώστε αυτές που έχουν αποσταλεί</p>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-8V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </div>
          <p className="mt-4 text-gray-500 text-lg">Δεν υπάρχουν παραγγελίες προς αποστολή</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Παραγγελία #{order.id}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('el-GR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                    <div className="text-lg font-bold text-gray-900">
                      €{order.total_amount}
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Προϊόντα</h4>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.product_name} ({item.quantity} {item.product_unit})</span>
                          <span className="font-medium">€{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Στοιχεία Αποστολής</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div><strong>Μέθοδος:</strong> {order.shipping_method}</div>
                      {order.shipping_address && (
                        <div><strong>Διεύθυνση:</strong> {order.shipping_address}</div>
                      )}
                      {order.city && order.postal_code && (
                        <div><strong>Περιοχή:</strong> {order.city}, {order.postal_code}</div>
                      )}
                      {order.notes && (
                        <div><strong>Σημειώσεις:</strong> {order.notes}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {canMarkAsShipped(order.status) && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <button
                    onClick={() => markAsShipped(order.id)}
                    disabled={shipping === order.id}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {shipping === order.id ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Ενημέρωση...
                      </span>
                    ) : (
                      'Σημείωση ως Απεσταλμένη'
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}