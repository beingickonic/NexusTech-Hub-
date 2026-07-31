import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCircle, XCircle, Trash2, Loader2, MessageSquare, AlertCircle } from 'lucide-react';
import { getAllReviews, setReviewApproval, deleteReview } from '../../services/reviewService';

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(null); // id of review being processed

  const fetchReviews = async () => {
    setIsLoading(true);
    const res = await getAllReviews({ page: 1, limit: 100 });
    if (res.success) {
      setReviews(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleApproval = async (id, currentStatus) => {
    setIsProcessing(id);
    const res = await setReviewApproval(id, !currentStatus);
    if (res.success) {
      setReviews(prev => prev.map(r => r.id === id ? { ...r, approved: !currentStatus } : r));
    } else {
      alert('Failed to update review status.');
    }
    setIsProcessing(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this review?')) return;
    setIsProcessing(id);
    const res = await deleteReview(id);
    if (res.success) {
      setReviews(prev => prev.filter(r => r.id !== id));
    } else {
      alert('Failed to delete review.');
    }
    setIsProcessing(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-nexus-heading mb-2">Product Reviews</h1>
        <p className="text-nexus-muted">Manage and moderate customer reviews across all products.</p>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-16 bg-nexus-card rounded-3xl border border-nexus-border shadow-sm">
          <MessageSquare size={48} className="text-nexus-textSecondary dark:text-nexus-muted mx-auto mb-4" />
          <h2 className="text-xl font-bold text-nexus-heading mb-2">No Reviews Yet</h2>
          <p className="text-nexus-muted">Customers haven't submitted any reviews.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, idx) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`bg-nexus-card rounded-2xl border ${review.approved ? 'border-nexus-border' : 'border-nexus-gold/30'} shadow-sm p-6 relative overflow-hidden`}
            >
              {!review.approved && (
                <div className="absolute top-0 right-0 bg-nexus-gold/10 dark:bg-nexus-gold/30 text-nexus-gold text-xs font-bold px-3 py-1 rounded-bl-xl border-l border-b border-nexus-gold/20 dark:border-nexus-gold/30 flex items-center gap-1">
                  <AlertCircle size={12} /> Hidden
                </div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-nexus-heading text-sm truncate w-48" title={review.products?.title}>
                    {review.products?.title || 'Unknown Product'}
                  </h3>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} size={12} className={star <= review.rating ? 'text-nexus-gold' : 'text-nexus-textSecondary dark:text-nexus-muted'} fill={star <= review.rating ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                {review.title && <h4 className="font-semibold text-nexus-heading text-sm mb-1">{review.title}</h4>}
                <p className="text-nexus-muted text-sm italic line-clamp-3">"{review.body}"</p>
              </div>

              <div className="flex items-center justify-between text-xs text-nexus-muted mb-6 border-t border-nexus-border/50 pt-4">
                <span>By: {review.profiles?.full_name || 'Anonymous'}</span>
                <span>{new Date(review.created_at).toLocaleDateString()}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleApproval(review.id, review.approved)}
                  disabled={isProcessing === review.id}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                    review.approved 
                      ? 'bg-nexus-gold/10 text-nexus-gold hover:bg-nexus-gold/10 dark:bg-nexus-gold/20 dark:text-nexus-gold dark:hover:bg-nexus-gold/30 border border-nexus-gold/20 dark:border-nexus-gold/30'
                      : 'bg-nexus-success/5 text-nexus-success hover:bg-nexus-success/10 dark:bg-nexus-success/20 dark:text-nexus-success dark:hover:bg-nexus-success/40 border border-nexus-success/20 dark:border-nexus-success/30'
                  }`}
                >
                  {isProcessing === review.id ? <Loader2 size={16} className="animate-spin" /> : (review.approved ? <XCircle size={16} /> : <CheckCircle size={16} />)}
                  {review.approved ? 'Hide' : 'Approve'}
                </button>
                <button
                  onClick={() => handleDelete(review.id)}
                  disabled={isProcessing === review.id}
                  className="px-3 py-2 bg-nexus-error/5 text-nexus-error hover:bg-nexus-error/10 dark:bg-nexus-error/20 dark:text-nexus-error dark:hover:bg-nexus-error/40 rounded-lg border border-nexus-error/20 dark:border-nexus-error/30 transition-colors disabled:opacity-50"
                  title="Delete Review"
                >
                  {isProcessing === review.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
