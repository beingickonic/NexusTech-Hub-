import React, { useState, useEffect } from 'react';
import { Search, Filter, Box, PackageCheck, Printer, ClipboardList, Send, ArrowRight, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../services/supabaseClient';
import orderService from '../../services/orderService';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dateFormatter';

const notifyCustomer = async (userId, title, message, type = 'info') => {
  if (!userId) return;
  try {
    await supabase.rpc('send_notification', { p_user_id: userId, p_title: title, p_message: message, p_type: type });
  } catch (e) {
    console.warn('Customer notification failed:', e?.message);
  }
};

const PROCESSING_TABS = [
  { key: 'to pick', label: 'To Pick', icon: ClipboardList, color: 'bg-info/10 text-info dark:bg-info/100/20 dark:text-info' },
  { key: 'packing', label: 'Packing', icon: PackageCheck, color: 'bg-info/10 text-info dark:bg-info/100/20 dark:text-info' },
  { key: 'ready for dispatch', label: 'Ready to Ship', icon: Send, color: 'bg-info/10 text-info dark:bg-info/100/20 dark:text-info' },
  { key: 'awaiting stock', label: 'Awaiting Stock', icon: AlertTriangle, color: 'bg-nexus-gold/10 text-nexus-gold dark:bg-nexus-gold/20 dark:text-nexus-gold' },
  { key: 'completed', label: 'Completed', icon: CheckCircle, color: 'bg-nexus-success/10 text-nexus-success dark:bg-nexus-success/20 dark:text-nexus-success' },
];

const FETCHED_STATUSES = ['Reserved', 'Ready for Picking', 'Picking', 'Packing', 'Ready for Dispatch', 'Waiting for Stock', 'Completed'];

const PICKABLE_STATUSES = ['Reserved', 'Ready for Picking', 'Picking'];

const getPriorityBadge = (priority) => {
  switch ((priority || 'normal').toLowerCase()) {
    case 'urgent': return 'bg-nexus-error/10 text-nexus-error dark:bg-nexus-error/20 dark:text-nexus-error';
    case 'high': return 'bg-nexus-primary/15 text-nexus-primary dark:bg-nexus-primary/20 dark:text-nexus-primary';
    default: return 'bg-nexus-surface text-nexus-heading dark:bg-white/10 dark:text-nexus-textSecondary';
  }
};

const getStockBadge = (order) => {
  if (order.status === 'Waiting for Stock') {
    return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-nexus-gold/10 text-nexus-gold dark:bg-nexus-gold/20">Low stock — awaiting restock</span>;
  }
  if (order.inventory_status === 'approved') {
    return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-nexus-success/10 text-nexus-success dark:bg-nexus-success/20">Stock reserved</span>;
  }
  return null;
};

const OrderProcessingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('to pick');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pickingId, setPickingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*), profiles!fk_orders_user_profiles(full_name, phone)')
        .in('status', FETCHED_STATUSES)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Failed to fetch processing orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const channel = supabase.channel('order-processing-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `status=in.(${FETCHED_STATUSES.join(',')})`
      }, () => fetchOrders())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const handleStartPicking = async (order) => {
    if (pickingId) return;
    setPickingId(order.id);
    const res = await orderService.updateOrderStatus(order.id, 'Picking');
    if (res.success) {
      toast.success('Picking started for this order');
      notifyCustomer(
        order.user_id,
        'Order is being prepared',
        'Your order is being picked in our warehouse and will be on its way soon.'
      );
      fetchOrders();
    } else {
      toast.error(res.message || 'Failed to start picking');
    }
    setPickingId(null);
  };

  const handleCompletePicking = async (order) => {
    const loading = toast.loading('Completing pick...');
    const res = await orderService.deductInventory(order.id);
    if (res.success) {
      await orderService.updateOrderStatus(order.id, 'Packing');
      toast.success('Pick complete — order moved to packing', { id: loading });
      notifyCustomer(
        order.user_id,
        'Order packed and ready',
        'Your order has been packed and is moving to dispatch preparation.'
      );
      fetchOrders();
    } else {
      toast.error(res.message || 'Failed to complete pick', { id: loading });
    }
  };

  const handleCompletePacking = async (order) => {
    const res = await orderService.updateOrderStatus(order.id, 'Ready for Dispatch');
    if (res.success) {
      toast.success('Order marked ready for dispatch');
      fetchOrders();
    } else {
      toast.error(res.message || 'Failed to mark ready');
    }
  };

  const filteredOrders = orders.filter(order => {
    let statusMatch;
    switch (activeTab) {
      case 'completed':
        statusMatch = order.status === 'Completed';
        break;
      case 'awaiting stock':
        statusMatch = order.status === 'Waiting for Stock';
        break;
      case 'to pick':
        statusMatch = PICKABLE_STATUSES.includes(order.status);
        break;
      default:
        statusMatch = order.status?.toLowerCase() === activeTab;
    }

    const searchMatch = !searchTerm ||
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

    return statusMatch && searchMatch;
  });

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-nexus-heading">Order Processing</h1>
          <p className="text-sm text-nexus-textSecondary">Pick, pack, and prepare customer orders for dispatch.</p>
        </div>
      </div>

      {/* Processing Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {PROCESSING_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-nexus-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-nexus-card text-nexus-text border border-nexus-border hover:bg-nexus-surface dark:hover:bg-nexus-hover'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white dark:bg-nexus-bg border border-nexus-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-nexus-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-nexus-surface dark:bg-nexus-hover">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-textSecondary" size={18} />
            <input 
              type="text" 
              placeholder="Search by Order ID or Customer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-nexus-bg border border-nexus-border rounded-xl text-sm focus:outline-none focus:border-nexus-primary transition-colors"
            />
          </div>
          <span className="text-sm text-nexus-textSecondary">
            {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nexus-primary"></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16 text-nexus-textSecondary">
              <PackageCheck size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-medium">No orders in this stage</p>
              <p className="text-sm mt-1">Orders will appear here when they reach this status.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-nexus-surface dark:bg-nexus-hover text-nexus-textSecondary">
                <tr>
                  <th className="px-6 py-4 font-medium">Order Number</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Products</th>
                  <th className="px-6 py-4 font-medium">Total</th>
                  <th className="px-6 py-4 font-medium">Priority</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nexus-border dark:divide-nexus-card">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors">
                    <td className="px-6 py-4 font-medium text-nexus-heading">
                      {order.order_number || `#ORD-${order.id}`}
                      <div className="mt-1">{getStockBadge(order)}</div>
                    </td>
                    <td className="px-6 py-4 text-nexus-muted">
                      {order.profiles?.full_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-nexus-muted">
                      {order.order_items?.length || 0} Item{(order.order_items?.length || 0) !== 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 font-semibold text-nexus-heading">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityBadge(order.priority)}`}>
                        {(order.priority || 'normal').charAt(0).toUpperCase() + (order.priority || 'normal').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-nexus-textSecondary text-xs">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {activeTab === 'to pick' && PICKABLE_STATUSES.slice(0, 2).includes(order.status) && (
                        <button
                          onClick={() => handleStartPicking(order)}
                          disabled={pickingId === order.id}
                          className="text-info hover:text-info font-medium text-xs inline-flex items-center gap-1 px-3 py-1.5 bg-info/10 dark:bg-info/100/10 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {pickingId === order.id ? <Loader2 size={14} className="animate-spin" /> : <Box size={14} />} Start Picking
                        </button>
                      )}
                      {activeTab === 'to pick' && order.status === 'Picking' && (
                        <button
                          onClick={() => handleCompletePicking(order)}
                          className="text-nexus-primary hover:text-nexus-primary font-medium text-xs inline-flex items-center gap-1 px-3 py-1.5 bg-nexus-primary/10 dark:bg-nexus-primary/10 rounded-lg transition-colors"
                        >
                          <PackageCheck size={14} /> Complete Pick
                        </button>
                      )}
                      {activeTab === 'awaiting stock' && (
                        <span className="text-xs text-nexus-gold font-medium inline-flex items-center gap-1">
                          <AlertTriangle size={14} /> Awaiting Restock
                        </span>
                      )}
                      {activeTab === 'packing' && (
                        <button
                          onClick={() => handleCompletePacking(order)}
                          className="text-info hover:text-info font-medium text-xs inline-flex items-center gap-1 px-3 py-1.5 bg-info/10 dark:bg-info/100/10 rounded-lg transition-colors"
                        >
                          <Send size={14} /> Mark Ready
                        </button>
                      )}
                      {activeTab === 'ready for dispatch' && (
                        <span className="text-xs text-info font-medium inline-flex items-center gap-1">
                          <CheckCircle size={14} /> Awaiting Dispatch
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderProcessingPage;
