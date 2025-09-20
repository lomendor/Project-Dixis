'use client';

import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { useToast } from '@/contexts/ToastContext';

interface Producer {
  id: number;
  name: string;
  business_name: string;
  email: string;
  phone?: string;
  location: string;
  status: 'pending' | 'active' | 'rejected';
  created_at: string;
  updated_at: string;
}

export default function ProducersManagement() {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'rejected'>('all');
  const { showToast } = useToast();

  useEffect(() => {
    loadProducers();
  }, []);

  const loadProducers = async () => {
    try {
      setLoading(true);
      // Mock data - in real app would fetch from API
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockProducers: Producer[] = [
        {
          id: 1,
          name: 'Δημήτρης Παπαδόπουλος',
          business_name: 'Παπαδόπουλος Αγρόκτημα',
          email: 'dimitris@papadopoulos-farm.gr',
          phone: '+30 210 1234567',
          location: 'Κρήτη',
          status: 'active',
          created_at: '2025-09-10T10:00:00.000Z',
          updated_at: '2025-09-12T14:30:00.000Z',
        },
        {
          id: 2,
          name: 'Μαρία Γιαννοπούλου',
          business_name: 'Γιαννοπούλου Βιολογικά',
          email: 'maria@giannopoulou-organic.gr',
          phone: '+30 231 9876543',
          location: 'Θεσσαλονίκη',
          status: 'pending',
          created_at: '2025-09-14T09:15:00.000Z',
          updated_at: '2025-09-14T09:15:00.000Z',
        },
        {
          id: 3,
          name: 'Νίκος Κωνσταντίνου',
          business_name: 'Κωνσταντίνου Φάρμα',
          email: 'nikos@konstantinou-farm.gr',
          location: 'Πάτρα',
          status: 'pending',
          created_at: '2025-09-15T16:45:00.000Z',
          updated_at: '2025-09-15T16:45:00.000Z',
        },
        {
          id: 4,
          name: 'Ελένη Μιχαηλίδου',
          business_name: 'Μιχαηλίδου Ελαιώνες',
          email: 'eleni@michailidou-olives.gr',
          location: 'Καλαμάτα',
          status: 'rejected',
          created_at: '2025-09-08T11:20:00.000Z',
          updated_at: '2025-09-13T08:15:00.000Z',
        },
      ];
      setProducers(mockProducers);
    } catch (error) {
      console.error('Failed to load producers:', error);
      showToast('error', 'Απέτυχε η φόρτωση των παραγωγών');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (producerId: number, newStatus: 'active' | 'rejected') => {
    try {
      // Mock API call - in real app would call API
      await new Promise(resolve => setTimeout(resolve, 300));

      setProducers(prev => prev.map(producer =>
        producer.id === producerId
          ? { ...producer, status: newStatus, updated_at: new Date().toISOString() }
          : producer
      ));

      const statusText = newStatus === 'active' ? 'εγκρίθηκε' : 'απορρίφθηκε';
      showToast('success', `Ο παραγωγός ${statusText} επιτυχώς`);
    } catch (error) {
      console.error('Failed to update producer status:', error);
      showToast('error', 'Απέτυχε η ενημέρωση της κατάστασης');
    }
  };

  const filteredProducers = producers.filter(producer =>
    filter === 'all' || producer.status === filter
  );

  const getStatusBadge = (status: Producer['status']) => {
    const statusConfig = {
      pending: { label: 'Εκκρεμεί', className: 'bg-yellow-100 text-yellow-800' },
      active: { label: 'Ενεργός', className: 'bg-green-100 text-green-800' },
      rejected: { label: 'Απορρίφθηκε', className: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('el-GR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AuthGuard requireAuth={true} requireRole="admin">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900" data-testid="producers-title">
              Διαχείριση Παραγωγών
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Έγκριση και διαχείριση παραγωγών στο marketplace
            </p>
          </div>

          {/* Filters */}
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'Όλοι' },
                { key: 'pending', label: 'Εκκρεμεί' },
                { key: 'active', label: 'Ενεργοί' },
                { key: 'rejected', label: 'Απορριφθέντες' },
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key as any)}
                  className={`px-4 py-2 text-sm rounded ${
                    filter === filterOption.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  data-testid={`filter-${filterOption.key}`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
          </div>

          {/* Producers Table */}
          <div className="bg-white shadow-sm border rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Φόρτωση παραγωγών...</p>
              </div>
            ) : filteredProducers.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600">Δεν βρέθηκαν παραγωγοί για το επιλεγμένο φίλτρο</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200" data-testid="producers-table">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Παραγωγός
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Επιχείρηση
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Τοποθεσία
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
                    {filteredProducers.map((producer) => (
                      <tr key={producer.id} data-testid={`producer-row-${producer.id}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{producer.name}</div>
                            <div className="text-sm text-gray-500">{producer.email}</div>
                            {producer.phone && (
                              <div className="text-sm text-gray-500">{producer.phone}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{producer.business_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{producer.location}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(producer.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(producer.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          {producer.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(producer.id, 'active')}
                                className="text-green-600 hover:text-green-900"
                                data-testid={`approve-producer-${producer.id}`}
                              >
                                Έγκριση
                              </button>
                              <button
                                onClick={() => handleStatusChange(producer.id, 'rejected')}
                                className="text-red-600 hover:text-red-900"
                                data-testid={`reject-producer-${producer.id}`}
                              >
                                Απόρριψη
                              </button>
                            </>
                          )}
                          {producer.status === 'active' && (
                            <button
                              onClick={() => handleStatusChange(producer.id, 'rejected')}
                              className="text-red-600 hover:text-red-900"
                              data-testid={`deactivate-producer-${producer.id}`}
                            >
                              Απενεργοποίηση
                            </button>
                          )}
                          {producer.status === 'rejected' && (
                            <button
                              onClick={() => handleStatusChange(producer.id, 'active')}
                              className="text-green-600 hover:text-green-900"
                              data-testid={`reactivate-producer-${producer.id}`}
                            >
                              Επανενεργοποίηση
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-blue-800">
                <strong>Σύνοψη:</strong> {filteredProducers.length} παραγωγοί εμφανίζονται
                {filter !== 'all' && ` (φίλτρο: ${filter})`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}