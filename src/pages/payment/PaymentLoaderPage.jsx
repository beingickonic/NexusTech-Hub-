import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import paymentService from '../../services/paymentService';

const PaymentLoaderPage = () => {
  const { checkoutRequestId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!checkoutRequestId) return;

    const pollPaymentStatus = async () => {
      try {
        const res = await paymentService.verifyPayment(checkoutRequestId);
        if (res.success && res.data.status) {
          const currentStatus = res.data.status;
          
          if (currentStatus === 'successful') {
            // Wait a brief moment to show success animation, then redirect
            setStatus('successful');
            setTimeout(() => {
              navigate(`/payment/success/${res.data.payment_id}`);
            }, 1500);
            return;
          } else if (currentStatus === 'failed' || currentStatus === 'cancelled') {
            setStatus('failed');
            setTimeout(() => {
              navigate(`/payment/failed/${res.data.order_id}`);
            }, 1500);
            return;
          }
        }
      } catch (error) {
        console.error("Polling error", error);
      }

      // If still processing and under 30 attempts (approx 60s), poll again
      if (attempts < 30) {
        setTimeout(() => {
          setAttempts(prev => prev + 1);
        }, 3000);
      } else {
        setStatus('timeout');
      }
    };

    if (status === 'processing') {
      pollPaymentStatus();
    }
  }, [checkoutRequestId, attempts, navigate, status]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 text-center">
        
        {status === 'processing' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <div className="relative w-24 h-24 mb-6">
              <motion.div 
                className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-700"
              />
              <motion.div 
                className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <img src="/mpesa-logo.png" alt="M-Pesa" className="w-10 h-10 object-contain" onError={(e) => e.target.style.display = 'none'} />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Awaiting Payment</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Please check your phone. An M-Pesa prompt has been sent to your device. Enter your PIN to complete the transaction.
            </p>
            
            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mb-2 overflow-hidden">
              <motion.div 
                className="bg-orange-500 h-full"
                initial={{ width: "0%" }}
                animate={{ width: `${(attempts / 30) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-400">Time remaining: {60 - (attempts * 2)}s</p>
          </motion.div>
        )}

        {status === 'successful' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-green-500"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="w-20 h-20 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mb-6"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </motion.div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Payment Successful!</h2>
            <p className="text-slate-500 dark:text-slate-400">Generating your receipt...</p>
          </motion.div>
        )}

        {(status === 'failed' || status === 'timeout') && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 bg-red-100 dark:bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
            </motion.div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {status === 'timeout' ? 'Payment Timeout' : 'Payment Failed'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              We couldn't confirm your payment. You can try again or check your M-Pesa balance.
            </p>
            <button onClick={() => navigate('/orders')} className="w-full py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold transition-colors">
              Go to My Orders
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PaymentLoaderPage;
