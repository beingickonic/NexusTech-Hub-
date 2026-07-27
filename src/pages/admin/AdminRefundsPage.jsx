import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Search, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

const AdminRefundsPage = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchRefunds = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('refunds')
      .select('*, orders(id, total_amount), payments(transaction_reference, amount), profiles(full_name, email)')
      .order('created_at', { ascending: false });
      
    if (data) setRefunds(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const handleUpdateStatus = async (refundId, status) => {
    const { error } = await supabase
      .from('refunds')
      .update({ status, processed_by: (await supabase.auth.getUser()).data.user?.id })
      .eq('id', refundId);
      
    if (!error) {
      // In a real app, you would also trigger the actual B2C refund via Edge Function here if 'approved'
      fetchRefunds();
    } else {
      alert("Error updating refund status: " + error.message);
    }
  };

  const filteredRefunds = refunds.filter(r => filter === 'all' || r.status === filter);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Refund Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Review and process customer refund requests</p>
        </div>
        <button 
          onClick={fetchRefunds}
          className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Order</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Reason</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">Loading refunds...</td>
                </tr>
              ) : filteredRefunds.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">No refund requests found.</td>
                </tr>
              ) : (
                filteredRefunds.map((refund) => (
                  <tr key={refund.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 text-sm font-medium text-slate-900 dark:text-white">
                      #{refund.order_id}
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                      {refund.profiles?.full_name || 'Guest'}
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-900 dark:text-white">
                      KES {refund.amount?.toLocaleString() || 0}
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400 max-w-[200px] truncate">
                      {refund.reason || 'N/A'}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        refund.status === 'approved' || refund.status === 'completed' ? 'bg-green-100 text-green-700' :
                        refund.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {refund.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {refund.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleUpdateStatus(refund.id, 'approved')} className="text-green-600 hover:bg-green-50 p-2 rounded-lg transition-colors" title="Approve">
                            <CheckCircle size={18} />
                          </button>
                          <button onClick={() => handleUpdateStatus(refund.id, 'rejected')} className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Reject">
                            <XCircle size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminRefundsPage;
