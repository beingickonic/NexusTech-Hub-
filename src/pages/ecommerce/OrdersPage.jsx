import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import orderService from '../../services/orderService';
import OrderCard from '../../components/orders/OrderCard';
import EmptyOrders from '../../components/orders/EmptyOrders';
import { Package, SlidersHorizontal } from 'lucide-react';

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'paid', label: 'Paid' },
  { key: 'picking', label: 'Processing' },
  { key: 'out for delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        try {
          const res = await orderService.getOrders();
          if (res.success) {
            setOrders(res.data.orders || []);
          }
        } catch (error) {
          console.error('Error fetching orders', error);
        }
      }
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  const filteredOrders = activeTab === 'all'
    ? orders
    : orders.filter(o => (o.status || '').toLowerCase() === activeTab);

  return (
    <div className="min-h-screen pt-32 pb-20 bg-nexus-surface transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Package className="text-nexus-primary" size={36} />
            <h1 className="text-4xl font-bold text-nexus-heading">Order History</h1>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {STATUS_TABS.map(tab => {
            const count = tab.key === 'all'
              ? orders.length
              : orders.filter(o => (o.status || '').toLowerCase() === tab.key).length;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-nexus-primary text-white shadow-md shadow-primary/30'
                    : 'bg-nexus-card text-nexus-text border border-nexus-border hover:bg-nexus-surface dark:hover:bg-nexus-hover'
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20' : 'bg-nexus-surface'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-nexus-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <EmptyOrders />
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
