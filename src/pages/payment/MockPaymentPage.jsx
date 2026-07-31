import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import orderService from '../../services/orderService';
import paymentService from '../../services/paymentService';
import {
  Zap, ShieldCheck, CheckCircle2, XCircle, ArrowLeft,
  FileText, Loader2, Lock, RefreshCw, Sparkles
} from 'lucide-react';

const ACCEPTED_CODES = ['123456', '111111', '999999', 'NEXUS123', 'TESTPAY'];

const PAID_STATUSES = [
  'Pending Finance Approval', 'Finance Approved', 'Stock Reserved', 'Reserved',
  'Ready for Picking', 'Picking', 'Packing', 'Ready for Dispatch',
  'Assigned', 'Out for Delivery', 'Delivered', 'Completed', 'Customer Confirmed'
];

const MockPaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      const res = await orderService.getOrderDetails(orderId);
      if (res.success) {
        setOrder(res.data.order);
        if (PAID_STATUSES.includes(res.data.order.status)) {
          navigate(`/payment/invoice/${orderId}`, { replace: true });
          return;
        }
      } else {
        setErrorMsg(res.message || 'Could not load order');
      }
      setLoading(false);
    };
    load();
  }, [orderId, navigate]);

  const handlePay = async () => {
    if (!code.trim()) {
      setErrorMsg('Please enter a verification code.');
      return;
    }
    setErrorMsg('');
    setVerifying(true);
    const res = await paymentService.verifyMockPayment(orderId, code.trim());
    if (res.success) {
      setResult({ type: 'success', data: res.data });
    } else if ((res.message || '').includes('ORDER_ALREADY_PROCESSED')) {
      navigate(`/payment/invoice/${orderId}`, { replace: true });
    } else if ((res.message || '').includes('INVALID_VERIFICATION_CODE')) {
      setResult({ type: 'failed' });
    } else {
      setErrorMsg(res.message || 'Payment verification failed. Please try again.');
    }
    setVerifying(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex justify-center bg-nexus-surface">
        <Loader2 className="w-8 h-8 text-nexus-primary animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center bg-nexus-surface">
        <p className="text-nexus-textSecondary">{errorMsg || 'Order not found.'}</p>
        <Link to="/orders" className="text-nexus-primary mt-4 hover:underline">Return to Orders</Link>
      </div>
    );
  }

  const total = Number(order.total_amount || 0);

  return (
    <div className="min-h-screen pt-32 pb-20 bg-nexus-surface transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-xl">
        <AnimatePresence mode="wait">
          {result?.type === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-nexus-card rounded-3xl border border-nexus-border shadow-sm overflow-hidden"
            >
              <div className="bg-gradient-to-br from-nexus-primary via-nexus-primary to-nexus-gold px-8 py-12 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-nexus-gold rounded-full blur-3xl opacity-30 -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-nexus-dark-navy rounded-full blur-3xl opacity-40 -ml-20 -mb-20"></div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.15 }}
                  className="relative z-10 inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/15 backdrop-blur-md border border-white/25 mb-5"
                >
                  <CheckCircle2 size={44} className="text-white" />
                </motion.div>
                <h1 className="relative z-10 text-3xl font-bold text-white mb-2">Payment Successful</h1>
                <p className="relative z-10 text-white/80">Awaiting finance approval</p>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-nexus-surface rounded-2xl p-4 border border-nexus-border">
                    <p className="text-xs font-medium text-nexus-muted uppercase tracking-wider mb-1">Transaction ID</p>
                    <p className="font-mono font-bold text-nexus-heading break-all">{result.data.transaction_id}</p>
                  </div>
                  <div className="bg-nexus-surface rounded-2xl p-4 border border-nexus-border">
                    <p className="text-xs font-medium text-nexus-muted uppercase tracking-wider mb-1">Receipt No</p>
                    <p className="font-mono font-bold text-nexus-heading">{result.data.receipt_number}</p>
                  </div>
                  <div className="bg-nexus-surface rounded-2xl p-4 border border-nexus-border">
                    <p className="text-xs font-medium text-nexus-muted uppercase tracking-wider mb-1">Invoice No</p>
                    <p className="font-mono font-bold text-nexus-heading">{result.data.invoice_number}</p>
                  </div>
                  <div className="bg-nexus-surface rounded-2xl p-4 border border-nexus-border">
                    <p className="text-xs font-medium text-nexus-muted uppercase tracking-wider mb-1">Amount Paid</p>
                    <p className="font-bold text-nexus-primary">KES {Number(result.data.amount).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-2xl border border-nexus-gold/30 bg-nexus-gold/10 mb-6">
                  <ShieldCheck size={18} className="text-nexus-gold shrink-0 mt-0.5" />
                  <p className="text-sm text-nexus-textSecondary">
                    Your payment is now <strong className="text-nexus-heading">pending finance approval</strong>.
                    An invoice has been generated and the finance team has been notified. Stock will be reserved once approved.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate(`/payment/invoice/${orderId}`)}
                    className="flex-1 flex items-center justify-center gap-2 bg-nexus-primary hover:bg-nexus-primary-hover text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-primary/30"
                  >
                    <FileText size={18} /> View Invoice
                  </button>
                  <Link
                    to="/orders"
                    className="flex-1 flex items-center justify-center gap-2 bg-nexus-surface dark:bg-nexus-card text-nexus-heading border border-nexus-border font-semibold py-3.5 px-6 rounded-xl hover:bg-nexus-muted dark:hover:bg-nexus-hover transition-colors"
                  >
                    <ArrowLeft size={18} /> Back to Orders
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : result?.type === 'failed' ? (
            <motion.div
              key="failed"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="bg-nexus-card rounded-3xl border border-nexus-error/40 shadow-sm overflow-hidden"
            >
              <div className="bg-nexus-error/10 px-8 py-10 text-center border-b border-nexus-error/20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-nexus-error text-white mb-4">
                  <XCircle size={32} />
                </div>
                <h1 className="text-2xl font-bold text-nexus-heading mb-1">Payment Failed</h1>
                <p className="text-nexus-textSecondary">
                  The verification code <strong className="font-mono">{code.toUpperCase()}</strong> is invalid.
                </p>
              </div>
              <div className="p-8">
                <div className="flex items-start gap-3 p-4 rounded-2xl border border-nexus-border bg-nexus-surface mb-6">
                  <Sparkles size={18} className="text-nexus-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-nexus-textSecondary">
                    Use one of the demo codes: <span className="font-mono">{ACCEPTED_CODES.join(' · ')}</span>.
                    Your order remains unpaid — you can retry below.
                  </p>
                </div>
                <button
                  onClick={() => setResult(null)}
                  className="w-full flex items-center justify-center gap-2 bg-nexus-primary hover:bg-nexus-primary-hover text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-primary/30"
                >
                  <RefreshCw size={18} /> Try Again
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="pay"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-nexus-card rounded-3xl border border-nexus-border shadow-sm overflow-hidden"
            >
              <div className="px-8 py-7 border-b border-nexus-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-nexus-primary/10 text-nexus-primary">
                    <Zap size={22} />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-nexus-heading">Mock Mobile Money</h1>
                    <p className="text-xs text-nexus-muted">NexusTech Hub · Demo Payment</p>
                  </div>
                </div>
                <Link to="/orders" className="text-sm text-nexus-textSecondary hover:text-nexus-primary transition-colors flex items-center gap-1">
                  <ArrowLeft size={15} /> Orders
                </Link>
              </div>

              <div className="p-8">
                <div className="text-center mb-8">
                  <p className="text-sm text-nexus-muted uppercase tracking-wider mb-1">Amount Due</p>
                  <p className="text-4xl font-bold text-nexus-dark-navy dark:text-white">KES {total.toLocaleString()}</p>
                  <p className="text-xs text-nexus-textSecondary mt-2">Order #{order.id}</p>
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="mb-8">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex justify-between py-2 border-b border-nexus-border/60 text-sm">
                        <span className="text-nexus-heading font-medium">
                          {item.product_name} <span className="text-nexus-muted">× {item.quantity}</span>
                        </span>
                        <span className="text-nexus-textSecondary">KES {Number(item.line_total).toLocaleString()}</span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-xs text-nexus-muted mt-2">+{order.items.length - 3} more item(s)</p>
                    )}
                  </div>
                )}

                <label className="block text-sm font-semibold text-nexus-heading mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => { setCode(e.target.value.toUpperCase()); setErrorMsg(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handlePay()}
                  placeholder="Enter verification code"
                  autoFocus
                  className={`w-full bg-nexus-surface border ${errorMsg ? 'border-nexus-error' : 'border-nexus-border'} rounded-xl px-4 py-3.5 text-lg font-mono tracking-widest text-nexus-heading text-center uppercase outline-none focus:ring-2 focus:ring-nexus-primary transition-shadow`}
                />
                {errorMsg && <p className="mt-2 text-sm text-nexus-error">{errorMsg}</p>}

                <div className="mt-4 mb-7">
                  <p className="text-xs text-nexus-muted mb-2">Demo codes:</p>
                  <div className="flex flex-wrap gap-2">
                    {ACCEPTED_CODES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCode(c)}
                        className={`font-mono text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                          code === c
                            ? 'border-nexus-primary bg-nexus-primary text-white'
                            : 'border-nexus-border bg-nexus-surface text-nexus-textSecondary hover:border-nexus-primary/40 hover:text-nexus-primary'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handlePay}
                  disabled={verifying || !code.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-nexus-dark-navy dark:bg-nexus-heading hover:opacity-90 text-white dark:text-nexus-navy font-bold py-4 px-6 rounded-xl transition-all shadow-lg disabled:opacity-60"
                >
                  {verifying ? (
                    <><Loader2 size={18} className="animate-spin" /> Verifying...</>
                  ) : (
                    <><Lock size={18} /> Pay KES {total.toLocaleString()}</>
                  )}
                </button>

                <p className="mt-5 text-center text-xs text-nexus-muted flex items-center justify-center gap-1">
                  <ShieldCheck size={13} className="text-nexus-success" />
                  This is a secure demo payment — no real money is moved.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MockPaymentPage;
