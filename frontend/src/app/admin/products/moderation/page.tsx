'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/contexts/ToastContext';

/**
 * Pass PR-FIX-02: Moderation queue rewrite.
 *
 * Replaces old page that used localStorage auth, /api/v1 endpoints, alert(),
 * and inline styles with:
 * - Cookie-based auth (auto via AdminShell)
 * - Next.js API routes (/api/admin/products?approval=pending)
 * - useToast() for feedback
 * - Tailwind styling
 */

interface PendingProduct {
  id: string;
  title: string;
  category: string;
  price: number;
  approvalStatus: string;
  producer?: { id: string; name: string };
}

export default function ModerationQueuePage() {
  const { showSuccess, showError } = useToast();
  const [products, setProducts] = useState<PendingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  // Rejection modal state
  const [rejectModal, setRejectModal] = useState<{ id: string; title: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPending = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/products?approval=pending', { cache: 'no-store' });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const json = await res.json();
      setProducts(json.items || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Σφάλμα φόρτωσης');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const handleApprove = async (productId: string) => {
    setProcessingIds(prev => new Set([...prev, productId]));
    try {
      const res = await fetch(`/api/admin/products/${productId}/approve`, { method: 'POST' });
      if (!res.ok) throw new Error((await res.json()).error || 'Αποτυχία');
      showSuccess('Το προϊόν εγκρίθηκε επιτυχώς');
      await fetchPending();
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Σφάλμα έγκρισης');
    } finally {
      setProcessingIds(prev => { const n = new Set(prev); n.delete(productId); return n; });
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectModal || rejectionReason.length < 5) return;
    setSubmitting(true);
    setProcessingIds(prev => new Set([...prev, rejectModal.id]));
    try {
      const res = await fetch(`/api/admin/products/${rejectModal.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Αποτυχία');
      showSuccess('Το προϊόν απορρίφθηκε');
      setRejectModal(null);
      setRejectionReason('');
      await fetchPending();
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Σφάλμα απόρριψης');
    } finally {
      setSubmitting(false);
      if (rejectModal) {
        setProcessingIds(prev => { const n = new Set(prev); n.delete(rejectModal.id); return n; });
      }
    }
  };

  return (
    <div className="space-y-6" data-testid="moderation-page">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Ουρά Έγκρισης</h1>
        <span className="text-sm text-neutral-500">
          {products.length} σε αναμονή
        </span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-neutral-500">Φόρτωση...</div>
      ) : products.length === 0 ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-8 text-center">
          <p className="text-emerald-700 font-medium">Δεν υπάρχουν προϊόντα σε αναμονή</p>
          <p className="text-emerald-600 text-sm mt-1">Όλα τα προϊόντα έχουν ελεγχθεί.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <table className="min-w-full divide-y divide-neutral-200" data-testid="moderation-table">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Προϊόν
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Παραγωγός
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Κατηγορία
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Τιμή
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Ενέργειες
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                    {p.title}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    {p.producer?.name || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    {p.category || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-900 text-right">
                    {new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(Number(p.price))}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {processingIds.has(p.id) ? (
                      <span className="text-neutral-400 text-sm">Επεξεργασία...</span>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => { if (window.confirm(`Έγκριση του "${p.title}";`)) handleApprove(p.id); }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-md font-medium transition-colors"
                          data-testid={`approve-btn-${p.id}`}
                        >
                          Έγκριση
                        </button>
                        <button
                          onClick={() => setRejectModal({ id: p.id, title: p.title })}
                          className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded-md font-medium transition-colors"
                          data-testid={`reject-btn-${p.id}`}
                        >
                          Απόρριψη
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => { setRejectModal(null); setRejectionReason(''); }}
          data-testid="rejection-modal"
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-neutral-900 mb-1" data-testid="rejection-modal-title">
              Απόρριψη Προϊόντος
            </h3>
            <p className="text-sm text-neutral-600 mb-4">
              {rejectModal.title}
            </p>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Λόγος Απόρριψης *
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              placeholder="Εξηγήστε γιατί απορρίπτεται το προϊόν..."
              className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-vertical"
              data-testid="rejection-reason-input"
            />
            {rejectionReason.length > 0 && rejectionReason.length < 5 && (
              <p className="text-red-600 text-xs mt-1">Τουλάχιστον 5 χαρακτήρες</p>
            )}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => { setRejectModal(null); setRejectionReason(''); }}
                disabled={submitting}
                className="px-4 py-2 border border-neutral-300 rounded-md text-sm hover:bg-neutral-50 transition-colors"
                data-testid="rejection-modal-cancel"
              >
                Ακύρωση
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={submitting || rejectionReason.length < 5}
                className="px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="rejection-modal-confirm"
              >
                {submitting ? 'Απόρριψη...' : 'Απόρριψη'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
