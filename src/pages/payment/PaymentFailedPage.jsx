import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const PaymentFailedPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-32 pb-20 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 text-center"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
            className="w-24 h-24 bg-red-100 dark:bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </motion.div>

          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Payment Failed
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            We were unable to process your payment. You might have cancelled the STK push, or there were insufficient funds.
          </p>

          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 mb-8 text-sm text-slate-600 dark:text-slate-400 text-left">
            <p className="mb-2"><strong>Don't worry!</strong> Your order #{orderId} has been saved as pending.</p>
            <p>You can try paying again from your orders dashboard.</p>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => navigate(`/orders/${orderId}`)}
              className="w-full py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30"
            >
              Try Payment Again
            </button>
            <Link 
              to="/products"
              className="w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
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
