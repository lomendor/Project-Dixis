'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import Navigation from '@/components/Navigation';
import ProducerList from '../components/ProducerList';
import { adminApi, ProducerWithStatus } from '@/lib/admin/adminApi';
import { useToast } from '@/contexts/ToastContext';

export default function ProducersPage() {
  const [producers, setProducers] = useState<ProducerWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const { showToast } = useToast();

  useEffect(() => {
    loadProducers();
  }, []);

  const loadProducers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getProducers();
      setProducers(data);
    } catch (error) {
      console.error('Failed to load producers:', error);
      showToast('error', 'Απέτυχε η φόρτωση των παραγωγών');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (producerId: number, status: 'approved' | 'rejected') => {
    try {
      const updatedProducer = await adminApi.updateProducerStatus(producerId, status);
      setProducers(prev => prev.map(p => p.id === producerId ? updatedProducer : p));
    } catch (error) {
      console.error('Failed to update producer status:', error);
      throw error; // Re-throw for ProducerList to handle
    }
  };

  // Filter producers based on selected filter
  const filteredProducers = producers.filter(producer => {
    if (filter === 'all') return true;
    return producer.status === filter;
  });

  const getStatusCounts = () => {
    const counts = producers.reduce((acc, producer) => {
      acc[producer.status] = (acc[producer.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total: producers.length,
      pending: counts.pending || 0,
      approved: counts.approved || 0,
      rejected: counts.rejected || 0
    };
  };

  const counts = getStatusCounts();

  return (
    <AuthGuard requireAuth={true} requireRole="admin">
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <div className="py-10">
          <header>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div>
                  <nav className="flex" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-4">
                      <li>
                        <div>
                          <Link href="/admin" className="text-gray-400 hover:text-gray-500">
                            <svg className="flex-shrink-0 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                            </svg>
                            <span className="sr-only">Αρχική</span>
                          </Link>
                        </div>
                      </li>
                      <li>
                        <div className="flex items-center">
                          <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="ml-4 text-sm font-medium text-gray-500">Παραγωγοί</span>
                        </div>
                      </li>
                    </ol>
                  </nav>
                  <h1 className="mt-2 text-3xl font-bold leading-tight text-gray-900">
                    Διαχείριση Παραγωγών
                  </h1>
                  <p className="mt-2 text-sm text-gray-600">
                    Διαχείριση και έγκριση παραγωγών στην πλατφόρμα
                  </p>
                </div>
              </div>
            </div>
          </header>

          <main>
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
              {/* Status Filter Tabs */}
              <div className="px-4 py-6 sm:px-0">
                <div className="bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="sm:hidden">
                      <label htmlFor="producer-filter" className="sr-only">
                        Επιλέξτε φίλτρο παραγωγών
                      </label>
                      <select
                        id="producer-filter"
                        name="producer-filter"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                      >
                        <option value="all">Όλοι ({counts.total})</option>
                        <option value="pending">Εκκρεμείς ({counts.pending})</option>
                        <option value="approved">Εγκεκριμένοι ({counts.approved})</option>
                        <option value="rejected">Απορριφθέντες ({counts.rejected})</option>
                      </select>
                    </div>
                    
                    <div className="hidden sm:block">
                      <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                          {[
                            { key: 'all', name: `Όλοι (${counts.total})`, count: counts.total },
                            { key: 'pending', name: `Εκκρεμείς (${counts.pending})`, count: counts.pending },
                            { key: 'approved', name: `Εγκεκριμένοι (${counts.approved})`, count: counts.approved },
                            { key: 'rejected', name: `Απορριφθέντες (${counts.rejected})`, count: counts.rejected }
                          ].map((tab) => (
                            <button
                              key={tab.key}
                              onClick={() => setFilter(tab.key as any)}
                              className={`${
                                filter === tab.key
                                  ? 'border-green-500 text-green-600'
                                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
                            >
                              {tab.name}
                            </button>
                          ))}
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Producers List */}
              <div className="px-4 pb-8 sm:px-0">
                <ProducerList 
                  producers={filteredProducers}
                  loading={loading}
                  onUpdateStatus={handleUpdateStatus}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}