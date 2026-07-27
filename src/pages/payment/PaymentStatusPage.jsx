import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import paymentService from '../../services/paymentService';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';

const PaymentStatusPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const provider = searchParams.get('provider');
  const error = searchParams.get('error');
  const orderId = searchParams.get('order');
  
  // PayPal params
  const token = searchParams.get('token'); // PayPal Order ID
  
  // Flutterwave params
  const status = searchParams.get('status');
  const tx_ref = searchParams.get('tx_ref');
  const transaction_id = searchParams.get('transaction_id');

  const [paymentState, setPaymentState] = useState('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const processPayment = async () => {
      if (error) {
        setPaymentState('failed');
        setErrorMessage("Payment initiation failed. Please try again.");
        return;
      }

      if (provider === 'paypal' && token) {
        setPaymentState('processing');
        const res = await paymentService.capturePayPalOrder(token);
        if (res.success && res.data.capture.status === 'COMPLETED') {
          setPaymentState('success');
        } else {
          setPaymentState('failed');
          setErrorMessage("PayPal payment capture failed or was cancelled.");
        }
      } else if (provider === 'flutterwave' && status) {
        if (status === 'successful' || status === 'completed') {
          setPaymentState('success');
        } else {
          setPaymentState('failed');
          setErrorMessage("Flutterwave payment failed or was cancelled.");
        }
      } else if (provider === 'mpesa') {
        // M-Pesa is async STK push. We just show pending.
        setPaymentState('pending_mpesa');
      } else {
        setPaymentState('failed');
        setErrorMessage("Invalid payment return parameters.");
      }
    };

    processPayment();
  }, [provider, error, token, status, tx_ref, transaction_id]);

  return (
    <div className="min-h-screen pt-32 pb-20 bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-12 max-w-lg w-full text-center shadow-xl border border-slate-200 dark:border-slate-700">
        
        {paymentState === 'processing' && (
          <div className="flex flex-col items-center">
            <Loader2 size={64} className="text-orange-500 animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Processing Payment...</h2>
            <p className="text-slate-500 dark:text-slate-400">Please wait while we verify your transaction.</p>
          </div>
        )}

        {paymentState === 'success' && (
          <div className="flex flex-col items-center animate-fade-in">
            <CheckCircle size={80} className="text-green-500 mb-6" />
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Payment Successful!</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              Thank you for your purchase. Your order is now being processed.
            </p>
            <div className="flex gap-4 w-full">
              <Link to="/orders" className="flex-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-semibold py-3 px-6 rounded-xl transition-colors">
                View Orders
              </Link>
              <Link to="/products" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2">
                Continue Shopping <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        )}

        {paymentState === 'pending_mpesa' && (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="relative mb-6">
              <Loader2 size={80} className="text-orange-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-orange-500">M-PESA</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Awaiting M-Pesa PIN</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              Please check your phone and enter your M-Pesa PIN to complete the transaction.
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mb-8">
              Once you've paid, your order status will update automatically.
            </p>
            <Link to="/orders" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-orange-500/30">
              Go to Orders
            </Link>
          </div>
        )}

        {paymentState === 'failed' && (
          <div className="flex flex-col items-center animate-fade-in">
            <XCircle size={80} className="text-red-500 mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Payment Failed</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              {errorMessage || "We couldn't process your payment. No charges were made."}
            </p>
            <div className="flex flex-col gap-3 w-full">
              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-orange-500/30"
              >
                Try Again
              </button>
              <Link to="/support" className="text-sm text-slate-500 hover:text-orange-500 transition-colors mt-2">
                Contact Support
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PaymentStatusPage;
