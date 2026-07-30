import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Search, DollarSign, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

const PaymentsDashboard = () => {
  const [payments, setPayments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, paid, pending, failed
  const [search, setSearch] = useState('');

  const [selectedPayload, setSelectedPayload] = useState(null);

  const fetchPayments = async () => {
    setLoading(true);
    // Join payment_callbacks to get receipt and phone number for searching
    const { data: paymentsData } = await supabase
      .from('payments')
      .select('*, profiles(full_name, email), payment_callbacks(mpesa_receipt, phone_number, raw_payload)')
      .order('created_at', { ascending: false });
      
    const { data: logsData } = await supabase
      .from('payment_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
      
    if (paymentsData) setPayments(paymentsData);
    if (logsData) setLogs(logsData);
    setLoading(false);
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'failed': case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'processing': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  const getProviderIcon = (provider) => {
    return <span className="uppercase text-xs font-bold text-nexus-textSecondary">{provider}</span>;
  };

  const filteredPayments = payments.filter(p => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      const matchRef = p.transaction_reference?.toLowerCase().includes(s);
      const matchName = p.profiles?.full_name?.toLowerCase().includes(s);
      // callbacks might be an array depending on how supabase joins 1:many
      const callbacks = Array.isArray(p.payment_callbacks) ? p.payment_callbacks : (p.payment_callbacks ? [p.payment_callbacks] : []);
      const matchReceipt = callbacks.some(c => c.mpesa_receipt?.toLowerCase().includes(s) || c.phone_number?.includes(s));
      if (!matchRef && !matchName && !matchReceipt) return false;
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ["ID", "Reference", "Order ID", "Customer", "Amount", "Status", "Date", "Receipt", "Phone"];
    const rows = filteredPayments.map(p => {
      const callbacks = Array.isArray(p.payment_callbacks) ? p.payment_callbacks : (p.payment_callbacks ? [p.payment_callbacks] : []);
      const receipt = callbacks[0]?.mpesa_receipt || '';
      const phone = callbacks[0]?.phone_number || '';
      return [
        p.id, p.transaction_reference, p.order_id, p.profiles?.full_name || 'Guest',
        p.amount, p.status, new Date(p.created_at).toISOString(), receipt, phone
      ].join(',');
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "payments_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Payments Dashboard</h1>
          <p className="text-nexus-textSecondary dark:text-nexus-textSecondary">Monitor and manage all transactions</p>
        </div>
        <button 
          onClick={fetchPayments}
          className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-nexus-border px-4 py-2 rounded-lg text-slate-700 dark:text-nexus-textSecondary hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-nexus-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-nexus-textSecondary dark:text-nexus-textSecondary">Total Revenue</h3>
            <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-500">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            ${totalRevenue.toLocaleString()}
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-nexus-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-nexus-textSecondary dark:text-nexus-textSecondary">Success Rate</h3>
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
              <CheckCircle size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {payments.length > 0 ? Math.round((payments.filter(p => p.status === 'paid').length / payments.length) * 100) : 0}%
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-nexus-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-nexus-textSecondary dark:text-nexus-textSecondary">Failed / Cancelled</h3>
            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500">
              <XCircle size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {payments.filter(p => ['failed', 'cancelled'].includes(p.status)).length}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Transactions Table */}
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-nexus-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-nexus-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Transactions</h2>
            
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <input 
                  type="text" 
                  placeholder="Search ref or customer..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-nexus-surface border border-slate-200 dark:border-nexus-border rounded-lg outline-none focus:ring-2 focus:ring-orange-500 text-sm dark:text-white"
                />
                <Search size={16} className="absolute left-3 top-2.5 text-nexus-textSecondary" />
              </div>
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="bg-slate-50 dark:bg-nexus-surface border border-slate-200 dark:border-nexus-border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
              >
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
              <button 
                onClick={handleExportCSV}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Export CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-nexus-surface/50 text-nexus-textSecondary dark:text-nexus-textSecondary text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Ref / ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Provider</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredPayments.length > 0 ? filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white text-sm truncate max-w-[150px]">
                        {payment.transaction_reference || `N/A`}
                      </div>
                      <div className="text-xs text-nexus-textSecondary">Order #{payment.order_id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">{payment.profiles?.full_name || 'Guest'}</div>
                      <div className="text-xs text-nexus-textSecondary">{payment.profiles?.email}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {payment.currency} {payment.amount}
                    </td>
                    <td className="px-6 py-4">
                      {getProviderIcon(payment.provider)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-nexus-textSecondary">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => {
                          const callbacks = Array.isArray(payment.payment_callbacks) ? payment.payment_callbacks : (payment.payment_callbacks ? [payment.payment_callbacks] : []);
                          setSelectedPayload(callbacks[0]?.raw_payload || { message: "No payload available" });
                        }}
                        className="text-orange-500 hover:text-orange-600 font-medium text-xs underline"
                      >
                        View Payload
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-nexus-textSecondary">
                      No payments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Logs Sidebar */}
        <div className="w-full lg:w-80 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-nexus-border shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-6 border-b border-slate-200 dark:border-nexus-border">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">API Webhook Logs</h2>
            <p className="text-xs text-nexus-textSecondary mt-1">Live feed from Edge Functions</p>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-4 bg-slate-50 dark:bg-nexus-surface/30">
            {logs.length > 0 ? logs.map(log => (
              <div key={log.id} className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-nexus-border text-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-900 dark:text-white text-xs uppercase">{log.provider}</span>
                  <span className="text-[10px] text-nexus-textSecondary">{new Date(log.created_at).toLocaleTimeString()}</span>
                </div>
                <div className="text-orange-600 dark:text-orange-400 font-mono text-xs mb-1">[{log.event_type}]</div>
                <div className="text-xs text-slate-600 dark:text-nexus-textSecondary truncate">
                  Payment ID: {log.payment_id}
                </div>
              </div>
            )) : (
              <div className="text-center text-nexus-textSecondary text-sm py-10">No logs yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Payload Modal */}
      {selectedPayload && (
        <div className="fixed inset-0 bg-nexus-surface/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-nexus-border">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Raw Callback Payload</h3>
              <button 
                onClick={() => setSelectedPayload(null)}
                className="text-nexus-textSecondary hover:text-slate-600 dark:hover:text-white"
              >
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-nexus-surface/50">
              <pre className="text-xs font-mono text-slate-800 dark:text-nexus-textSecondary whitespace-pre-wrap break-words">
                {JSON.stringify(selectedPayload, null, 2)}
              </pre>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-nexus-border text-right">
              <button 
                onClick={() => setSelectedPayload(null)}
                className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsDashboard;
