'use client';

import { useEffect, useState } from 'react';

interface Business {
  id: number;
  company_name: string;
  business_type: string;
  status: string;
  tax_id?: string;
  phone?: string;
  rejection_reason?: string;
  created_at: string;
  user?: { id: number; name: string; email: string };
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Αναμονή',
  active: 'Ενεργή',
  rejected: 'Απορρίφθηκε',
  inactive: 'Ανενεργή',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  inactive: 'bg-neutral-100 text-neutral-600',
};

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/businesses?status=${filter}`);
      const json = await res.json();
      setBusinesses(json.items || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [filter]);

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    try {
      await fetch(`/api/admin/businesses/${id}/approve`, { method: 'POST' });
      await fetchData();
    } catch { /* ignore */ }
    setActionLoading(null);
  };

  const handleReject = async (id: number) => {
    const reason = prompt('Λόγος απόρριψης:');
    if (!reason) return;
    setActionLoading(id);
    try {
      await fetch(`/api/admin/businesses/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      await fetchData();
    } catch { /* ignore */ }
    setActionLoading(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-neutral-800">Επιχειρήσεις B2B</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="text-sm border border-neutral-300 rounded-lg px-3 py-1.5"
        >
          <option value="all">Όλες</option>
          <option value="pending">Αναμονή</option>
          <option value="active">Ενεργές</option>
          <option value="rejected">Απορριφθείσες</option>
        </select>
      </div>

      {loading ? (
        <p className="text-neutral-500">Φόρτωση...</p>
      ) : businesses.length === 0 ? (
        <p className="text-neutral-400 text-center py-12">Δεν βρέθηκαν επιχειρήσεις</p>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100">
          {businesses.map((b) => (
            <div key={b.id} className="p-4 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-neutral-800 truncate">{b.company_name}</p>
                <p className="text-xs text-neutral-500">
                  {b.user?.name} &middot; {b.user?.email} &middot; {b.business_type}
                </p>
                {b.rejection_reason && (
                  <p className="text-xs text-red-500 mt-1">Λόγος: {b.rejection_reason}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[b.status] || ''}`}>
                  {STATUS_LABELS[b.status] || b.status}
                </span>
                {b.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(b.id)}
                      disabled={actionLoading === b.id}
                      className="px-3 py-1 text-xs font-medium rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      Έγκριση
                    </button>
                    <button
                      onClick={() => handleReject(b.id)}
                      disabled={actionLoading === b.id}
                      className="px-3 py-1 text-xs font-medium rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                    >
                      Απόρριψη
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
