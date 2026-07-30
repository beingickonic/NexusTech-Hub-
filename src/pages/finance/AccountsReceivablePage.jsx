import React, { useState, useEffect } from 'react';
import { CreditCard, Search, RefreshCw, CheckCircle2, AlertCircle, Clock, FileText } from 'lucide-react';
import { financeErpService } from '../../services/finance';
import toast from 'react-hot-toast';

const AccountsReceivablePage = () => {
  const [receivables, setReceivables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal State
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedAr, setSelectedAr] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReceivables();
  }, [statusFilter]);

  const fetchReceivables = async () => {
    setLoading(true);
    const { data, error } = await financeErpService.receivables.getAccountsReceivable(1, { status: statusFilter });
    if (!error && data) {
      setReceivables(data);
    } else {
      toast.error('Failed to load Accounts Receivable');
    }
    setLoading(false);
  };

  const handleOpenPay = (ar) => {
    setSelectedAr(ar);
    setPaymentAmount(Number(ar.amount_due) - Number(ar.amount_paid));
    setShowPayModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    if (paymentAmount <= 0) {
      toast.error('Payment amount must be greater than zero');
      setSubmitting(false);
      return;
    }

    const { error } = await financeErpService.receivables.recordPayment(selectedAr.id, paymentAmount);
    
    if (!error) {
      toast.success('Payment recorded successfully');
      setShowPayModal(false);
      fetchReceivables();
    } else {
      toast.error('Failed to record payment');
    }
    setSubmitting(false);
  };

  const calculateDaysOverdue = (dueDate) => {
    const diff = new Date().getTime() - new Date(dueDate).getTime();
    return Math.max(0, Math.floor(diff / (1000 * 3600 * 24)));
  };

  return (
    <div className="animate-fade-in pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Accounts Receivable</h1>
        <p className="text-slate-500 dark:text-slate-400">Track incoming payments from customer orders.</p>
      </div>

      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search..."
                disabled
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-900 dark:text-white opacity-50 cursor-not-allowed"
              />
            </div>
            <div className="flex items-center gap-3">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
              <button 
                onClick={fetchReceivables}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 transition-colors"
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Order Ref</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Outstanding</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-3">
                      <RefreshCw className="animate-spin" size={24} />
                      Loading receivables...
                    </div>
                  </td>
                </tr>
              ) : receivables.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <CreditCard size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <p>No accounts receivable found.</p>
                  </td>
                </tr>
              ) : (
                receivables.map((ar) => {
                  const outstanding = Number(ar.amount_due) - Number(ar.amount_paid);
                  const isOverdue = ar.payment_status !== 'paid' && new Date(ar.due_date) < new Date();
                  const daysOverdue = isOverdue ? calculateDaysOverdue(ar.due_date) : 0;

                  return (
                    <tr key={ar.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {ar.customer?.first_name} {ar.customer?.last_name}
                        </div>
                        <div className="text-xs text-slate-500">{ar.customer?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-sm text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-md inline-block">
                          {ar.order?.order_number || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {new Date(ar.due_date).toLocaleDateString()}
                        </div>
                        {isOverdue && (
                          <div className="text-xs text-red-500 font-bold flex items-center gap-1 mt-1">
                            <AlertCircle size={12} /> {daysOverdue} days overdue
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {outstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {ar.currency_code}
                        </div>
                        <div className="text-xs text-slate-500">
                          Total: {Number(ar.amount_due).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          ar.payment_status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                          isOverdue ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                          ar.payment_status === 'partial' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}>
                          {isOverdue ? 'overdue' : ar.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {ar.payment_status !== 'paid' && (
                          <button 
                            onClick={() => handleOpenPay(ar)}
                            className="text-xs bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-xl font-medium transition-colors"
                          >
                            Receive Payment
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayModal && selectedAr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Receive Payment</h3>
              <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-slate-500">
                <AlertCircle size={24} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{selectedAr.customer?.first_name} {selectedAr.customer?.last_name}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">Total Due:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{Number(selectedAr.amount_due).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                  <span className="text-slate-900 dark:text-white">Outstanding:</span>
                  <span className="text-blue-600 dark:text-blue-400">{(Number(selectedAr.amount_due) - Number(selectedAr.amount_paid)).toLocaleString()} {selectedAr.currency_code}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">{selectedAr.currency_code}</span>
                  <input 
                    type="number" 
                    required
                    min="0.01"
                    step="0.01"
                    max={Number(selectedAr.amount_due) - Number(selectedAr.amount_paid)}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="w-full pl-14 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white font-mono text-lg"
                  />
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowPayModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2 font-medium"
                >
                  {submitting ? <RefreshCw size={18} className="animate-spin" /> : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsReceivablePage;
