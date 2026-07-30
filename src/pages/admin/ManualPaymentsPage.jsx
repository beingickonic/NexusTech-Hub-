import { useState, useEffect, useMemo } from 'react';
import { Check as FiCheck, X as FiX, Search as FiSearch, Filter as FiFilter } from 'lucide-react';
import paymentService from '../../services/paymentService';

const ManualPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    // Since getPendingManualPayments only returns pending, we'll fetch all manual payments for better admin view
    // Or just create a new service method to fetch all manual mpesa payments. 
    // Wait, let's just fetch all 'mpesa_manual' payments manually here.
    const { supabase } = await import('../../services/supabaseClient');
    const { data, error } = await supabase
      .from('payments')
      .select('*, orders(total_amount, status), profiles:user_id(full_name, phone)')
      .eq('provider', 'mpesa_manual')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setPayments(data);
    }
    setLoading(false);
  };

  const handleVerify = async (paymentId, orderId, isApproved) => {
    if (!window.confirm(`Are you sure you want to ${isApproved ? 'APPROVE' : 'REJECT'} this payment?`)) return;
    
    setProcessingId(paymentId);
    const res = await paymentService.verifyManualPayment(paymentId, orderId, isApproved);
    if (res.success) {
      await fetchPayments();
    } else {
      alert("Failed to update payment: " + res.message);
    }
    setProcessingId(null);
  };

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchesSearch = (p.transaction_reference || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (p.profiles?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || p.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [payments, searchTerm, filterStatus]);

  if (loading) {
    return <div className="p-8 text-center"><span className="animate-spin inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></span></div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manual Payment Verification</h1>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <div className="relative w-full md:w-96">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by Txn Code or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <FiFilter className="text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="pending">Pending</option>
              <option value="paid">Approved (Paid)</option>
              <option value="rejected">Rejected</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Order / Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Transaction Code</th>
                <th className="px-6 py-4">Amount (KES)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredPayments.map(payment => (
                <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">ORD-{payment.order_id}</div>
                    <div className="text-xs text-slate-500 mt-1">{new Date(payment.created_at).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">{payment.profiles?.full_name || 'Unknown'}</div>
                    <div className="text-xs text-slate-500 mt-1">{payment.profiles?.phone || 'No Phone'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded font-mono text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
                      {payment.transaction_reference || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                    {payment.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    {payment.status === 'pending' && <span className="px-2.5 py-1 bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 rounded-full text-xs font-semibold">Pending</span>}
                    {payment.status === 'paid' && <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-full text-xs font-semibold">Approved</span>}
                    {payment.status === 'rejected' && <span className="px-2.5 py-1 bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 rounded-full text-xs font-semibold">Rejected</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {payment.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleVerify(payment.id, payment.order_id, true)}
                          disabled={processingId === payment.id}
                          className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/40 dark:text-emerald-400 rounded-lg transition-colors disabled:opacity-50"
                          title="Approve"
                        >
                          <FiCheck size={18} />
                        </button>
                        <button 
                          onClick={() => handleVerify(payment.id, payment.order_id, false)}
                          disabled={processingId === payment.id}
                          className="p-2 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-500/20 dark:hover:bg-red-500/40 dark:text-red-400 rounded-lg transition-colors disabled:opacity-50"
                          title="Reject"
                        >
                          <FiX size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                    No manual payments found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManualPaymentsPage;
