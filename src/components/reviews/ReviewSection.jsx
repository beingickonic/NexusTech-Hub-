import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Edit2, Trash2, Loader2, Send, X } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import {
  getProductReviews,
  getMyReview,
  submitReview,
  updateReview,
  deleteReview,
  canReviewProduct
} from '../../services/reviewService';

const StarRating = ({ rating, onChange, size = 24, readonly = false }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(star => (
      <button
        key={star}
        type="button"
        onClick={() => !readonly && onChange && onChange(star)}
        disabled={readonly}
        className={`transition-transform ${!readonly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
      >
        <Star
          size={size}
          className={star <= rating ? 'text-nexus-gold' : 'text-nexus-textSecondary dark:text-nexus-muted'}
          fill={star <= rating ? 'currentColor' : 'none'}
        />
      </button>
    ))}
  </div>
);

const RatingBar = ({ value, total, label }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-6 text-right text-nexus-textSecondary dark:text-nexus-muted font-medium">{label}</span>
      <Star size={12} className="text-nexus-gold" fill="currentColor" />
      <div className="flex-1 bg-nexus-surface dark:bg-nexus-card rounded-full h-2 overflow-hidden">
        <div className="bg-nexus-gold h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-nexus-textSecondary text-xs">{value}</span>
    </div>
  );
};

const ReviewForm = ({ productId, existingReview, onSuccess, onCancel }) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [body, setBody] = useState(existingReview?.body || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setError('Please select a star rating.'); return; }
    setSubmitting(true);
    setError('');
    const res = existingReview
      ? await updateReview(existingReview.id, { rating, title, body })
      : await submitReview(productId, { rating, title, body });
    setSubmitting(false);
    if (res.success) {
      onSuccess();
    } else {
      setError(res.message || 'Failed to submit review. Please try again.');
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="bg-nexus-surface rounded-2xl border border-nexus-border p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-nexus-heading">
          {existingReview ? 'Edit Your Review' : 'Write a Review'}
        </h3>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-nexus-textSecondary hover:text-nexus-muted transition-colors">
            <X size={18} />
          </button>
        )}
      </div>

      {error && (
        <p className="text-nexus-error text-sm bg-nexus-error/5 dark:bg-nexus-error/20 p-3 rounded-lg">{error}</p>
      )}

      <div>
        <label className="block text-sm font-medium text-nexus-text mb-2">Your Rating *</label>
        <StarRating rating={rating} onChange={setRating} />
      </div>

      <div>
        <label className="block text-sm font-medium text-nexus-text mb-1">Review Title</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={255}
          placeholder="Summarise your experience"
          className="w-full bg-nexus-card border border-nexus-border rounded-xl px-4 py-2.5 text-nexus-heading text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-nexus-text mb-1">Your Review</label>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={4}
          placeholder="Share your experience with this product..."
          className="w-full bg-nexus-card border border-nexus-border rounded-xl px-4 py-2.5 text-nexus-heading text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 bg-primary hover:bg-nexus-primary-hover text-white font-bold px-5 py-2.5 rounded-xl transition-all disabled:opacity-70 text-sm"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {existingReview ? 'Update Review' : 'Submit Review'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-nexus-border text-nexus-muted hover:bg-nexus-surface dark:hover:bg-nexus-hover font-medium text-sm transition-colors">
            Cancel
          </button>
        )}
      </div>
    </motion.form>
  );
};

const ReviewSection = ({ productId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [purchased, setPurchased] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const [reviewsRes, myReviewRes, purchasedRes] = await Promise.all([
      getProductReviews(productId),
      user ? getMyReview(productId) : Promise.resolve({ data: null }),
      user ? canReviewProduct(user.id, productId) : Promise.resolve(false),
    ]);
    setReviews(reviewsRes.data || []);
    setMyReview(myReviewRes.data || null);
    setPurchased(purchasedRes);
    setLoading(false);
  }, [productId, user]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleSuccess = async () => {
    setShowForm(false);
    setEditMode(false);
    await fetchReviews();
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    setDeletingId(reviewId);
    await deleteReview(reviewId);
    setDeletingId(null);
    await fetchReviews();
  };

  // Stats
  const total = reviews.length;
  const avg = total > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / total) : 0;
  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="flex flex-col sm:flex-row gap-8 p-6 bg-nexus-card rounded-2xl border border-nexus-border shadow-sm">
        <div className="text-center sm:border-r border-nexus-border sm:pr-8 sm:min-w-[140px]">
          <div className="text-5xl font-bold text-nexus-heading mb-1">
            {total > 0 ? avg.toFixed(1) : '—'}
          </div>
          <StarRating rating={Math.round(avg)} readonly size={18} />
          <p className="text-sm text-nexus-textSecondary dark:text-nexus-muted mt-2">{total} review{total !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex-1 space-y-2 justify-center flex flex-col">
          {distribution.map(({ star, count }) => (
            <RatingBar key={star} label={star} value={count} total={total} />
          ))}
        </div>
      </div>

      {/* Write / Edit your review */}
      {user && !showForm && !editMode && (
        <div>
          {myReview ? (
            <div className="flex items-center gap-3 p-4 bg-nexus-success/5 dark:bg-nexus-success/20 rounded-2xl border border-nexus-success/20 dark:border-nexus-success/30">
              <p className="text-sm text-nexus-success font-medium flex-1">
                ✓ You reviewed this product with {myReview.rating} stars.
              </p>
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-1.5 text-xs text-nexus-muted hover:text-primary transition-colors"
              >
                <Edit2 size={13} /> Edit
              </button>
              <button
                onClick={() => handleDelete(myReview.id)}
                disabled={deletingId === myReview.id}
                className="flex items-center gap-1.5 text-xs text-nexus-error hover:text-nexus-error transition-colors disabled:opacity-50"
              >
                {deletingId === myReview.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                Delete
              </button>
            </div>
          ) : user && !purchased ? (
            <p className="text-sm text-nexus-textSecondary dark:text-nexus-muted italic">
              Reviews are reserved for verified buyers. You can review this product once you've paid for an order containing it.
            </p>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="w-full sm:w-auto flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary font-semibold px-6 py-3 rounded-xl transition-all text-sm border border-primary/20"
            >
              <Star size={16} fill="currentColor" />
              Write a Review
            </button>
          )}
        </div>
      )}

      {!user && (
        <p className="text-sm text-nexus-textSecondary dark:text-nexus-muted italic">
          <a href="/login" className="text-primary hover:underline font-medium">Log in</a> to write a review.
        </p>
      )}

      <AnimatePresence>
        {(showForm && !myReview) && (
          <ReviewForm
            key="new"
            productId={productId}
            onSuccess={handleSuccess}
            onCancel={() => setShowForm(false)}
          />
        )}
        {editMode && myReview && (
          <ReviewForm
            key="edit"
            productId={productId}
            existingReview={myReview}
            onSuccess={handleSuccess}
            onCancel={() => setEditMode(false)}
          />
        )}
      </AnimatePresence>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <Star size={48} className="text-nexus-textSecondary dark:text-nexus-muted mx-auto mb-4" />
          <p className="text-nexus-textSecondary dark:text-nexus-muted font-medium">No reviews yet.</p>
          <p className="text-sm text-nexus-textSecondary dark:text-nexus-muted mt-1">Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => {
            const name = review.profiles?.full_name || 'Verified Buyer';
            const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            const date = new Date(review.created_at).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });

            return (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-nexus-card rounded-2xl border border-nexus-border shadow-sm"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {initials}
                    </div>
                    <div>
                      <p className="font-semibold text-nexus-heading text-sm">{name}</p>
                      <p className="text-xs text-nexus-textSecondary">{date}</p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} readonly size={14} />
                </div>
                {review.title && (
                  <h4 className="font-semibold text-nexus-heading mb-1 text-sm">{review.title}</h4>
                )}
                {review.body && (
                  <p className="text-nexus-muted text-sm leading-relaxed">{review.body}</p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
