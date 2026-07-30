import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Package, Wallet, Heart, Tag, Star, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '../../../auth/AuthContext';
import { supabase } from '../../../services/supabaseClient';

const KPICard = ({ label, value, sub, icon: Icon, color, trend }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1F2937] rounded-2xl p-6 flex items-start gap-4 hover:border-nexus-border transition-colors"
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon size={22} className="text-slate-900 dark:text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-nexus-textSecondary dark:text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-slate-900 dark:text-white font-bold text-2xl">{value}</p>
      {sub && <p className="text-nexus-textSecondary dark:text-gray-500 text-xs mt-0.5">{sub}</p>}
    </div>
    {trend !== undefined && (
      <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
        trend >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
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
        .filter(o => ['Paid', 'Processing', 'Shipped', 'Delivered'].includes(o.status))
        .reduce((sum, o) => sum + Number(o.total_amount), 0);

      setStats({
        totalOrders: orders.length,
        totalSpent,
        wishlistCount: wishlistRes.count || 0,
        deliveredOrders: orders.filter(o => o.status === 'Delivered').length,
        pendingOrders: orders.filter(o => ['Pending', 'Processing', 'Shipped'].includes(o.status)).length,
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
  const tierColors = { Gold: 'text-yellow-400', Silver: 'text-slate-600 dark:text-gray-300', Bronze: 'text-orange-400' };

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="w-10 h-10 border-4 border-nexus-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Business Overview</h1>
        <p className="text-nexus-textSecondary dark:text-gray-400 text-sm mt-1">Your shopping activity and loyalty status</p>
      </div>

      {/* Loyalty tier banner */}
      <div className="bg-gradient-to-r from-orange-50 to-white dark:from-[#1a0f0a] dark:to-[#111827] border border-nexus-primary/20 rounded-2xl p-6 mb-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-nexus-primary to-[#FF8C42] flex items-center justify-center text-slate-900 dark:text-white font-bold text-2xl flex-shrink-0">
          <Star size={28} />
        </div>
        <div>
          <p className="text-nexus-textSecondary dark:text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">Loyalty Status</p>
          <p className={`text-2xl font-bold ${tierColors[loyaltyTier]}`}>{loyaltyTier} Member</p>
          <p className="text-nexus-textSecondary dark:text-gray-400 text-sm mt-0.5">
            <span className="text-slate-900 dark:text-white font-semibold">{loyaltyPoints.toLocaleString()}</span> reward points earned
          </p>
        </div>
        <div className="ml-auto text-right hidden sm:block">
          <p className="text-nexus-textSecondary dark:text-gray-500 text-xs mb-1">Next tier</p>
          {loyaltyTier === 'Bronze' && <p className="text-slate-600 dark:text-gray-300 text-sm font-semibold">{200 - loyaltyPoints} pts to Silver</p>}
          {loyaltyTier === 'Silver' && <p className="text-slate-600 dark:text-gray-300 text-sm font-semibold">{500 - loyaltyPoints} pts to Gold</p>}
          {loyaltyTier === 'Gold' && <p className="text-yellow-400 text-sm font-semibold">Max tier reached! 🎉</p>}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <KPICard
          label="Total Orders"
          value={stats.totalOrders}
          sub={`${stats.deliveredOrders} delivered`}
          icon={Package}
          color="bg-blue-500/20"
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
          color="bg-rose-500/20"
        />
        <KPICard
          label="Active Orders"
          value={stats.pendingOrders}
          sub="In progress"
          icon={TrendingUp}
          color="bg-purple-500/20"
        />
        <KPICard
          label="Reward Points"
          value={loyaltyPoints.toLocaleString()}
          sub="1 pt per KES 100 spent"
          icon={Star}
          color="bg-yellow-500/20"
        />
        <KPICard
          label="Coupons Used"
          value={stats.couponsUsed}
          sub="Discounts applied"
          icon={Tag}
          color="bg-green-500/20"
        />
      </div>

      {/* Recent activity */}
      {recentOrders.length > 0 && (
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1F2937] rounded-2xl p-6">
          <h3 className="text-slate-900 dark:text-white font-semibold mb-4 flex items-center gap-2">
            <BarChart2 size={16} className="text-nexus-primary" /> Recent Activity
          </h3>
          <div className="space-y-3">
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-[#1F2937] last:border-0">
                <div>
                  <p className="text-slate-900 dark:text-white text-sm font-medium">Order #{order.id}</p>
                  <p className="text-nexus-textSecondary dark:text-gray-500 text-xs">{new Date(order.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-900 dark:text-white text-sm font-semibold">KES {Number(order.total_amount).toLocaleString()}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    order.status === 'Delivered' ? 'bg-green-500/10 text-green-400' :
                    order.status === 'Cancelled' ? 'bg-red-500/10 text-red-400' :
                    'bg-blue-500/10 text-blue-400'
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
