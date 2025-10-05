'use client';

import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';

interface ProducerApplication {
  id: number;
  userId: number;
  userEmail: string;
  displayName: string;
  taxId?: string;
  phone?: string;
  imageUrl?: string;
  status: 'pending' | 'active' | 'inactive';
  submittedAt: string;
  updatedAt: string;
}

export default function AdminProducersPage() {
  return (
    <AuthGuard requireAuth={true} requireRole="admin">
      <AdminProducersContent />
    </AuthGuard>
  );
}

function AdminProducersContent() {
  const [producers, setProducers] = useState<ProducerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    loadProducers();
  }, []);

  const loadProducers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/producers');
      if (response.ok) {
        const data = await response.json();
        setProducers(data.producers || []);
      } else {
        setError('Αποτυχία φόρτωσης αιτήσεων παραγωγών');
      }
    } catch {
      setError('Σφάλμα δικτύου κατά τη φόρτωση');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (producerId: number, newStatus: 'active' | 'inactive') => {
    setActionLoading(producerId);
    setError('');
    setSuccess('');

    try {
      const endpoint = newStatus === 'active' ? 'approve' : 'reject';
      const response = await fetch(`/api/admin/producers/${producerId}/${endpoint}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state
        setProducers(prev =>
          prev.map(producer =>
            producer.id === producerId
              ? { ...producer, status: newStatus, updatedAt: new Date().toISOString() }
              : producer
          )
        );

        const actionText = newStatus === 'active' ? 'εγκρίθηκε' : 'απορρίφθηκε';
        setSuccess(`Η αίτηση ${actionText} επιτυχώς`);
      } else {
        setError(data.error || 'Παρουσιάστηκε σφάλμα');
      }
    } catch {
      setError('Σφάλμα δικτύου');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      pending: { class: 'bg-yellow-100 text-yellow-800', text: 'Εκκρεμότητα' },
      active: { class: 'bg-green-100 text-green-800', text: 'Εγκεκριμένος' },
      inactive: { class: 'bg-red-100 text-red-800', text: 'Απορρίφθηκε' },
    };

    const config = configs[status as keyof typeof configs] || configs.pending;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900" data-testid="page-title">
              Διαχείριση Αιτήσεων Παραγωγών
            </h1>
            <p className="mt-1 text-gray-600">
              Έγκριση και απόρριψη αιτήσεων για νέους παραγωγούς
            </p>
          </div>

          {error && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" data-testid="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="mx-6 mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg" data-testid="success-message">
              {success}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200" data-testid="producers-table">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email Χρήστη
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Όνομα Εμφάνισης
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ΑΦΜ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Εικόνα
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Κατάσταση
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Υποβολή
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ενέργειες
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {producers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500" data-testid="no-producers-message">
                      Δεν υπάρχουν αιτήσεις παραγωγών προς εξέταση
                    </td>
                  </tr>
                ) : (
                  producers.map((producer) => (
                    <tr key={producer.id} data-testid={`producer-row-${producer.id}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" data-testid={`producer-id-${producer.id}`}>
                        {producer.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" data-testid={`user-email-${producer.id}`}>
                        {producer.userEmail}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" data-testid={`display-name-${producer.id}`}>
                        {producer.displayName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" data-testid={`tax-id-${producer.id}`}>
                        {producer.taxId || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" data-testid={`image-url-${producer.id}`}>
                        {producer.imageUrl ? (
                          <img src={producer.imageUrl} alt={producer.displayName} className="h-12 w-12 object-cover rounded" />
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap" data-testid={`status-${producer.id}`}>
                        {getStatusBadge(producer.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" data-testid={`submitted-at-${producer.id}`}>
                        {new Date(producer.submittedAt).toLocaleDateString('el-GR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        {producer.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(producer.id, 'active')}
                              disabled={actionLoading === producer.id}
                              className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              data-testid={`approve-btn-${producer.id}`}
                            >
                              {actionLoading === producer.id ? 'Επεξεργασία...' : 'Έγκριση'}
                            </button>
                            <button
                              onClick={() => handleStatusChange(producer.id, 'inactive')}
                              disabled={actionLoading === producer.id}
                              className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              data-testid={`reject-btn-${producer.id}`}
                            >
                              {actionLoading === producer.id ? 'Επεξεργασία...' : 'Απόρριψη'}
                            </button>
                          </>
                        )}

                        {producer.status === 'active' && (
                          <button
                            onClick={() => handleStatusChange(producer.id, 'inactive')}
                            disabled={actionLoading === producer.id}
                            className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            data-testid={`deactivate-btn-${producer.id}`}
                          >
                            Απενεργοποίηση
                          </button>
                        )}

                        {producer.status === 'inactive' && (
                          <button
                            onClick={() => handleStatusChange(producer.id, 'active')}
                            disabled={actionLoading === producer.id}
                            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            data-testid={`reactivate-btn-${producer.id}`}
                          >
                            Επανενεργοποίηση
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Σύνολο: {producers.length} αιτήσεις
                {producers.filter(p => p.status === 'pending').length > 0 && (
                  <span className="ml-2 text-yellow-600">
                    ({producers.filter(p => p.status === 'pending').length} εκκρεμείς)
                  </span>
                )}
              </div>
              <button
                onClick={loadProducers}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                data-testid="refresh-btn"
              >
                Ανανέωση
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}