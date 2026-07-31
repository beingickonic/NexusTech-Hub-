import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  BarChart3, TrendingUp, Package, Truck, Users, DollarSign,
  Clock, AlertTriangle, Download, RefreshCw
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { reportsService } from '../../services/reportsService';

const COLORS = ['#FF6B57', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];
const STATUS_COLORS = {
  Completed: '#10b981', Delivered: '#3b82f6', 'Out for Delivery': '#f59e0b',
  'Pending Finance Approval': '#f97316', Cancelled: '#ef4444', Refunded: '#8b5cf6',
  Paid: '#14b8a6', Reserved: '#6366f1', 'Ready for Dispatch': '#06b6d4',
  Assigned: '#f43f5e', Pending: '#6b7280',
};

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-nexus-card rounded-xl border border-nexus-border p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-nexus-textSecondary uppercase tracking-wider">{label}</span>
        <div className={`p-2 rounded-lg`} style={{ backgroundColor: `${color}15` }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-nexus-heading truncate">{value}</p>
      {sub && <p className="text-xs text-nexus-textSecondary mt-1">{sub}</p>}
    </div>
  );
}

export default function ReportsDashboardPage() {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [revenueKpis, setRevenueKpis] = useState(null);
  const [orderTrends, setOrderTrends] = useState([]);
  const [deliveryPerf, setDeliveryPerf] = useState(null);
  const [inventorySummary, setInventorySummary] = useState(null);
  const [orderDistribution, setOrderDistribution] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [customerStats, setCustomerStats] = useState(null);
  const [financeKpis, setFinanceKpis] = useState(null);
  const [days, setDays] = useState(30);

  const fetchAll = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const [rk, ot, dp, inv, od, tp, cs, fk] = await Promise.all([
        reportsService.getRevenueKpis().catch(() => null),
        reportsService.getOrderTrends(days).catch(() => []),
        reportsService.getDeliveryPerformance().catch(() => null),
        reportsService.getInventorySummary().catch(() => null),
        reportsService.getOrderStatusDistribution().catch(() => []),
        reportsService.getTopProducts().catch(() => []),
        reportsService.getCustomerStats().catch(() => null),
        reportsService.getFinanceKpis().catch(() => null),
      ]);
      setRevenueKpis(rk); setOrderTrends(ot); setDeliveryPerf(dp);
      setInventorySummary(inv); setOrderDistribution(od); setTopProducts(tp);
      setCustomerStats(cs); setFinanceKpis(fk);
    } finally {
      setLoading(false); setRefreshing(false);
    }
  };

  useEffect(() => { fetchAll(); }, [days]);

  const fmtCurrency = (v) => {
    if (!v && v !== 0) return '—';
    return `Ksh ${Number(v).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-2 sm:p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-nexus-heading">Reports & Analytics</h1>
          <p className="text-sm text-nexus-textSecondary mt-0.5">Real-time KPIs and performance metrics</p>
        </div>
        <button
          onClick={() => fetchAll(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-nexus-border text-nexus-muted hover:bg-nexus-surface dark:hover:bg-nexus-surface transition-colors"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      {revenueKpis && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={TrendingUp} label="Total Revenue" value={fmtCurrency(revenueKpis.total_revenue)} color="#10b981" />
          <StatCard icon={DollarSign} label="Avg Order Value" value={fmtCurrency(revenueKpis.avg_order_value)} color="#3b82f6" />
          <StatCard icon={Clock} label="Pending Revenue" value={fmtCurrency(revenueKpis.pending_revenue)} color="#f59e0b" />
          <StatCard icon={Package} label="Orders" value={revenueKpis.order_count} sub="In period" color="#FF6B57" />
        </div>
      )}

      {/* Order Trends Chart */}
      <div className="bg-nexus-card rounded-xl border border-nexus-border p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-sm font-semibold text-nexus-heading">Order Trends</h2>
          <div className="flex bg-nexus-surface dark:bg-nexus-bg rounded-lg p-1">
            {[7, 14, 30, 90].map(d => (
              <button key={d} onClick={() => setDays(d)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${days === d ? 'bg-nexus-card shadow-sm text-nexus-heading' : 'text-nexus-textSecondary hover:text-nexus-heading dark:hover:text-white'}`}>
                {d}D
              </button>
            ))}
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={orderTrends} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="trendRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B57" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF6B57" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} />
              <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} dy={8} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#111827' : '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Area type="monotone" dataKey="revenue" stroke="#FF6B57" strokeWidth={2} fill="url(#trendRev)" name="Revenue" />
              <Area type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} fill="none" name="Orders" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Delivery Performance + Inventory Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery */}
        <div className="bg-nexus-card rounded-xl border border-nexus-border p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-nexus-heading mb-4 flex items-center gap-2">
            <Truck size={16} className="text-nexus-success" /> Delivery Performance
          </h2>
          {deliveryPerf ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-nexus-surface dark:bg-nexus-bg rounded-lg">
                <p className="text-2xl font-bold text-nexus-success">{deliveryPerf.total_deliveries}</p>
                <p className="text-xs text-nexus-textSecondary">Deliveries</p>
              </div>
              <div className="text-center p-3 bg-nexus-surface dark:bg-nexus-bg rounded-lg">
                <p className="text-2xl font-bold text-nexus-info">{deliveryPerf.on_time_rate}%</p>
                <p className="text-xs text-nexus-textSecondary">On-Time Rate</p>
              </div>
              <div className="text-center p-3 bg-nexus-surface dark:bg-nexus-bg rounded-lg">
                <p className="text-2xl font-bold text-nexus-gold">{deliveryPerf.avg_delivery_minutes}m</p>
                <p className="text-xs text-nexus-textSecondary">Avg Time</p>
              </div>
              <div className="text-center p-3 bg-nexus-surface dark:bg-nexus-bg rounded-lg">
                <p className="text-2xl font-bold text-nexus-error">{deliveryPerf.failed}</p>
                <p className="text-xs text-nexus-textSecondary">Failed</p>
              </div>
            </div>
          ) : <p className="text-sm text-nexus-textSecondary">No delivery data yet.</p>}
        </div>

        {/* Inventory */}
        <div className="bg-nexus-card rounded-xl border border-nexus-border p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-nexus-heading mb-4 flex items-center gap-2">
            <Package size={16} className="text-nexus-primary" /> Inventory Summary
          </h2>
          {inventorySummary ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-nexus-textSecondary">Total Products</span>
                <span className="text-sm font-semibold text-nexus-heading">{inventorySummary.total_products}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-nexus-textSecondary">Low Stock Items</span>
                <span className="text-sm font-semibold text-nexus-gold">{inventorySummary.low_stock}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-nexus-textSecondary">Out of Stock</span>
                <span className="text-sm font-semibold text-nexus-error">{inventorySummary.out_of_stock}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-nexus-textSecondary">Inventory Value</span>
                <span className="text-sm font-semibold text-nexus-heading">{fmtCurrency(inventorySummary.total_inventory_value)}</span>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-nexus-textSecondary mb-1">
                  <span>Stock Health</span>
                  <span>{inventorySummary.stock_health_pct}%</span>
                </div>
                <div className="w-full h-2 bg-nexus-surface dark:bg-nexus-bg rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-error via-nexus-light-gold to-success rounded-full transition-all"
                    style={{ width: `${Math.max(inventorySummary.stock_health_pct, 5)}%` }} />
                </div>
              </div>
            </div>
          ) : <p className="text-sm text-nexus-textSecondary">No inventory data yet.</p>}
        </div>
      </div>

      {/* Order Distribution + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-nexus-card rounded-xl border border-nexus-border p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-nexus-heading mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-info" /> Order Status Distribution
          </h2>
          {orderDistribution.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={orderDistribution} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label={({ status, percent }) => `${(percent * 100).toFixed(0)}%`}>
                    {orderDistribution.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.status] || COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="text-sm text-nexus-textSecondary">No orders yet.</p>}
        </div>

        {/* Top Products */}
        <div className="bg-nexus-card rounded-xl border border-nexus-border p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-nexus-heading mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-nexus-info" /> Top Products
          </h2>
          {topProducts.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ left: 0, right: 20, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="title" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} width={120} tickFormatter={v => v.length > 15 ? v.slice(0, 15) + '…' : v} />
                  <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#111827' : '#fff', borderRadius: '12px', fontSize: '12px' }} />
                  <Bar dataKey="revenue" fill="#FF6B57" radius={[0, 4, 4, 0]} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="text-sm text-nexus-textSecondary">No product sales data yet.</p>}
        </div>
      </div>

      {/* Finance KPIs + Customer Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {financeKpis && (
          <div className="bg-nexus-card rounded-xl border border-nexus-border p-4 sm:p-6">
            <h2 className="text-sm font-semibold text-nexus-heading mb-4 flex items-center gap-2">
              <DollarSign size={16} className="text-nexus-success" /> Finance Overview
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-nexus-surface dark:bg-nexus-bg rounded-lg">
                <p className="text-2xl font-bold text-nexus-gold">{financeKpis.pending_approvals}</p>
                <p className="text-xs text-nexus-textSecondary">Pending Approvals</p>
              </div>
              <div className="text-center p-3 bg-nexus-surface dark:bg-nexus-bg rounded-lg">
                <p className="text-2xl font-bold text-nexus-success">{financeKpis.approval_rate}%</p>
                <p className="text-xs text-nexus-textSecondary">Approval Rate</p>
              </div>
              <div className="text-center p-3 bg-nexus-surface dark:bg-nexus-bg rounded-lg">
                <p className="text-2xl font-bold text-nexus-info">{financeKpis.approved}</p>
                <p className="text-xs text-nexus-textSecondary">Approved</p>
              </div>
              <div className="text-center p-3 bg-nexus-surface dark:bg-nexus-bg rounded-lg">
                <p className="text-2xl font-bold text-nexus-error">{financeKpis.rejected}</p>
                <p className="text-xs text-nexus-textSecondary">Rejected</p>
              </div>
            </div>
          </div>
        )}

        {customerStats && (
          <div className="bg-nexus-card rounded-xl border border-nexus-border p-4 sm:p-6">
            <h2 className="text-sm font-semibold text-nexus-heading mb-4 flex items-center gap-2">
              <Users size={16} className="text-info" /> Customer Overview
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-nexus-surface dark:bg-nexus-bg rounded-lg">
                <p className="text-2xl font-bold text-nexus-info">{customerStats.total_customers}</p>
                <p className="text-xs text-nexus-textSecondary">Total Customers</p>
              </div>
              <div className="text-center p-3 bg-nexus-surface dark:bg-nexus-bg rounded-lg">
                <p className="text-2xl font-bold text-nexus-gold">{customerStats.average_rating}</p>
                <p className="text-xs text-nexus-textSecondary">Avg Rating</p>
              </div>
              <div className="text-center p-3 bg-nexus-surface dark:bg-nexus-bg rounded-lg">
                <p className="text-2xl font-bold text-nexus-success">{customerStats.total_feedback}</p>
                <p className="text-xs text-nexus-textSecondary">Feedback Received</p>
              </div>
              <div className="text-center p-3 bg-nexus-surface dark:bg-nexus-bg rounded-lg">
                <p className="text-2xl font-bold text-info">{customerStats.average_loyalty_points}</p>
                <p className="text-xs text-nexus-textSecondary">Avg Loyalty Pts</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Export placeholder */}
      <div className="flex justify-end gap-3 pt-2 pb-6">
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-nexus-surface dark:bg-nexus-surface text-nexus-textSecondary hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors">
          <Download size={14} /> Export CSV
        </button>
      </div>
    </div>
  );
}
