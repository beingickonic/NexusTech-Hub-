import { useState, useEffect } from 'react';
import { Eye, Search, Filter, ArrowDownToLine, MoreVertical, ChevronLeft, ChevronRight, X, Package, Truck, CreditCard, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dateFormatter';
import { adminService } from '../../services/adminService';
import { supabase } from '../../services/supabaseClient';

const getStatusBadge = (status) => {
  switch (status) {
    case 'delivered':
      return 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-200 dark:border-green-500/20';
    case 'shipped':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20';
    case 'processing':
      return 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/20';
    case 'pending':
      return 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border-orange-200 dark:border-orange-500/20';
    case 'cancelled':
      return 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20';
    default:
      return 'bg-slate-50 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200 dark:border-slate-500/20';
  }
};

const OrdersTable = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

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
  }, [search, statusFilter, meta.page]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= meta.totalPages) {
      fetchOrders(newPage, search, statusFilter);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      // Update local state without full reload
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

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 md:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-200 dark:border-slate-700">
        <div className="relative w-full sm:max-w-md flex items-center">
          <input 
            type="text" 
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none transition-all placeholder:text-slate-400 text-slate-900 dark:text-white"
          />
          <Search size={18} className="absolute left-3 text-slate-400" />
        </div>
        
        <div className="flex w-full sm:w-auto items-center gap-3">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex items-center justify-center px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-600 outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors border border-slate-200 dark:border-slate-600 w-full sm:w-auto">
            <ArrowDownToLine size={16} /> Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-700">
              <th className="px-6 py-4">Order Number</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Total Amount</th>
              <th className="px-6 py-4">Payment Status</th>
              <th className="px-6 py-4">Order Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50 text-sm">
            {isLoading ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  </div>
                </td>
              </tr>
            ) : errorMsg ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="text-red-500 font-semibold mb-2">Error loading orders</div>
                  <div className="text-slate-500 text-sm max-w-lg mx-auto bg-red-50 dark:bg-red-500/10 p-3 rounded-lg border border-red-100 dark:border-red-500/20 break-words">{errorMsg}</div>
                  <div className="mt-4 text-xs text-slate-400">If you see an RLS error, ensure the SQL policies were added correctly and your user role is "Admin".</div>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-slate-500">No orders found.</td>
              </tr>
            ) : orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                  {order.order_number || `#ORD-${order.id.toString().padStart(5, '0')}`}
                </td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                  {formatDate(order.date)}
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-slate-900 dark:text-white">{order.customer || 'Guest User'}</span>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{order.items} items</div>
                </td>
                <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(order.total)}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${
                    order.payment_status === 'paid' || order.payment_status === 'completed'
                      ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20'
                      : 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20'
                  }`}>
                    {order.payment_status || 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className={`outline-none cursor-pointer appearance-none px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${getStatusBadge(order.status)}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 relative group">
                    <button onClick={() => setSelectedOrder(order)} className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-lg transition-colors" title="View Details">
                      <Eye size={16} />
                    </button>
                    <div className="relative">
                      <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                        <MoreVertical size={16} />
                      </button>
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 flex flex-col py-2">
                        <button onClick={() => window.print()} className="px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50">Print Invoice</button>
                        <button onClick={() => window.print()} className="px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50">Download PDF</button>
                        <button className="px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50">Track Shipment</button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <div>Showing page {meta.page} of {meta.totalPages || 1} ({meta.total} total items)</div>
        <div className="flex gap-2">
          <button 
            onClick={() => handlePageChange(meta.page - 1)}
            disabled={meta.page === 1}
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={() => handlePageChange(meta.page + 1)}
            disabled={meta.page >= meta.totalPages}
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
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
          <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white dark:bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300 flex flex-col border-l border-slate-200 dark:border-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  Order Details
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${getStatusBadge(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {selectedOrder.order_number || `#ORD-${selectedOrder.id.toString().padStart(5, '0')}`} • {formatDate(selectedOrder.date)}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-300 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Customer & Shipping Section */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/50">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Package size={18} className="text-orange-500" /> Customer & Shipping
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Customer Name</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedOrder.customer}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Phone Number</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedOrder.phone || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Shipping Address</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedOrder.shipping_address || 'Address not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Order Items Section */}
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Products Ordered</h4>
                <div className="space-y-3">
                  {(selectedOrder.order_items || []).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden shrink-0">
                        {item.products?.image_url ? (
                          <img src={item.products.image_url} alt={item.products?.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400"><Package size={20} /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{item.products?.title || 'Unknown Product'}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment & Manual Management Section */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/50">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <CreditCard size={18} className="text-success" /> Payment & Management
                </h4>
                
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Payment Status</label>
                    <select 
                      value={selectedOrder.payment_status || 'pending'}
                      onChange={(e) => handlePaymentStatusChange(selectedOrder.id, e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/50 capitalize"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Order Status</label>
                    <select 
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/50 capitalize"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <span className="font-semibold text-slate-900 dark:text-white">Total Amount</span>
                  <span className="text-xl font-bold text-orange-500">{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Timeline Section */}
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Order Timeline</h4>
                <div className="space-y-4 pl-3 border-l-2 border-slate-200 dark:border-slate-700 ml-3">
                  <div className="relative">
                    <div className="absolute -left-[19px] top-1 w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600 ring-4 ring-white dark:ring-slate-900" />
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Order Created</p>
                    <p className="text-xs text-slate-500">{formatDate(selectedOrder.date)}</p>
                  </div>
                  {(selectedOrder.payment_status === 'paid' || selectedOrder.payment_status === 'completed') && (
                    <div className="relative">
                      <div className="absolute -left-[19px] top-1 w-3 h-3 rounded-full bg-success ring-4 ring-white dark:ring-slate-900" />
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Payment Confirmed</p>
                      <p className="text-xs text-slate-500">Tracked in Payments</p>
                    </div>
                  )}
                  {(selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered') && (
                    <div className="relative">
                      <div className="absolute -left-[19px] top-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white dark:ring-slate-900" />
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Order Shipped</p>
                    </div>
                  )}
                  {selectedOrder.status === 'delivered' && (
                    <div className="relative">
                      <div className="absolute -left-[19px] top-1 w-3 h-3 rounded-full bg-green-500 ring-4 ring-white dark:ring-slate-900" />
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Delivered Successfully</p>
                    </div>
                  )}
                </div>
              </div>
              
            </div>
            
            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex gap-3">
              <button onClick={() => window.print()} className="flex-1 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                Print Invoice
              </button>
              <button onClick={() => setSelectedOrder(null)} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-orange-500/30">
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
