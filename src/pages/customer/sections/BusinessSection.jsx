import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Package, Wallet, Heart, Tag, Star, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '../../../auth/AuthContext';
import { supabase } from '../../../services/supabaseClient';

const KPICard = ({ label, value, sub, icon: Icon, color, trend }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-nexus-card border border-nexus-border dark:border-nexus-card rounded-2xl p-6 flex items-start gap-4 hover:border-nexus-border transition-colors"
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon size={22} className="text-nexus-heading" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-nexus-textSecondary dark:text-nexus-muted text-sm mb-1">{label}</p>
      <p className="text-nexus-heading font-bold text-2xl">{value}</p>
      {sub && <p className="text-nexus-textSecondary dark:text-nexus-muted text-xs mt-0.5">{sub}</p>}
    </div>
    {trend !== undefined && (
      <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
        trend >= 0 ? 'bg-nexus-success/10 text-nexus-success' : 'bg-nexus-error/10 text-nexus-error'
      }`}>
        {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {Math.abs(trend)}%
      </div>
    )}
  </motion.div>
);

const BusinessSection = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    wishlistCount: 0,
    couponsUsed: 0,
    deliveredOrders: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      setLoading(true);
      const [ordersRes, wishlistRes] = await Promise.all([
        supabase.from('orders').select('id, total_amount, status, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('wishlist').select('id', { count: 'exact' }).eq('user_id', user.id),
      ]);

      const orders = ordersRes.data || [];
      const totalSpent = orders
        .filter(o => ['Paid', 'Picking', 'Packing', 'Ready for Dispatch', 'Assigned', 'Out for Delivery', 'Delivered', 'Completed'].includes(o.status))
        .reduce((sum, o) => sum + Number(o.total_amount), 0);

      setStats({
        totalOrders: orders.length,
        totalSpent,
        wishlistCount: wishlistRes.count || 0,
        deliveredOrders: orders.filter(o => o.status === 'Delivered').length,
        pendingOrders: orders.filter(o => ['Pending', 'Awaiting Payment', 'Paid', 'Picking', 'Packing', 'Ready for Dispatch', 'Assigned', 'Out for Delivery'].includes(o.status)).length,
        couponsUsed: 0, // No coupons table join yet
      });
      setRecentOrders(orders.slice(0, 5));
      setLoading(false);
    };
    fetchStats();
  }, [user]);

  // Loyalty points: 1 point per KES 100 spent
  const loyaltyPoints = Math.floor(stats.totalSpent / 100);
  const loyaltyTier = loyaltyPoints >= 500 ? 'Gold' : loyaltyPoints >= 200 ? 'Silver' : 'Bronze';
  const tierColors = { Gold: 'text-nexus-gold', Silver: 'text-nexus-muted', Bronze: 'text-nexus-primary' };

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="w-10 h-10 border-4 border-nexus-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-nexus-heading">Business Overview</h1>
        <p className="text-nexus-textSecondary dark:text-nexus-muted text-sm mt-1">Your shopping activity and loyalty status</p>
      </div>

      {/* Loyalty tier banner */}
      <div className="bg-gradient-to-r from-nexus-primary/10 to-white dark:from-nexus-dark-navy dark:to-nexus-card border border-nexus-primary/20 rounded-2xl p-6 mb-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-nexus-primary to-nexus-primary-hover flex items-center justify-center text-nexus-heading font-bold text-2xl flex-shrink-0">
          <Star size={28} />
        </div>
        <div>
          <p className="text-nexus-textSecondary dark:text-nexus-muted text-xs uppercase tracking-wider font-semibold mb-1">Loyalty Status</p>
          <p className={`text-2xl font-bold ${tierColors[loyaltyTier]}`}>{loyaltyTier} Member</p>
          <p className="text-nexus-textSecondary dark:text-nexus-muted text-sm mt-0.5">
            <span className="text-nexus-heading font-semibold">{loyaltyPoints.toLocaleString()}</span> reward points earned
          </p>
        </div>
        <div className="ml-auto text-right hidden sm:block">
          <p className="text-nexus-textSecondary dark:text-nexus-muted text-xs mb-1">Next tier</p>
          {loyaltyTier === 'Bronze' && <p className="text-nexus-muted text-sm font-semibold">{200 - loyaltyPoints} pts to Silver</p>}
          {loyaltyTier === 'Silver' && <p className="text-nexus-muted text-sm font-semibold">{500 - loyaltyPoints} pts to Gold</p>}
          {loyaltyTier === 'Gold' && <p className="text-nexus-gold text-sm font-semibold">Max tier reached! 🎉</p>}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <KPICard
          label="Total Orders"
          value={stats.totalOrders}
          sub={`${stats.deliveredOrders} delivered`}
          icon={Package}
          color="bg-nexus-info/20"
        />
        <KPICard
          label="Total Spent"
          value={`KES ${stats.totalSpent.toLocaleString()}`}
          sub="Across all orders"
          icon={Wallet}
          color="bg-nexus-primary/20"
        />
        <KPICard
          label="Wishlist Items"
          value={stats.wishlistCount}
          sub="Saved products"
          icon={Heart}
          color="bg-nexus-error/20"
        />
        <KPICard
          label="Active Orders"
          value={stats.pendingOrders}
          sub="In progress"
          icon={TrendingUp}
          color="bg-info/100/20"
        />
        <KPICard
          label="Reward Points"
          value={loyaltyPoints.toLocaleString()}
          sub="1 pt per KES 100 spent"
          icon={Star}
          color="bg-nexus-gold/20"
        />
        <KPICard
          label="Coupons Used"
          value={stats.couponsUsed}
          sub="Discounts applied"
          icon={Tag}
          color="bg-nexus-success/20"
        />
      </div>

      {/* Recent activity */}
      {recentOrders.length > 0 && (
        <div className="bg-white dark:bg-nexus-card border border-nexus-border dark:border-nexus-card rounded-2xl p-6">
          <h3 className="text-nexus-heading font-semibold mb-4 flex items-center gap-2">
            <BarChart2 size={16} className="text-nexus-primary" /> Recent Activity
          </h3>
          <div className="space-y-3">
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-nexus-border dark:border-nexus-card last:border-0">
                <div>
                  <p className="text-nexus-heading text-sm font-medium">Order #{order.id}</p>
                  <p className="text-nexus-textSecondary dark:text-nexus-muted text-xs">{new Date(order.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-nexus-heading text-sm font-semibold">KES {Number(order.total_amount).toLocaleString()}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    order.status === 'Delivered' ? 'bg-nexus-success/10 text-nexus-success' :
                    order.status === 'Cancelled' ? 'bg-nexus-error/10 text-nexus-error' :
                    'bg-nexus-info/10 text-nexus-info'
                  }`}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default BusinessSection;
