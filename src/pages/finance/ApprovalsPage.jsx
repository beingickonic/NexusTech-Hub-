import { useState, useEffect } from 'react';
import { financeService } from '../../services/financeService';
import { ShieldCheck, Search, CheckCircle, XCircle, AlertTriangle, Eye, Clock, DollarSign, User, FileText } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dateFormatter';

const ApprovalsPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadPendingApprovals();
  }, []);

  const loadPendingApprovals = async () => {
    setLoading(true);
    const result = await financeService.getPendingApprovals();
    if (result.success) {
      setOrders(result.data);
    }
    setLoading(false);
  };

  const handleApprove = async (orderId) => {
    setActionLoading(true);
    const result = await financeService.approvePayment(orderId, notes);
    if (result.success) {
      setOrders(prev => prev.filter(o => o.id !== orderId));
      setSelectedOrder(null);
      setNotes('');
    }
    setActionLoading(false);
  };

  const handleReject = async (orderId) => {
    if (!notes.trim()) return;
    setActionLoading(true);
    const result = await financeService.rejectPayment(orderId, notes);
    if (result.success) {
      setOrders(prev => prev.filter(o => o.id !== orderId));
      setSelectedOrder(null);
      setNotes('');
    }
    setActionLoading(false);
  };

  const handleInvestigate = async (orderId) => {
    if (!notes.trim()) return;
    setActionLoading(true);
    const result = await financeService.investigatePayment(orderId, notes);
    if (result.success) {
      setOrders(prev => prev.filter(o => o.id !== orderId));
      setSelectedOrder(null);
      setNotes('');
    }
    setActionLoading(false);
  };

  const filteredOrders = orders.filter(o =>
    !search || o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
    o.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    (o.profiles?.email || o.profiles?.phone)?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-nexus-heading">Payment Approvals</h1>
          <p className="text-nexus-textSecondary mt-1">Review and approve customer payments</p>
        </div>
        <button
          onClick={loadPendingApprovals}
          className="bg-nexus-success hover:bg-nexus-success text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Clock size={16} /> Refresh
        </button>
      </div>

      <div className="bg-white/80 dark:bg-nexus-card/80 backdrop-blur-md rounded-2xl border border-nexus-border shadow-sm">
        <div className="p-4 border-b border-nexus-border">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-textSecondary" size={18} />
            <input
              type="text"
              placeholder="Search by order number or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-nexus-border bg-nexus-surface text-nexus-heading focus:ring-2 focus:ring-nexus-success outline-none text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-nexus-surface/50 text-nexus-textSecondary text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nexus-border dark:divide-nexus-card/50 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-nexus-textSecondary">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nexus-success"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-nexus-textSecondary">No pending approvals.</td>
                </tr>
              ) : filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-nexus-surface/50 dark:hover:bg-nexus-hover/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-nexus-heading">
                      {order.order_number || `#${order.id.slice(0, 8)}`}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-nexus-heading">{order.profiles?.full_name || 'N/A'}</div>
                    <div className="text-xs text-nexus-textSecondary">{order.profiles?.email || order.profiles?.phone}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-nexus-heading">
                    {formatCurrency(order.total_amount)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-info/10 text-info dark:bg-info/100/20 dark:text-info uppercase">
                      {order.payment_method || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-nexus-textSecondary whitespace-nowrap">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 text-nexus-textSecondary hover:text-nexus-success hover:bg-nexus-success/10 dark:hover:bg-nexus-success/10 rounded-lg transition-colors"
                      title="Review"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => { setSelectedOrder(null); setNotes(''); }} />
          <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-nexus-card shadow-2xl z-50 flex flex-col border-l border-nexus-border">
            <div className="flex items-center justify-between p-6 border-b border-nexus-border">
              <div>
                <h3 className="text-xl font-bold text-nexus-heading flex items-center gap-3">
                  <ShieldCheck size={20} className="text-nexus-success" />
                  Payment Review
                </h3>
                <p className="text-sm text-nexus-textSecondary mt-1">
                  {selectedOrder.order_number || `#${selectedOrder.id.slice(0, 8)}`}
                </p>
              </div>
              <button onClick={() => { setSelectedOrder(null); setNotes(''); }} className="p-2 text-nexus-textSecondary hover:text-nexus-muted hover:bg-nexus-surface dark:hover:bg-nexus-hover rounded-full transition-colors">
                <XCircle size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-nexus-surface rounded-xl p-4">
                  <p className="text-xs text-nexus-textSecondary mb-1">Customer</p>
                  <p className="font-medium text-nexus-heading flex items-center gap-2">
                    <User size={14} className="text-nexus-textSecondary" />
                    {selectedOrder.profiles?.full_name || 'N/A'}
                  </p>
                  <p className="text-sm text-nexus-textSecondary mt-1">{selectedOrder.profiles?.email || selectedOrder.profiles?.phone}</p>
                  <p className="text-sm text-nexus-textSecondary">{selectedOrder.profiles?.phone}</p>
                </div>
                <div className="bg-nexus-surface rounded-xl p-4">
                  <p className="text-xs text-nexus-textSecondary mb-1">Amount</p>
                  <p className="text-2xl font-bold text-nexus-success">{formatCurrency(selectedOrder.total_amount)}</p>
                  <p className="text-xs text-nexus-textSecondary mt-1">
                    Payment: <span className="uppercase font-medium">{selectedOrder.payment_method || 'N/A'}</span>
                  </p>
                </div>
              </div>

              {(selectedOrder.payments || []).length > 0 && (
                <div className="bg-nexus-surface rounded-xl p-4">
                  <h4 className="font-semibold text-nexus-heading mb-3 flex items-center gap-2">
                    <DollarSign size={16} className="text-nexus-success" /> Payment Details
                  </h4>
                  {selectedOrder.payments.map((p, i) => (
                    <div key={p.id || i} className="flex justify-between items-center py-2 border-b border-nexus-border last:border-0">
                      <div>
                        <p className="text-sm font-medium text-nexus-heading capitalize">{p.provider}</p>
                        <p className="text-xs text-nexus-textSecondary">Ref: {p.transaction_reference || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{formatCurrency(p.amount)}</p>
                        <p className={`text-xs capitalize ${p.status === 'paid' ? 'text-nexus-success' : 'text-nexus-gold'}`}>{p.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-nexus-surface rounded-xl p-4">
                <h4 className="font-semibold text-nexus-heading mb-3">Order Items</h4>
                <div className="space-y-2">
                  {(selectedOrder.order_items || []).map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-nexus-border last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-nexus-surface dark:bg-nexus-card rounded-lg overflow-hidden shrink-0">
                          {item.products?.image_url ? (
                            <img src={item.products.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-nexus-textSecondary"><FileText size={14} /></div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-nexus-heading">{item.products?.title || 'Product'}</p>
                          <p className="text-xs text-nexus-textSecondary">Qty: {item.quantity} x {formatCurrency(item.price)}</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-nexus-heading">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-nexus-heading mb-2">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes for this decision..."
                  rows={3}
                  className="w-full bg-nexus-surface border border-nexus-border rounded-xl px-4 py-3 text-sm text-nexus-heading outline-none focus:ring-2 focus:ring-nexus-success/50 resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-nexus-border bg-nexus-surface/50 dark:bg-nexus-surface/50 flex gap-3">
              <button
                onClick={() => handleInvestigate(selectedOrder.id)}
                disabled={actionLoading || !notes.trim()}
                className="flex items-center gap-2 px-4 py-2.5 bg-nexus-gold hover:bg-nexus-gold disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
              >
                <AlertTriangle size={16} /> Investigate
              </button>
              <button
                onClick={() => handleReject(selectedOrder.id)}
                disabled={actionLoading || !notes.trim()}
                className="flex items-center gap-2 px-4 py-2.5 bg-nexus-error hover:bg-nexus-error disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
              >
                <XCircle size={16} /> Reject
              </button>
              <button
                onClick={() => handleApprove(selectedOrder.id)}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-nexus-success hover:bg-nexus-success disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-nexus-success/30"
              >
                {actionLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <CheckCircle size={16} />
                )}
                Approve Payment
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ApprovalsPage;
