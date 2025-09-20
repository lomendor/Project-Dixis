'use client';

import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { useToast } from '@/contexts/ToastContext';

interface Order {
  id: string;
  user_id: number;
  status: 'draft' | 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  currency: string;
  items_count: number;
  created_at: string;
  updated_at: string;
  customer: {
    name: string;
    email: string;
  };
  shipping_address?: {
    name: string;
    city: string;
    postal_code: string;
  };
}

interface OrderFilters {
  status: 'all' | Order['status'];
  dateRange: 'all' | 'today' | 'week' | 'month';
  search: string;
}

export default function OrdersOverview() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [filters, setFilters] = useState<OrderFilters>({
    status: 'all',
    dateRange: 'all',
    search: '',
  });
  const { showToast } = useToast();

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, filters]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      // Mock data - in real app would fetch from API
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockOrders: Order[] = [
        {
          id: 'ORDER-1726423800123',
          user_id: 1,
          status: 'delivered',
          total: 28.30,
          currency: 'EUR',
          items_count: 3,
          created_at: '2025-09-10T10:30:00.000Z',
          updated_at: '2025-09-14T16:45:00.000Z',
          customer: {
            name: 'Άννα Κωνσταντίνου',
            email: 'anna@example.com',
          },
          shipping_address: {
            name: 'Άννα Κωνσταντίνου',
            city: 'Αθήνα',
            postal_code: '10671',
          },
        },
        {
          id: 'ORDER-1726423900456',
          user_id: 2,
          status: 'shipped',
          total: 15.80,
          currency: 'EUR',
          items_count: 2,
          created_at: '2025-09-12T14:15:00.000Z',
          updated_at: '2025-09-15T09:30:00.000Z',
          customer: {
            name: 'Γιάννης Παπαδάκης',
            email: 'giannis@example.com',
          },
          shipping_address: {
            name: 'Γιάννης Παπαδάκης',
            city: 'Θεσσαλονίκη',
            postal_code: '54636',
          },
        },
        {
          id: 'ORDER-1726424000789',
          user_id: 3,
          status: 'processing',
          total: 42.50,
          currency: 'EUR',
          items_count: 5,
          created_at: '2025-09-14T11:20:00.000Z',
          updated_at: '2025-09-15T08:15:00.000Z',
          customer: {
            name: 'Μαρία Γεωργίου',
            email: 'maria@example.com',
          },
          shipping_address: {
            name: 'Μαρία Γεωργίου',
            city: 'Πάτρα',
            postal_code: '26221',
          },
        },
        {
          id: 'ORDER-1726424100012',
          user_id: 4,
          status: 'paid',
          total: 8.90,
          currency: 'EUR',
          items_count: 1,
          created_at: '2025-09-15T09:45:00.000Z',
          updated_at: '2025-09-15T09:45:00.000Z',
          customer: {
            name: 'Νίκος Σταμάτης',
            email: 'nikos@example.com',
          },
          shipping_address: {
            name: 'Νίκος Σταμάτης',
            city: 'Ηράκλειο',
            postal_code: '71201',
          },
        },
        {
          id: 'ORDER-1726424200345',
          user_id: 5,
          status: 'pending',
          total: 19.60,
          currency: 'EUR',
          items_count: 3,
          created_at: '2025-09-15T16:30:00.000Z',
          updated_at: '2025-09-15T16:30:00.000Z',
          customer: {
            name: 'Ελένη Δημητρίου',
            email: 'eleni@example.com',
          },
        },
        {
          id: 'DRAFT-1726424300678',
          user_id: 6,
          status: 'draft',
          total: 0,
          currency: 'EUR',
          items_count: 0,
          created_at: '2025-09-15T18:15:00.000Z',
          updated_at: '2025-09-15T18:15:00.000Z',
          customer: {
            name: 'Κώστας Μιχαήλ',
            email: 'kostas@example.com',
          },
        },
        {
          id: 'ORDER-1726424400901',
          user_id: 7,
          status: 'cancelled',
          total: 12.40,
          currency: 'EUR',
          items_count: 2,
          created_at: '2025-09-13T12:00:00.000Z',
          updated_at: '2025-09-14T10:20:00.000Z',
          customer: {
            name: 'Σοφία Αντωνίου',
            email: 'sofia@example.com',
          },
        },
      ];

      setOrders(mockOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
      showToast('error', 'Απέτυχε η φόρτωση των παραγγελιών');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter(order => new Date(order.created_at) >= filterDate);
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchLower) ||
        order.customer.name.toLowerCase().includes(searchLower) ||
        order.customer.email.toLowerCase().includes(searchLower)
      );
    }

    setFilteredOrders(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      draft: { label: 'Προσχέδιο', className: 'bg-gray-100 text-gray-800' },
      pending: { label: 'Εκκρεμεί', className: 'bg-yellow-100 text-yellow-800' },
      paid: { label: 'Πληρωμένη', className: 'bg-green-100 text-green-800' },
      processing: { label: 'Επεξεργασία', className: 'bg-blue-100 text-blue-800' },
      shipped: { label: 'Αποστολή', className: 'bg-purple-100 text-purple-800' },
      delivered: { label: 'Παραδόθηκε', className: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Ακυρώθηκε', className: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('el-GR', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('el-GR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    revenue: orders
      .filter(o => ['paid', 'processing', 'shipped', 'delivered'].includes(o.status))
      .reduce((sum, o) => sum + o.total, 0),
  };

  return (
    <AuthGuard requireAuth={true} requireRole="admin">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900" data-testid="orders-overview-title">
              Επισκόπηση Παραγγελιών
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Παρακολούθηση και διαχείριση όλων των παραγγελιών
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8" data-testid="orders-stats">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-sm font-medium text-gray-500">Σύνολο</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-sm font-medium text-gray-500">Εκκρεμεί</div>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-sm font-medium text-gray-500">Επεξεργασία</div>
              <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-sm font-medium text-gray-500">Αποστολή</div>
              <div className="text-2xl font-bold text-purple-600">{stats.shipped}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-sm font-medium text-gray-500">Έσοδα</div>
              <div className="text-2xl font-bold text-green-600">
                {formatPrice(stats.revenue, 'EUR')}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Αναζήτηση
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="ID, όνομα ή email..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  data-testid="search-input"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Κατάσταση
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  data-testid="status-filter"
                >
                  <option value="all">Όλες</option>
                  <option value="draft">Προσχέδιο</option>
                  <option value="pending">Εκκρεμεί</option>
                  <option value="paid">Πληρωμένη</option>
                  <option value="processing">Επεξεργασία</option>
                  <option value="shipped">Αποστολή</option>
                  <option value="delivered">Παραδόθηκε</option>
                  <option value="cancelled">Ακυρώθηκε</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Περίοδος
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  data-testid="date-filter"
                >
                  <option value="all">Όλες οι ημερομηνίες</option>
                  <option value="today">Σήμερα</option>
                  <option value="week">Τελευταία εβδομάδα</option>
                  <option value="month">Τελευταίος μήνας</option>
                </select>
              </div>

              {/* Results Info */}
              <div className="flex items-end">
                <div className="text-sm text-gray-600">
                  {filteredOrders.length} από {orders.length} παραγγελίες
                </div>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white shadow-sm border rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Φόρτωση παραγγελιών...</p>
              </div>
            ) : paginatedOrders.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600">Δεν βρέθηκαν παραγγελίες για τα επιλεγμένα φίλτρα</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200" data-testid="orders-table">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Παραγγελία
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Πελάτης
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Αντικείμενα
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
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedOrders.map((order) => (
                      <tr key={order.id} data-testid={`order-row-${order.id}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 font-mono">
                              {order.id}
                            </div>
                            {order.shipping_address && (
                              <div className="text-sm text-gray-500">
                                {order.shipping_address.city}, {order.shipping_address.postal_code}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.customer.name}
                            </div>
                            <div className="text-sm text-gray-500">{order.customer.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.items_count} τεμ.</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatPrice(order.total, order.currency)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Εμφάνιση {startIndex + 1}-{Math.min(endIndex, filteredOrders.length)} από {filteredOrders.length} παραγγελίες
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  data-testid="prev-page"
                >
                  Προηγούμενη
                </button>
                <span className="px-3 py-2 text-sm border border-gray-300 rounded bg-blue-50">
                  {currentPage} από {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  data-testid="next-page"
                >
                  Επόμενη
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}