'use client';

import { useState } from 'react';
import { ProducerWithStatus, formatCurrency, formatDate } from '@/lib/admin/adminApi';
import { useToast } from '@/contexts/ToastContext';

interface ProducerListProps {
  producers: ProducerWithStatus[];
  loading: boolean;
  onUpdateStatus: (producerId: number, status: 'approved' | 'rejected') => Promise<void>;
}

export default function ProducerList({ producers, loading, onUpdateStatus }: ProducerListProps) {
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());
  const { showToast } = useToast();

  const handleStatusUpdate = async (producerId: number, status: 'approved' | 'rejected') => {
    try {
      setUpdatingIds(prev => new Set([...prev, producerId]));
      await onUpdateStatus(producerId, status);
      showToast('success', `Η κατάσταση του παραγωγού ενημερώθηκε σε "${status === 'approved' ? 'εγκεκριμένος' : 'απορρίφθηκε'}"`);
    } catch (error) {
      showToast('error', 'Απέτυχε η ενημέρωση της κατάστασης');
    } finally {
      setUpdatingIds(prev => {
        const next = new Set(prev);
        next.delete(producerId);
        return next;
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Εγκεκριμένος';
      case 'rejected':
        return 'Απορρίφθηκε';
      case 'pending':
        return 'Εκκρεμεί';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="animate-pulse">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="border-b border-gray-200 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                      <div>
                        <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-48"></div>
                      </div>
                    </div>
                    <div className="h-6 bg-gray-300 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (producers.length === 0) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-8 sm:p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">Δεν βρέθηκαν παραγωγοί</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Διαχείριση Παραγωγών ({producers.length})
        </h3>
        
        <div className="flow-root">
          <ul role="list" className="-mb-8">
            {producers.map((producer, index) => (
              <li key={producer.id} className={index !== producers.length - 1 ? 'pb-8' : ''}>
                <div className="relative">
                  {index !== producers.length - 1 && (
                    <span className="absolute top-10 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                  )}
                  
                  <div className="relative flex items-start space-x-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white">
                        <span className="text-white font-medium text-sm">
                          {producer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">{producer.name}</p>
                            <span className={getStatusBadge(producer.status)}>
                              {getStatusText(producer.status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{producer.email}</p>
                          {producer.business_name && (
                            <p className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">Επιχείρηση:</span> {producer.business_name}
                            </p>
                          )}
                          {producer.location && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Τοποθεσία:</span> {producer.location}
                            </p>
                          )}
                          {producer.phone && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Τηλέφωνο:</span> {producer.phone}
                            </p>
                          )}
                          
                          <div className="mt-2 flex space-x-4 text-sm text-gray-500">
                            <span>{producer.products_count} προϊόντα</span>
                            <span>{producer.total_orders} παραγγελίες</span>
                            <span>{formatCurrency(producer.total_revenue)} έσοδα</span>
                          </div>
                          
                          <p className="text-xs text-gray-400 mt-2">
                            Εγγραφή: {formatDate(producer.created_at)}
                          </p>
                        </div>
                        
                        {producer.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              disabled={updatingIds.has(producer.id)}
                              onClick={() => handleStatusUpdate(producer.id, 'approved')}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updatingIds.has(producer.id) ? (
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : null}
                              Έγκριση
                            </button>
                            <button
                              type="button"
                              disabled={updatingIds.has(producer.id)}
                              onClick={() => handleStatusUpdate(producer.id, 'rejected')}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updatingIds.has(producer.id) ? (
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : null}
                              Απόρριψη
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}