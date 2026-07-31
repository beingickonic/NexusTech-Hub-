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
          <h1 className="text-3xl font-bold text-nexus-heading">Refund Management</h1>
          <p className="text-nexus-muted">Review and process customer refund requests</p>
        </div>
        <button 
          onClick={fetchRefunds}
          className="flex items-center gap-2 bg-nexus-card border border-nexus-border px-4 py-2 rounded-lg text-nexus-muted hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors shadow-sm"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="bg-nexus-card rounded-2xl border border-nexus-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-nexus-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="bg-nexus-surface border border-nexus-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-nexus-primary dark:text-white"
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
              <tr className="bg-nexus-surface/50 border-b border-nexus-border">
                <th className="p-4 text-xs font-semibold text-nexus-textSecondary uppercase tracking-wider">Order</th>
                <th className="p-4 text-xs font-semibold text-nexus-textSecondary uppercase tracking-wider">Customer</th>
                <th className="p-4 text-xs font-semibold text-nexus-textSecondary uppercase tracking-wider">Amount</th>
                <th className="p-4 text-xs font-semibold text-nexus-textSecondary uppercase tracking-wider">Reason</th>
                <th className="p-4 text-xs font-semibold text-nexus-textSecondary uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-nexus-textSecondary uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nexus-border dark:divide-nexus-card">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-nexus-textSecondary">Loading refunds...</td>
                </tr>
              ) : filteredRefunds.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-nexus-textSecondary">No refund requests found.</td>
                </tr>
              ) : (
                filteredRefunds.map((refund) => (
                  <tr key={refund.id} className="hover:bg-nexus-surface dark:hover:bg-nexus-hover/50 transition-colors">
                    <td className="p-4 text-sm font-medium text-nexus-heading">
                      #{refund.order_id}
                    </td>
                    <td className="p-4 text-sm text-nexus-muted">
                      {refund.profiles?.full_name || 'Guest'}
                    </td>
                    <td className="p-4 text-sm font-bold text-nexus-heading">
                      KES {refund.amount?.toLocaleString() || 0}
                    </td>
                    <td className="p-4 text-sm text-nexus-muted max-w-[200px] truncate">
                      {refund.reason || 'N/A'}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        refund.status === 'approved' || refund.status === 'completed' ? 'bg-nexus-success/10 text-nexus-success' :
                        refund.status === 'rejected' ? 'bg-nexus-error/10 text-nexus-error' :
                        'bg-nexus-gold/10 text-nexus-gold'
                      }`}>
                        {refund.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {refund.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleUpdateStatus(refund.id, 'approved')} className="text-nexus-success hover:bg-nexus-success/5 p-2 rounded-lg transition-colors" title="Approve">
                            <CheckCircle size={18} />
                          </button>
                          <button onClick={() => handleUpdateStatus(refund.id, 'rejected')} className="text-nexus-error hover:bg-nexus-error/5 p-2 rounded-lg transition-colors" title="Reject">
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
