'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  name: string;
  approval_status: string;
  created_at: string;
  producer: {
    id: number;
    name: string;
  };
}

interface ModerationPageData {
  data: Product[];
  total: number;
  current_page: number;
  per_page: number;
}

export default function ModerationQueuePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingProductId, setRejectingProductId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  const fetchPendingProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';
      const response = await fetch(`${baseUrl}/admin/products/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.status === 401) {
        router.push('/auth/login');
        return;
      }

      if (response.status === 403) {
        setError('Δεν έχετε δικαίωμα πρόσβασης σε αυτή τη σελίδα');
        return;
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: ModerationPageData = await response.json();
      setProducts(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Σφάλμα φόρτωσης');
    } finally {
      setLoading(false);
    }
  };

  const moderateProduct = async (productId: number, action: 'approve' | 'reject', reason?: string) => {
    setActionLoading(productId);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';
      const response = await fetch(`${baseUrl}/admin/products/${productId}/moderate`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, reason }),
      });

      if (response.status === 401) {
        router.push('/auth/login');
        return;
      }

      if (response.status === 403) {
        alert('Δεν έχετε δικαίωμα για αυτή την ενέργεια');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Σφάλμα moderation');
      }

      const result = await response.json();
      alert(result.message || `Προϊόν ${action === 'approve' ? 'εγκρίθηκε' : 'απορρίφθηκε'} επιτυχώς`);

      // Remove product from pending list
      setProducts(products.filter(p => p.id !== productId));
      setRejectingProductId(null);
      setRejectReason('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Σφάλμα');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = (productId: number) => {
    if (confirm('Είστε σίγουροι ότι θέλετε να εγκρίνετε αυτό το προϊόν;')) {
      moderateProduct(productId, 'approve');
    }
  };

  const handleReject = (productId: number) => {
    setRejectingProductId(productId);
  };

  const submitReject = () => {
    if (!rejectingProductId) return;

    if (rejectReason.length < 10) {
      alert('Η αιτιολογία πρέπει να έχει τουλάχιστον 10 χαρακτήρες');
      return;
    }

    moderateProduct(rejectingProductId, 'reject', rejectReason);
  };

  if (loading) {
    return (
      <main style={{ padding: 16 }}>
        <h1>Ουρά Έγκρισης Προϊόντων</h1>
        <p>Φόρτωση...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ padding: 16 }}>
        <h1>Ουρά Έγκρισης Προϊόντων</h1>
        <p style={{ color: 'red' }}>{error}</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 16, display: 'grid', gap: 16 }}>
      <h1>Ουρά Έγκρισης Προϊόντων</h1>

      {products.length === 0 ? (
        <p>Δεν υπάρχουν προϊόντα σε αναμονή έγκρισης</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: 8, textAlign: 'left' }}>Προϊόν</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Παραγωγός</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Ημερομηνία</th>
              <th style={{ padding: 8, textAlign: 'center' }}>Ενέργειες</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 8 }}>{product.name}</td>
                <td style={{ padding: 8 }}>{product.producer?.name || '—'}</td>
                <td style={{ padding: 8 }}>
                  {new Date(product.created_at).toLocaleDateString('el-GR')}
                </td>
                <td style={{ padding: 8, textAlign: 'center' }}>
                  {actionLoading === product.id ? (
                    <span>⏳</span>
                  ) : (
                    <>
                      <button
                        onClick={() => handleApprove(product.id)}
                        style={{
                          marginRight: 8,
                          padding: '4px 12px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          cursor: 'pointer',
                        }}
                      >
                        ✓ Έγκριση
                      </button>
                      <button
                        onClick={() => handleReject(product.id)}
                        style={{
                          padding: '4px 12px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          cursor: 'pointer',
                        }}
                      >
                        ✗ Απόρριψη
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Reject modal */}
      {rejectingProductId && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setRejectingProductId(null)}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: 24,
              borderRadius: 8,
              maxWidth: 500,
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Απόρριψη Προϊόντος</h3>
            <p style={{ marginBottom: 16 }}>
              Παρακαλώ εισάγετε την αιτιολογία της απόρριψης (τουλάχιστον 10 χαρακτήρες):
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: 8,
                border: '1px solid #ddd',
                borderRadius: 4,
                marginBottom: 16,
              }}
              placeholder="π.χ. Οι φωτογραφίες δεν πληρούν τις προδιαγραφές ποιότητας..."
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setRejectingProductId(null);
                  setRejectReason('');
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                Ακύρωση
              </button>
              <button
                onClick={submitReject}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                Απόρριψη Προϊόντος
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
