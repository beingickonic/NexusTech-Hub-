import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const PaymentFailedPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-nexus-surface pt-32 pb-20 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-nexus-card rounded-3xl p-8 shadow-sm border border-nexus-border text-center"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
            className="w-24 h-24 bg-nexus-error/10 dark:bg-nexus-error/20 text-nexus-error rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </motion.div>

          <h1 className="text-3xl font-bold text-nexus-heading mb-4">
            Payment Failed
          </h1>
          <p className="text-nexus-muted mb-8 leading-relaxed">
            We were unable to process your payment. You might have cancelled the STK push, or there were insufficient funds.
          </p>

          <div className="bg-nexus-surface/50 rounded-2xl p-4 mb-8 text-sm text-nexus-muted text-left">
            <p className="mb-2"><strong>Don't worry!</strong> Your order #{orderId} has been saved as pending.</p>
            <p>You can try paying again from your orders dashboard.</p>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => navigate(`/orders/${orderId}`)}
              className="w-full py-3 bg-nexus-primary text-white font-bold rounded-xl hover:bg-nexus-primary-hover transition-colors shadow-lg shadow-primary/30"
            >
              Try Payment Again
            </button>
            <Link 
              to="/products"
              className="w-full py-3 bg-nexus-surface text-nexus-text font-bold rounded-xl hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;
