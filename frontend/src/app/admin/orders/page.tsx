'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { validateOrderStatusUpdate, getValidOrderStatusTransitions, type OrderStatus } from '@/lib/order-status-validator';
import { useToast } from '@/contexts/ToastContext';

interface Order {
  id: number;
  user_id: number;
  status: OrderStatus;
  total_amount: string;
  payment_status: string;
  payment_method: string;
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
  shipped: 'Αποστολή',
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
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

  const updateOrderStatus = async (orderId: number, newStatus: OrderStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const validation = validateOrderStatusUpdate(order.status, newStatus);
    if (!validation.isValid) {
      showError(validation.error || 'Μη έγκυρη μετάβαση κατάστασης');
      return;
    }

    setUpdating(orderId);

    try {
      await fetch(`/api/admin/orders/${orderId}/update-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiClient.getToken()}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, status: newStatus } : o
      ));
      showSuccess(`Η κατάσταση της παραγγελίας #${orderId} ενημερώθηκε σε "${statusLabels[newStatus]}"`);
    } catch (error) {
      console.error('Σφάλμα ενημέρωσης κατάστασης:', error);
      showError('Σφάλμα ενημέρωσης κατάστασης παραγγελίας');
    } finally {
      setUpdating(null);
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Διαχείριση Παραγγελιών</h1>
        <p className="mt-2 text-gray-600">Διαχειριστείτε όλες τις παραγγελίες και ενημερώστε την κατάστασή τους</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Δεν υπάρχουν παραγγελίες</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Παραγγελία
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Πελάτης
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Σύνολο
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Κατάσταση
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ημερομηνία
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ενέργειες
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => {
                  const validTransitions = getValidOrderStatusTransitions(order.status);

                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                        <div className="text-sm text-gray-500">
                          {order.items.length} προϊό{order.items.length === 1 ? 'ν' : 'ντα'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">ID: {order.user_id}</div>
                        {order.city && (
                          <div className="text-sm text-gray-500">{order.city}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">€{order.total_amount}</div>
                        <div className="text-sm text-gray-500">{order.payment_method}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[order.status]}`}>
                          {statusLabels[order.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('el-GR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {validTransitions.length > 0 ? (
                          <select
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                updateOrderStatus(order.id, e.target.value as OrderStatus);
                              }
                            }}
                            disabled={updating === order.id}
                            className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Αλλαγή κατάστασης</option>
                            {validTransitions.map(status => (
                              <option key={status} value={status}>
                                {statusLabels[status]}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-sm text-gray-400">Χωρίς ενέργειες</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}