import React, { useState, useEffect } from 'react';
import { Wallet, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { financeErpService } from '../../services/finance';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/AuthContext';

const AccountsPayablePage = () => {
  const { user } = useAuth();
  const [payables, setPayables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal State
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedAp, setSelectedAp] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPayables();
  }, [statusFilter]);

  const fetchPayables = async () => {
    setLoading(true);
    const { data, error } = await financeErpService.payables.getAccountsPayable(1, { status: statusFilter });
    if (!error && data) {
      setPayables(data);
    } else {
      toast.error('Failed to load Accounts Payable');
    }
    setLoading(false);
  };

  const handleOpenPay = (ap) => {
    setSelectedAp(ap);
    setPaymentAmount(Number(ap.amount_due) - Number(ap.amount_paid));
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

    const { error } = await financeErpService.payables.recordPayment(selectedAp.id, paymentAmount);
    
    if (!error) {
      toast.success('Payment recorded successfully');
      setShowPayModal(false);
      fetchPayables();
    } else {
      toast.error('Failed to record payment');
    }
    setSubmitting(false);
  };

  const handleApprove = async (id) => {
    const loadingToast = toast.loading('Approving payable...');
    const { error } = await financeErpService.payables.approvePayable(id, user.id);
    if (!error) {
      toast.success('Payable approved', { id: loadingToast });
      fetchPayables();
    } else {
      toast.error('Failed to approve', { id: loadingToast });
    }
  };

  const calculateDaysOverdue = (dueDate) => {
    const diff = new Date().getTime() - new Date(dueDate).getTime();
    return Math.max(0, Math.floor(diff / (1000 * 3600 * 24)));
  };

  return (
    <div className="animate-fade-in pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Accounts Payable</h1>
        <p className="text-slate-500 dark:text-slate-400">Track and manage outstanding supplier bills.</p>
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
              </select>
              <button 
                onClick={fetchPayables}
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
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Reference</th>
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
                      Loading payables...
                    </div>
                  </td>
                </tr>
              ) : payables.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <Wallet size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <p>No accounts payable found.</p>
                  </td>
                </tr>
              ) : (
                payables.map((ap) => {
                  const outstanding = Number(ap.amount_due) - Number(ap.amount_paid);
                  const isOverdue = ap.payment_status !== 'paid' && new Date(ap.due_date) < new Date();
                  const daysOverdue = isOverdue ? calculateDaysOverdue(ap.due_date) : 0;

                  return (
                    <tr key={ap.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {ap.supplier?.name}
                        </div>
                        <div className="text-xs text-slate-500">{ap.supplier?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-sm text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-md inline-block">
                          {ap.purchase_reference || 'N/A'}
                        </div>
                        {ap.approval_status === 'pending' && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-yellow-100 text-yellow-800">
                            Needs Approval
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {new Date(ap.due_date).toLocaleDateString()}
                        </div>
                        {isOverdue && (
                          <div className="text-xs text-red-500 font-bold flex items-center gap-1 mt-1">
                            <AlertCircle size={12} /> {daysOverdue} days overdue
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {outstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {ap.currency_code}
                        </div>
                        <div className="text-xs text-slate-500">
                          Total: {Number(ap.amount_due).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          ap.payment_status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                          isOverdue ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                          ap.payment_status === 'partial' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}>
                          {isOverdue ? 'overdue' : ap.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex flex-col gap-2 items-end">
                        {ap.approval_status === 'pending' && (
                          <button 
                            onClick={() => handleApprove(ap.id)}
                            className="text-xs bg-yellow-100 text-yellow-700 hover:bg-yellow-200 px-4 py-1.5 rounded-lg font-medium transition-colors w-full max-w-[120px]"
                          >
                            Approve
                          </button>
                        )}
                        {ap.approval_status === 'approved' && ap.payment_status !== 'paid' && (
                          <button 
                            onClick={() => handleOpenPay(ap)}
                            className="text-xs bg-blue-600 text-white hover:bg-blue-700 px-4 py-1.5 rounded-lg font-medium transition-colors w-full max-w-[120px]"
                          >
                            Pay Supplier
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
      {showPayModal && selectedAp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pay Supplier</h3>
              <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-slate-500">
                <AlertCircle size={24} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">Supplier:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{selectedAp.supplier?.name}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                  <span className="text-slate-900 dark:text-white">Outstanding:</span>
                  <span className="text-blue-600 dark:text-blue-400">{(Number(selectedAp.amount_due) - Number(selectedAp.amount_paid)).toLocaleString()} {selectedAp.currency_code}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">{selectedAp.currency_code}</span>
                  <input 
                    type="number" 
                    required
                    min="0.01"
                    step="0.01"
                    max={Number(selectedAp.amount_due) - Number(selectedAp.amount_paid)}
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

export default AccountsPayablePage;
