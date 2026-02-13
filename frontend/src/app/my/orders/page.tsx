'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiClient, ProducerOrder, ProducerOrdersResponse } from '@/lib/api';

/**
 * Pass 56: Producer orders page using Laravel API
 * Fixes split-brain issue (was using Prisma while orders created in Laravel)
 */

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const TABS: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered'];

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Εκκρεμείς',
  confirmed: 'Επιβεβαιωμένες',
  processing: 'Σε επεξεργασία',
  shipped: 'Απεσταλμένες',
  delivered: 'Παραδοθείσες',
  cancelled: 'Ακυρωμένες',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-teal-100 text-teal-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

// Pass 58: Valid status transitions for producers
const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  pending: 'processing',
  confirmed: 'processing',
  processing: 'shipped',
  shipped: 'delivered',
  delivered: null, // terminal state
  cancelled: null, // terminal state
};

const NEXT_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Σε Επεξεργασία',
  confirmed: 'Σε Επεξεργασία',
  processing: 'Απεστάλη',
  shipped: 'Παραδόθηκε',
  delivered: '',
  cancelled: '',
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('el-GR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatMoney(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '—';
  return `${num.toFixed(2)} €`;
}

function ProducerOrdersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get('tab') as OrderStatus | null;
  const currentTab: OrderStatus = TABS.includes(tabParam as OrderStatus)
    ? (tabParam as OrderStatus)
    : 'pending';

  const [orders, setOrders] = useState<ProducerOrder[]>([]);
  const [meta, setMeta] = useState<ProducerOrdersResponse['meta'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.getProducerOrders(currentTab);
        if (response.success) {
          setOrders(response.orders);
          setMeta(response.meta);
        } else {
          setError('Αποτυχία φόρτωσης παραγγελιών');
        }
      } catch (err) {
        console.error('Failed to fetch producer orders:', err);
        setError('Σφάλμα σύνδεσης με τον διακομιστή');
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [currentTab]);

  function handleTabChange(tab: OrderStatus) {
    router.push(`/my/orders?tab=${tab}`);
  }

  async function handleExport() {
    setExporting(true);
    try {
      const blob = await apiClient.exportProducerOrdersCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to export orders:', err);
      setError('Αποτυχία εξαγωγής παραγγελιών');
    } finally {
      setExporting(false);
    }
  }

  // Pass 58: Handle status update
  async function handleStatusUpdate(orderId: number, newStatus: 'processing' | 'shipped' | 'delivered') {
    setUpdatingOrderId(orderId);
    setError(null);
    try {
      const response = await apiClient.updateProducerOrderStatus(orderId, newStatus);
      if (response.success) {
        // Optimistic update: update the order in state
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
        // Update meta counts
        if (meta) {
          const oldStatus = orders.find((o) => o.id === orderId)?.status;
          if (oldStatus && oldStatus !== newStatus) {
            setMeta({
              ...meta,
              [oldStatus]: Math.max(0, meta[oldStatus] - 1),
              [newStatus]: meta[newStatus] + 1,
            });
          }
        }
      } else {
        setError('Αποτυχία ενημέρωσης κατάστασης');
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
      setError('Σφάλμα ενημέρωσης κατάστασης');
    } finally {
      setUpdatingOrderId(null);
    }
  }

  return (
    <>
      {/* Export button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleExport}
          disabled={exporting}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          data-testid="export-csv-button"
        >
          {exporting ? (
            <>
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Εξαγωγή...
            </>
          ) : (
            'Εξαγωγή CSV'
          )}
        </button>
      </div>

      {/* Status tabs */}
      <nav className="flex flex-wrap gap-2 mb-6" role="tablist">
        {TABS.map((tab) => {
          const isActive = tab === currentTab;
          const count = meta ? meta[tab] : 0;

          return (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-4 py-2 border rounded-lg transition-colors flex items-center gap-2 ${
                isActive
                  ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              role="tab"
              aria-selected={isActive}
              data-testid={`tab-${tab}`}
            >
              {STATUS_LABELS[tab]}
              {meta && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-blue-200' : 'bg-gray-200'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-12" data-testid="loading">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Φόρτωση παραγγελιών...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
          role="alert"
          data-testid="error"
        >
          {error}
        </div>
      )}

      {/* Orders list */}
      {!loading && !error && (
        <div className="space-y-4" data-testid="orders-list">
          {orders.length === 0 ? (
            <div
              className="text-center text-gray-600 py-12 bg-gray-50 rounded-lg"
              data-testid="empty-state"
            >
              <p className="text-lg">Δεν υπάρχουν παραγγελίες σε αυτή την κατάσταση.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
                data-testid={`order-${order.id}`}
              >
                {/* Order header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">
                      Παραγγελία #{order.id}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[order.status]}`}
                  >
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>

                {/* Customer info */}
                {order.user && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">Πελάτης</p>
                    <p className="text-sm">{order.user.name}</p>
                    <p className="text-sm text-gray-600">{order.user.email}</p>
                  </div>
                )}

                {/* Order items (only producer's items) */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Τα προϊόντα σας σε αυτή την παραγγελία:
                  </p>
                  <ul className="space-y-2">
                    {order.orderItems.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between items-center text-sm border-b border-gray-100 pb-2"
                      >
                        <div>
                          <span className="font-medium">
                            {item.product_name || '—'}
                          </span>
                          <span className="text-gray-500 ml-2">
                            x{item.quantity}
                          </span>
                        </div>
                        <span className="text-gray-700">
                          {formatMoney(item.total_price)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Order total (producer's portion) */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="font-medium">Σύνολο (τα προϊόντα σας)</span>
                  <span className="font-bold text-lg">
                    {formatMoney(
                      order.orderItems.reduce(
                        (sum, item) =>
                          sum + parseFloat(String(item.total_price) || '0'),
                        0
                      )
                    )}
                  </span>
                </div>

                {/* Pass 58: Status update button */}
                {NEXT_STATUS[order.status] && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() =>
                        handleStatusUpdate(order.id, NEXT_STATUS[order.status] as 'processing' | 'shipped' | 'delivered')
                      }
                      disabled={updatingOrderId === order.id}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      data-testid={`status-update-${order.id}`}
                    >
                      {updatingOrderId === order.id ? (
                        <>
                          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          Ενημέρωση...
                        </>
                      ) : (
                        <>Αλλαγή σε: {NEXT_STATUS_LABELS[order.status]}</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Summary */}
      {meta && !loading && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Σύνολο παραγγελιών: <strong>{meta.total}</strong>
          </p>
        </div>
      )}
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="text-center py-12" data-testid="suspense-loading">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
      <p className="text-gray-600">Φόρτωση...</p>
    </div>
  );
}

export default function ProducerOrdersPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Οι Παραγγελίες μου</h1>

      <Suspense fallback={<LoadingFallback />}>
        <ProducerOrdersContent />
      </Suspense>
    </main>
  );
}
