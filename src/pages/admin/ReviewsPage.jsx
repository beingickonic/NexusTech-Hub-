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
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Product Reviews</h1>
        <p className="text-nexus-textSecondary dark:text-nexus-textSecondary">Manage and moderate customer reviews across all products.</p>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-nexus-border shadow-sm">
          <MessageSquare size={48} className="text-nexus-textSecondary dark:text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Reviews Yet</h2>
          <p className="text-nexus-textSecondary dark:text-nexus-textSecondary">Customers haven't submitted any reviews.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, idx) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`bg-white dark:bg-slate-800 rounded-2xl border ${review.approved ? 'border-slate-200 dark:border-nexus-border' : 'border-amber-300 dark:border-amber-500/30'} shadow-sm p-6 relative overflow-hidden`}
            >
              {!review.approved && (
                <div className="absolute top-0 right-0 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold px-3 py-1 rounded-bl-xl border-l border-b border-amber-200 dark:border-amber-800/30 flex items-center gap-1">
                  <AlertCircle size={12} /> Hidden
                </div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate w-48" title={review.products?.title}>
                    {review.products?.title || 'Unknown Product'}
                  </h3>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} size={12} className={star <= review.rating ? 'text-yellow-400' : 'text-nexus-textSecondary dark:text-slate-600'} fill={star <= review.rating ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                {review.title && <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-1">{review.title}</h4>}
                <p className="text-slate-600 dark:text-nexus-textSecondary text-sm italic line-clamp-3">"{review.body}"</p>
              </div>

              <div className="flex items-center justify-between text-xs text-nexus-textSecondary dark:text-nexus-textSecondary mb-6 border-t border-slate-100 dark:border-nexus-border/50 pt-4">
                <span>By: {review.profiles?.full_name || 'Anonymous'}</span>
                <span>{new Date(review.created_at).toLocaleDateString()}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleApproval(review.id, review.approved)}
                  disabled={isProcessing === review.id}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                    review.approved 
                      ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-800/30'
                      : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 border border-green-200 dark:border-green-800/30'
                  }`}
                >
                  {isProcessing === review.id ? <Loader2 size={16} className="animate-spin" /> : (review.approved ? <XCircle size={16} /> : <CheckCircle size={16} />)}
                  {review.approved ? 'Hide' : 'Approve'}
                </button>
                <button
                  onClick={() => handleDelete(review.id)}
                  disabled={isProcessing === review.id}
                  className="px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg border border-red-200 dark:border-red-800/30 transition-colors disabled:opacity-50"
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
