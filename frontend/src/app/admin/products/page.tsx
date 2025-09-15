'use client';

import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { useToast } from '@/contexts/ToastContext';

interface Product {
  id: number;
  name: string;
  title: string;
  price: number;
  currency: string;
  stock: number;
  is_active: boolean;
  status: 'available' | 'out_of_stock' | 'discontinued';
  created_at: string;
  updated_at: string;
  producer: {
    id: number;
    name: string;
    business_name: string;
  };
}

interface Filters {
  status: 'all' | 'active' | 'inactive';
  producerId: number | null;
  search: string;
}

export default function ProductsOverview() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [filters, setFilters] = useState<Filters>({
    status: 'all',
    producerId: null,
    search: '',
  });
  const { showToast } = useToast();

  // Mock producers for filter dropdown
  const producers = [
    { id: 1, name: 'Παπαδόπουλος Αγρόκτημα' },
    { id: 2, name: 'Γιαννοπούλου Βιολογικά' },
    { id: 3, name: 'Κωνσταντίνου Φάρμα' },
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, filters]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Mock data - in real app would fetch from API
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockProducts: Product[] = [
        {
          id: 1,
          name: 'biologikes-tomates-kritis',
          title: 'Βιολογικές Ντομάτες Κρήτης',
          price: 3.50,
          currency: 'EUR',
          stock: 25,
          is_active: true,
          status: 'available',
          created_at: '2025-09-10T10:00:00.000Z',
          updated_at: '2025-09-15T14:30:00.000Z',
          producer: {
            id: 1,
            name: 'Δημήτρης Παπαδόπουλος',
            business_name: 'Παπαδόπουλος Αγρόκτημα',
          },
        },
        {
          id: 2,
          name: 'elaiólado-extra-partheno',
          title: 'Εξαιρετικό Παρθένο Ελαιόλαδο',
          price: 12.80,
          currency: 'EUR',
          stock: 15,
          is_active: true,
          status: 'available',
          created_at: '2025-09-12T09:15:00.000Z',
          updated_at: '2025-09-15T16:45:00.000Z',
          producer: {
            id: 1,
            name: 'Δημήτρης Παπαδόπουλος',
            business_name: 'Παπαδόπουλος Αγρόκτημα',
          },
        },
        {
          id: 3,
          name: 'meli-thymari-kritis',
          title: 'Μέλι Θυμαρισιό Κρήτης',
          price: 8.50,
          currency: 'EUR',
          stock: 0,
          is_active: false,
          status: 'out_of_stock',
          created_at: '2025-09-08T11:20:00.000Z',
          updated_at: '2025-09-14T08:15:00.000Z',
          producer: {
            id: 1,
            name: 'Δημήτρης Παπαδόπουλος',
            business_name: 'Παπαδόπουλος Αγρόκτημα',
          },
        },
        {
          id: 4,
          name: 'kremmydia-kozanis',
          title: 'Κρεμμύδια Κοζάνης ΠΟΠ',
          price: 2.90,
          currency: 'EUR',
          stock: 40,
          is_active: true,
          status: 'available',
          created_at: '2025-09-14T15:30:00.000Z',
          updated_at: '2025-09-15T10:15:00.000Z',
          producer: {
            id: 2,
            name: 'Μαρία Γιαννοπούλου',
            business_name: 'Γιαννοπούλου Βιολογικά',
          },
        },
        {
          id: 5,
          name: 'patates-naxou',
          title: 'Πατάτες Νάξου',
          price: 1.80,
          currency: 'EUR',
          stock: 50,
          is_active: false,
          status: 'discontinued',
          created_at: '2025-09-05T14:20:00.000Z',
          updated_at: '2025-09-13T16:45:00.000Z',
          producer: {
            id: 3,
            name: 'Νίκος Κωνσταντίνου',
            business_name: 'Κωνσταντίνου Φάρμα',
          },
        },
      ];

      setProducts(mockProducts);
    } catch (error) {
      console.error('Failed to load products:', error);
      showToast('error', 'Απέτυχε η φόρτωση των προϊόντων');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(product =>
        filters.status === 'active' ? product.is_active : !product.is_active
      );
    }

    // Producer filter
    if (filters.producerId) {
      filtered = filtered.filter(product => product.producer.id === filters.producerId);
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchLower) ||
        product.producer.business_name.toLowerCase().includes(searchLower)
      );
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const getStatusBadge = (product: Product) => {
    if (!product.is_active) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Ανενεργό</span>;
    }

    const statusConfig = {
      available: { label: 'Διαθέσιμο', className: 'bg-green-100 text-green-800' },
      out_of_stock: { label: 'Εξαντλημένο', className: 'bg-yellow-100 text-yellow-800' },
      discontinued: { label: 'Διακοπή', className: 'bg-gray-100 text-gray-800' },
    };

    const config = statusConfig[product.status];
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
    });
  };

  return (
    <AuthGuard requireAuth={true} requireRole="admin">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900" data-testid="products-overview-title">
              Επισκόπηση Προϊόντων
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Διαχείριση και παρακολούθηση όλων των προϊόντων στο marketplace
            </p>
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
                  placeholder="Προϊόν ή παραγωγός..."
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
                  <option value="all">Όλα</option>
                  <option value="active">Ενεργά</option>
                  <option value="inactive">Ανενεργά</option>
                </select>
              </div>

              {/* Producer Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Παραγωγός
                </label>
                <select
                  value={filters.producerId || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    producerId: e.target.value ? parseInt(e.target.value) : null
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  data-testid="producer-filter"
                >
                  <option value="">Όλοι οι παραγωγοί</option>
                  {producers.map(producer => (
                    <option key={producer.id} value={producer.id}>
                      {producer.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Results Info */}
              <div className="flex items-end">
                <div className="text-sm text-gray-600">
                  {filteredProducts.length} από {products.length} προϊόντα
                </div>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white shadow-sm border rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Φόρτωση προϊόντων...</p>
              </div>
            ) : paginatedProducts.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600">Δεν βρέθηκαν προϊόντα για τα επιλεγμένα φίλτρα</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200" data-testid="products-table">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Προϊόν
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Παραγωγός
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Τιμή
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Απόθεμα
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
                    {paginatedProducts.map((product) => (
                      <tr key={product.id} data-testid={`product-row-${product.id}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.title}</div>
                            <div className="text-sm text-gray-500">{product.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{product.producer.business_name}</div>
                          <div className="text-sm text-gray-500">{product.producer.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatPrice(product.price, product.currency)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${
                            product.stock > 10 ? 'text-green-600' :
                            product.stock > 0 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {product.stock} τεμ.
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(product)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(product.created_at)}
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
                Εμφάνιση {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} από {filteredProducts.length} προϊόντα
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