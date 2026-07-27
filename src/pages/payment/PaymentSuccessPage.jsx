import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import paymentService from '../../services/paymentService';

const PaymentSuccessPage = () => {
  const { paymentId } = useParams();
  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    const generateReceipt = async () => {
      try {
        const res = await paymentService.createReceipt(paymentId);
        if (res.success) {
          setReceipt(res.data.receipt);
        }
      } catch (error) {
        console.error("Failed to generate receipt", error);
      } finally {
        setLoading(false);
      }
    };
    generateReceipt();
  }, [paymentId]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-32 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 dark:border-slate-700 text-center"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
            className="w-24 h-24 bg-green-100 dark:bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
            </svg>
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Payment Successful!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg">
            Thank you for your purchase. Your order has been placed and payment confirmed.
          </p>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-4"></div>
              <p className="text-slate-500 dark:text-slate-400">Generating digital receipt...</p>
            </div>
          ) : receipt ? (
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 mb-8 text-left border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Receipt Number</span>
                <span className="font-semibold text-slate-900 dark:text-white">{receipt.receipt_number}</span>
              </div>
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Amount Paid</span>
                <span className="font-semibold text-slate-900 dark:text-white">Ksh {parseFloat(receipt.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Payment Method</span>
                <span className="font-semibold text-slate-900 dark:text-white uppercase">{receipt.payment_method}</span>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {receipt && (
              <Link 
                to={`/payment/receipt/${receipt.id}`}
                className="px-8 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-white transition-colors"
              >
                View Full Receipt
              </Link>
            )}
            <Link 
              to="/products"
              className="px-8 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30"
            >
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
