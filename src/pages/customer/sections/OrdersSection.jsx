import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Clock, Truck, CheckCircle, XCircle, RefreshCw, CreditCard, ChevronRight, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../../auth/AuthContext';
import { supabase } from '../../../services/supabaseClient';
import { Link } from 'react-router-dom';

const TABS = [
  { label: 'All',         value: null,              icon: Package },
  { label: 'Unpaid',      value: 'Awaiting Payment', icon: CreditCard },
  { label: 'Processing',  value: 'Processing',       icon: Clock },
  { label: 'Shipped',     value: 'Shipped',          icon: Truck },
  { label: 'Delivered',   value: 'Delivered',        icon: CheckCircle },
  { label: 'Cancelled',   value: 'Cancelled',        icon: XCircle },
  { label: 'Refunded',    value: 'Refunded',         icon: RefreshCw },
];

const STATUS_STYLES = {
  'Pending':          'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Awaiting Payment': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Paid':             'bg-green-500/10 text-green-400 border-green-500/20',
  'Processing':       'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Shipped':          'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Delivered':        'bg-green-500/10 text-green-400 border-green-500/20',
  'Cancelled':        'bg-red-500/10 text-red-400 border-red-500/20',
  'Refunded':         'bg-gray-500/10 text-slate-500 dark:text-gray-400 border-gray-500/20',
};

const EmptyState = ({ tab }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 text-center"
  >
    <div className="w-20 h-20 rounded-full bg-[#FF6B57]/10 flex items-center justify-center mb-5">
      <ShoppingBag size={36} className="text-[#FF6B57]/60" />
    </div>
    <h3 className="text-slate-900 dark:text-white font-semibold text-lg mb-2">No {tab} orders</h3>
    <p className="text-slate-500 dark:text-gray-500 text-sm max-w-xs mb-6">
      {tab === 'All' ? "You haven't placed any orders yet." : `You have no ${tab.toLowerCase()} orders.`}
    </p>
    <Link
      to="/products"
      className="px-6 py-2.5 rounded-xl bg-[#FF6B57] hover:bg-[#ff5a2e] text-slate-900 dark:text-white text-sm font-medium transition-colors"
    >
      Start Shopping
    </Link>
  </motion.div>
);

const OrderRow = ({ order }) => {
  const statusStyle = STATUS_STYLES[order.status] || 'bg-gray-500/10 text-slate-500 dark:text-gray-400 border-gray-500/20';
  const date = new Date(order.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#0C1220] border border-slate-200 dark:border-[#1F2937] rounded-xl p-5 hover:border-[#FF6B57]/30 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#FF6B57]/10 flex items-center justify-center flex-shrink-0">
            <Package size={20} className="text-[#FF6B57]" />
          </div>
          <div>
            <p className="text-slate-900 dark:text-white font-semibold text-sm">Order #{order.id}</p>
            <p className="text-slate-500 dark:text-gray-500 text-xs mt-0.5">{date}</p>
            {order.order_items && order.order_items.length > 0 && (
              <p className="text-slate-500 dark:text-gray-400 text-xs mt-1">
                {order.order_items.length} item{order.order_items.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-slate-500 dark:text-gray-500 text-xs mb-1">Total</p>
            <p className="text-slate-900 dark:text-white font-bold text-sm">
              KES {Number(order.total_amount).toLocaleString()}
            </p>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusStyle}`}>
            {order.status}
          </span>

          <Link
            to={`/orders/${order.id}`}
            className="p-2 rounded-lg text-slate-500 dark:text-gray-500 hover:text-[#FF6B57] hover:bg-[#FF6B57]/10 transition-all"
          >
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      {/* Mobile total */}
      <div className="flex items-center justify-between mt-3 sm:hidden pt-3 border-t border-slate-200 dark:border-[#1F2937]">
        <p className="text-slate-500 dark:text-gray-500 text-xs">Total</p>
        <p className="text-slate-900 dark:text-white font-bold text-sm">KES {Number(order.total_amount).toLocaleString()}</p>
      </div>
    </motion.div>
  );
};

const OrdersSection = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      setLoading(true);
      let query = supabase
        .from('orders')
        .select('*, order_items(id, quantity, price, product_id)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      if (!error) setOrders(data || []);
      setLoading(false);
    };
    fetchOrders();

    // Real-time updates
    const channel = supabase.channel(`customer-orders-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  const filteredOrders = TABS[activeTab].value === null
    ? orders
    : orders.filter(o => o.status === TABS[activeTab].value);

  const tabCounts = TABS.map((tab, i) => {
    if (i === 0) return orders.length;
    return orders.filter(o => o.status === tab.value).length;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Orders</h1>
        <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">Track and manage all your orders</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar mb-6 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1F2937] rounded-xl p-1">
        {TABS.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(i)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
              activeTab === i
                ? 'bg-[#FF6B57] text-slate-900 dark:text-white shadow-lg'
                : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <tab.icon size={13} />
            {tab.label}
            {tabCounts[i] > 0 && (
              <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === i ? 'bg-white/20 text-slate-900 dark:text-white' : 'bg-[#1F2937] text-slate-500 dark:text-gray-400'
              }`}>
                {tabCounts[i]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#FF6B57] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <EmptyState tab={TABS[activeTab].label} />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {filteredOrders.map(order => (
              <OrderRow key={order.id} order={order} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default OrdersSection;
