import { useState, useEffect } from 'react';
import { Eye, Search, ArrowDownToLine, MoreVertical, ChevronLeft, ChevronRight, X, Package, Truck, CreditCard, CheckCircle, AlertTriangle, Clock, MapPin, Home, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dateFormatter';
import { adminService } from '../../services/adminService';
import { supabase } from '../../services/supabaseClient';

const STATUS_TABS = [
  { key: 'all', label: 'All Orders', color: 'bg-nexus-surface text-nexus-heading dark:bg-nexus-card dark:text-nexus-text' },
  { key: 'pending', label: 'Pending Payment', color: 'bg-nexus-gold/10 text-nexus-gold dark:bg-nexus-gold/20 dark:text-nexus-gold' },
  { key: 'paid', label: 'Paid', color: 'bg-nexus-success/10 text-nexus-success dark:bg-nexus-success/20 dark:text-nexus-success' },
  { key: 'pending finance approval', label: 'Pending Finance', color: 'bg-info/10 text-info dark:bg-info/100/20 dark:text-info' },
  { key: 'finance approved', label: 'Finance Approved', color: 'bg-nexus-info/10 text-nexus-info dark:bg-nexus-info/20 dark:text-nexus-info' },
  { key: 'waiting for stock', label: 'Waiting for Stock', color: 'bg-nexus-primary/15 text-nexus-primary dark:bg-nexus-primary/20 dark:text-nexus-primary' },
  { key: 'reserved', label: 'Reserved', color: 'bg-nexus-info/10 text-nexus-info dark:bg-nexus-info/20 dark:text-nexus-info' },
  { key: 'picking', label: 'Picking', color: 'bg-info/10 text-info dark:bg-info/100/20 dark:text-info' },
  { key: 'packing', label: 'Packing', color: 'bg-info/10 text-info dark:bg-info/100/20 dark:text-info' },
  { key: 'ready for dispatch', label: 'Ready for Dispatch', color: 'bg-info/10 text-info dark:bg-info/100/20 dark:text-info' },
  { key: 'assigned', label: 'Assigned', color: 'bg-success/10 text-success dark:bg-success/100/20 dark:text-success' },
  { key: 'out for delivery', label: 'Out for Delivery', color: 'bg-info/10 text-info dark:bg-info/100/20 dark:text-info' },
  { key: 'delivered', label: 'Delivered', color: 'bg-nexus-success/10 text-nexus-success dark:bg-nexus-success/20 dark:text-nexus-success' },
  { key: 'completed', label: 'Completed', color: 'bg-nexus-success/10 text-nexus-success dark:bg-nexus-success/20 dark:text-nexus-success' },
  { key: 'cancelled', label: 'Cancelled', color: 'bg-nexus-error/10 text-nexus-error dark:bg-nexus-error/20 dark:text-nexus-error' },
  { key: 'refunded', label: 'Refunded', color: 'bg-nexus-surface text-nexus-heading dark:bg-nexus-muted/20 dark:text-nexus-muted' },
];

const getStatusBadge = (status) => {
  const key = (status || '').toLowerCase();
  switch (key) {
    case 'delivered': case 'completed':
      return 'bg-nexus-success/5 text-nexus-success dark:bg-nexus-success/10 dark:text-nexus-success border-nexus-success/20 dark:border-nexus-success/20';
    case 'shipped': case 'assigned': case 'out for delivery':
      return 'bg-nexus-info/10 text-nexus-info dark:bg-nexus-info/10 dark:text-nexus-info border-nexus-info/20';
    case 'picking': case 'packing':
      return 'bg-info/10 text-info dark:bg-info/100/10 dark:text-info border-info/20 dark:border-info/20';
    case 'pending': case 'awaiting payment': case 'pending payment verification':
      return 'bg-nexus-primary/10 text-nexus-primary dark:bg-nexus-primary/10 dark:text-nexus-primary border-nexus-primary/20';
    case 'paid': case 'reserved':
      return 'bg-nexus-success/10 text-nexus-success dark:bg-nexus-success/10 dark:text-nexus-success border-nexus-success/20';
    case 'pending finance approval':
      return 'bg-info/10 text-info dark:bg-info/100/10 dark:text-info border-info/20 dark:border-info/20';
    case 'finance approved':
      return 'bg-nexus-info/10 text-nexus-info dark:bg-nexus-info/10 dark:text-nexus-info border-nexus-info/20';
    case 'waiting for stock':
      return 'bg-nexus-gold/10 text-nexus-gold dark:bg-nexus-gold/10 dark:text-nexus-gold border-nexus-gold/20';
    case 'ready for dispatch':
      return 'bg-info/10 text-info dark:bg-info/100/10 dark:text-info border-info/20 dark:border-info/20';
    case 'cancelled':
      return 'bg-nexus-error/5 text-nexus-error dark:bg-nexus-error/10 dark:text-nexus-error border-nexus-error/20 dark:border-nexus-error/20';
    case 'refunded':
      return 'bg-nexus-surface text-nexus-heading dark:bg-nexus-muted/10 dark:text-nexus-muted border-nexus-border dark:border-nexus-border/20';
    default:
      return 'bg-nexus-surface text-nexus-heading dark:bg-nexus-muted/10 dark:text-nexus-textSecondary border-nexus-border dark:border-nexus-border/20';
  }
};

const getPriorityBadge = (priority) => {
  switch ((priority || 'normal').toLowerCase()) {
    case 'urgent': return 'bg-nexus-error/10 text-nexus-error dark:bg-nexus-error/20 dark:text-nexus-error';
    case 'high': return 'bg-nexus-primary/15 text-nexus-primary dark:bg-nexus-primary/20 dark:text-nexus-primary';
    default: return 'bg-nexus-surface text-nexus-heading dark:bg-white/10 dark:text-nexus-textSecondary';
  }
};

const ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'awaiting payment', label: 'Awaiting Payment' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending payment verification', label: 'Pending Verification' },
  { value: 'payment failed', label: 'Payment Failed' },
  { value: 'pending finance approval', label: 'Pending Finance' },
  { value: 'finance approved', label: 'Finance Approved' },
  { value: 'waiting for stock', label: 'Waiting for Stock' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'picking', label: 'Picking' },
  { value: 'packing', label: 'Packing' },
  { value: 'ready for dispatch', label: 'Ready for Dispatch' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'out for delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
];

const OrdersTable = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const fetchOrders = async (currentPage = 1, searchQuery = search, currentStatus = statusFilter) => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const response = await adminService.getOrders({ page: currentPage, search: searchQuery, status: currentStatus });
      if (response.status === 'success') {
        setOrders(response.data);
        if (response.meta) setMeta(response.meta);
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
      setErrorMsg(error?.message || "An unexpected error occurred while fetching orders.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchOrders(1, search, statusFilter);
    }, 500);

    const channel = supabase.channel('orders-table-events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders(meta.page, search, statusFilter);
      })
      .subscribe();

    return () => {
      clearTimeout(delayDebounceFn);
      supabase.removeChannel(channel);
    };
  }, [search, statusFilter]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= meta.totalPages) {
      fetchOrders(newPage, search, statusFilter);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handlePaymentStatusChange = async (orderId, newPaymentStatus) => {
    try {
      await adminService.updateOrder(orderId, { payment_status: newPaymentStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: newPaymentStatus } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, payment_status: newPaymentStatus }));
      }
    } catch (error) {
      console.error("Failed to update payment status", error);
    }
  };

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setStatusFilter(tabKey);
    setMeta(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="bg-white/80 dark:bg-nexus-card/80 backdrop-blur-md rounded-2xl border border-nexus-border shadow-sm overflow-hidden flex flex-col">
      {/* Status Tabs */}
      <div className="border-b border-nexus-border">
        <div className="overflow-x-auto scrollbar-hide px-4 pt-4">
          <div className="flex gap-2 pb-3 min-w-max">
            {STATUS_TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-nexus-primary text-white shadow-md shadow-primary/30'
                      : tab.color + ' hover:opacity-80'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-nexus-border">
        <div className="relative w-full sm:max-w-md flex items-center">
          <input 
            type="text" 
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-nexus-surface border border-nexus-border rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-nexus-primary/50 outline-none transition-all placeholder:text-nexus-textSecondary text-nexus-heading"
          />
          <Search size={18} className="absolute left-3 text-nexus-textSecondary" />
        </div>
        
        <div className="flex w-full sm:w-auto items-center gap-3">
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-nexus-surface hover:bg-nexus-surface dark:hover:bg-nexus-hover text-nexus-text rounded-lg text-sm font-medium transition-colors border border-nexus-border dark:border-nexus-border w-full sm:w-auto">
            <ArrowDownToLine size={16} /> Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-nexus-surface/50 text-nexus-muted text-xs uppercase tracking-wider font-semibold border-b border-nexus-border">
              <th className="px-6 py-4">Order Number</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Payment</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nexus-border dark:divide-nexus-card/50 text-sm">
            {isLoading ? (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center text-nexus-textSecondary">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nexus-primary"></div>
                  </div>
                </td>
              </tr>
            ) : errorMsg ? (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center">
                  <div className="text-nexus-error font-semibold mb-2">Error loading orders</div>
                  <div className="text-nexus-textSecondary text-sm max-w-lg mx-auto bg-nexus-error/5 dark:bg-nexus-error/10 p-3 rounded-lg border border-nexus-error/10 dark:border-nexus-error/20 break-words">{errorMsg}</div>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center text-nexus-textSecondary">No orders found.</td>
              </tr>
            ) : orders.map((order) => (
              <tr key={order.id} className="hover:bg-nexus-surface/50 dark:hover:bg-nexus-hover/30 transition-colors">
                <td className="px-6 py-4 font-medium text-nexus-heading">
                  {order.order_number}
                </td>
                <td className="px-6 py-4 text-nexus-textSecondary whitespace-nowrap">
                  {formatDate(order.date)}
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-nexus-heading">{order.customer || 'Guest User'}</span>
                  <div className="text-xs text-nexus-textSecondary mt-0.5">{order.items} items</div>
                </td>
                <td className="px-6 py-4 font-semibold text-nexus-heading">
                  {formatCurrency(order.total)}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${
                    order.payment_status === 'paid' || order.payment_status === 'completed'
                      ? 'bg-nexus-success/5 text-nexus-success border-nexus-success/20 dark:bg-nexus-success/10 dark:text-nexus-success dark:border-nexus-success/20'
                      : order.payment_status === 'failed'
                        ? 'bg-nexus-error/5 text-nexus-error border-nexus-error/20 dark:bg-nexus-error/10 dark:text-nexus-error dark:border-nexus-error/20'
                        : 'bg-nexus-primary/10 text-nexus-primary border-nexus-primary/20 dark:bg-nexus-primary/10 dark:text-nexus-primary dark:border-nexus-primary/20'
                  }`}>
                    {order.payment_status || 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityBadge(order.priority)}`}>
                    {(order.priority || 'normal').charAt(0).toUpperCase() + (order.priority || 'normal').slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className={`outline-none cursor-pointer appearance-none px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${getStatusBadge(order.status)}`}
                  >
                    {ORDER_STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 relative group">
                    <button onClick={() => setSelectedOrder(order)} className="p-2 text-nexus-textSecondary hover:text-nexus-primary hover:bg-nexus-primary/10 dark:hover:bg-nexus-primary/10 rounded-lg transition-colors" title="View Details">
                      <Eye size={16} />
                    </button>
                    <div className="relative">
                      <button className="p-2 text-nexus-textSecondary hover:text-nexus-heading hover:bg-nexus-surface dark:hover:bg-nexus-hover rounded-lg transition-colors">
                        <MoreVertical size={16} />
                      </button>
                      <div className="absolute right-0 mt-2 w-48 bg-nexus-card rounded-xl shadow-lg border border-nexus-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 flex flex-col py-2">
                        <button className="px-4 py-2 text-left text-sm text-nexus-muted hover:bg-nexus-surface dark:hover:bg-nexus-hover/50">Print Invoice</button>
                        <button className="px-4 py-2 text-left text-sm text-nexus-muted hover:bg-nexus-surface dark:hover:bg-nexus-hover/50">Download PDF</button>
                        <button className="px-4 py-2 text-left text-sm text-nexus-muted hover:bg-nexus-surface dark:hover:bg-nexus-hover/50">Track Shipment</button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 border-t border-nexus-border flex items-center justify-between text-sm text-nexus-textSecondary">
        <div>Showing page {meta.page} of {meta.totalPages || 1} ({meta.total} total items)</div>
        <div className="flex gap-2">
          <button 
            onClick={() => handlePageChange(meta.page - 1)}
            disabled={meta.page === 1}
            className="p-1.5 rounded-md hover:bg-nexus-surface dark:hover:bg-nexus-hover disabled:opacity-50 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={() => handlePageChange(meta.page + 1)}
            disabled={meta.page >= meta.totalPages}
            className="p-1.5 rounded-md hover:bg-nexus-surface dark:hover:bg-nexus-hover disabled:opacity-50 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Order Details Drawer */}
      {selectedOrder && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-nexus-card shadow-2xl z-50 transform transition-transform duration-300 flex flex-col border-l border-nexus-border">
            <div className="flex items-center justify-between p-6 border-b border-nexus-border bg-nexus-surface/50 dark:bg-nexus-surface/50">
              <div>
                <h3 className="text-xl font-bold text-nexus-heading flex items-center gap-3">
                  Order Details
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${getStatusBadge(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </h3>
                <p className="text-sm text-nexus-textSecondary mt-1">
                  {selectedOrder.order_number} • {formatDate(selectedOrder.date)}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-nexus-textSecondary hover:text-nexus-muted hover:bg-nexus-surface dark:hover:bg-nexus-hover dark:hover:text-nexus-textSecondary rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="bg-nexus-surface rounded-2xl p-5 border border-nexus-border/50">
                <h4 className="font-semibold text-nexus-heading mb-4 flex items-center gap-2">
                  <Package size={18} className="text-nexus-primary" /> Customer & Shipping
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-nexus-textSecondary mb-1">Customer Name</p>
                    <p className="text-sm font-medium text-nexus-heading">{selectedOrder.customer}</p>
                  </div>
                  <div>
                    <p className="text-xs text-nexus-textSecondary mb-1">Phone</p>
                    <p className="text-sm font-medium text-nexus-heading">{selectedOrder.phone || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-nexus-textSecondary mb-1">Shipping Address</p>
                    <p className="text-sm font-medium text-nexus-heading">{selectedOrder.shippingAddress || selectedOrder.shipping_address || 'Address not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-nexus-textSecondary mb-1">Priority</p>
                    <p className={`text-sm font-medium ${getPriorityBadge(selectedOrder.priority)} inline-block px-2 py-0.5 rounded`}>
                      {(selectedOrder.priority || 'normal').charAt(0).toUpperCase() + (selectedOrder.priority || 'normal').slice(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-nexus-textSecondary mb-1">Payment Method</p>
                    <p className="text-sm font-medium text-nexus-heading uppercase">{selectedOrder.payment_method || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-nexus-heading mb-4">Products Ordered</h4>
                <div className="space-y-3">
                  {(selectedOrder.order_items || []).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 rounded-xl border border-nexus-border hover:bg-nexus-surface dark:hover:bg-nexus-hover/50 transition-colors">
                      <div className="w-12 h-12 bg-nexus-surface rounded-lg overflow-hidden shrink-0">
                        {item.products?.image_url ? (
                          <img src={item.products.image_url} alt={item.products?.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-nexus-textSecondary"><Package size={20} /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-nexus-heading truncate">{item.products?.title || 'Unknown Product'}</p>
                        <p className="text-xs text-nexus-textSecondary">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-nexus-heading">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-nexus-surface rounded-2xl p-5 border border-nexus-border/50">
                <h4 className="font-semibold text-nexus-heading mb-4 flex items-center gap-2">
                  <CreditCard size={18} className="text-success" /> Payment & Management
                </h4>
                
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-nexus-textSecondary">Payment Status</label>
                    <select 
                      value={selectedOrder.payment_status || 'pending'}
                      onChange={(e) => handlePaymentStatusChange(selectedOrder.id, e.target.value)}
                      className="w-full bg-nexus-card border border-nexus-border rounded-lg px-3 py-2 text-sm text-nexus-heading outline-none focus:ring-2 focus:ring-nexus-primary/50 capitalize"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-nexus-textSecondary">Order Status</label>
                    <select 
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                      className="w-full bg-nexus-card border border-nexus-border rounded-lg px-3 py-2 text-sm text-nexus-heading outline-none focus:ring-2 focus:ring-nexus-primary/50 capitalize"
                    >
                      {ORDER_STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mt-5 pt-4 border-t border-nexus-border flex justify-between items-center">
                  <span className="font-semibold text-nexus-heading">Total Amount</span>
                  <span className="text-xl font-bold text-nexus-primary">{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-nexus-border bg-nexus-surface/50 dark:bg-nexus-surface/50 flex gap-3">
              <button className="flex-1 py-2.5 bg-nexus-card text-nexus-text rounded-lg text-sm font-medium border border-nexus-border hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors">
                Print Invoice
              </button>
              <button onClick={() => setSelectedOrder(null)} className="flex-1 py-2.5 bg-nexus-primary hover:bg-nexus-primary-hover text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/30">
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrdersTable;
