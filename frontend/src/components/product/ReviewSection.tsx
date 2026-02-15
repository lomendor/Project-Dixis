'use client';

import { useState, useEffect } from 'react';
import StarRating from '@/components/StarRating';
import { useAuth } from '@/contexts/AuthContext';

interface Review {
  id: number;
  rating: number;
  title: string | null;
  comment: string | null;
  is_verified_purchase: boolean;
  created_at: string;
  user: { name: string } | null;
}

interface ReviewMeta {
  total: number;
  avg_rating: number | null;
}

/**
 * S1-02: Review section for product detail page
 * Fetches and displays reviews, allows authenticated users to submit
 */
export default function ReviewSection({ productId }: { productId: number }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [meta, setMeta] = useState<ReviewMeta>({ total: 0, avg_rating: null });
  const [loading, setLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  async function fetchReviews() {
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';
      const res = await fetch(`${base}/public/products/${productId}/reviews`);
      if (!res.ok) return;
      const json = await res.json();
      setReviews(json.data || []);
      setMeta(json.meta || { total: 0, avg_rating: null });
    } catch {
      // silently fail — reviews are non-critical
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setError('Please select a rating'); return; }
    setError('');
    setSubmitting(true);

    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${base}/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ rating, title: title || undefined, comment: comment || undefined }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.message || 'Error'); return; }
      setSuccess('Review submitted!');
      setShowForm(false);
      setRating(0); setTitle(''); setComment('');
      fetchReviews(); // Refresh list
    } catch {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  }

  const formatDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString('el-GR'); } catch { return iso; }
  };

  return (
    <section className="mt-10 pt-6 border-t border-neutral-200" data-testid="review-section">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">
            Reviews
          </h2>
          {meta.avg_rating && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={meta.avg_rating} count={meta.total} size="md" />
              <span className="text-sm font-medium text-neutral-700">{meta.avg_rating}</span>
            </div>
          )}
        </div>
        {user && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            data-testid="write-review-btn"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Submit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-4 bg-neutral-50 rounded-lg" data-testid="review-form">
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
          {success && <p className="text-green-600 text-sm mb-3">{success}</p>}

          {/* Star selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-700 mb-1">Rating *</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                  data-testid={`star-${star}`}
                >
                  <svg className={`w-8 h-8 ${star <= rating ? 'text-amber-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional)"
            maxLength={150}
            className="w-full px-3 py-2 mb-3 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
          />

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Your review (optional)"
            rows={3}
            maxLength={2000}
            className="w-full px-3 py-2 mb-3 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
          />

          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-neutral-600 px-4 py-2 rounded-lg text-sm hover:bg-neutral-100">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Review List */}
      {loading ? (
        <div className="text-center py-8 text-neutral-500">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <p className="text-neutral-500 text-sm py-4">
          No reviews yet. {user ? 'Be the first to review!' : 'Login to write a review.'}
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-neutral-100 pb-4" data-testid="review-item">
              <div className="flex items-center gap-2 mb-1">
                <StarRating rating={review.rating} size="xs" showCount={false} />
                {review.is_verified_purchase && (
                  <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                    Verified Purchase
                  </span>
                )}
              </div>
              {review.title && <p className="font-medium text-sm text-neutral-900">{review.title}</p>}
              {review.comment && <p className="text-sm text-neutral-600 mt-1">{review.comment}</p>}
              <p className="text-xs text-neutral-400 mt-2">
                {review.user?.name || 'Anonymous'} &middot; {formatDate(review.created_at)}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
