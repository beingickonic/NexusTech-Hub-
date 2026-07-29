import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Warehouse, Package, AlertTriangle, ArrowRightLeft, 
  TrendingUp, TrendingDown, ClipboardCheck, DollarSign,
  ShoppingCart, Box, BarChart2, Calendar, Truck, Database, Activity,
  CheckCircle2, AlertCircle, Bell, RefreshCw, ZapOff, Snail, Archive
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { supabase } from '../../services/supabaseClient';
import { inventoryService } from '../../services/inventoryService';

const HEALTH_CONFIG = {
  healthy:     { label: 'Healthy',     color: 'bg-emerald-500', textColor: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: CheckCircle2 },
  low_stock:   { label: 'Low Stock',   color: 'bg-amber-500',   textColor: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-500/10',   icon: TrendingDown },
  out_of_stock:{ label: 'Out of Stock',color: 'bg-red-500',     textColor: 'text-red-600',     bg: 'bg-red-50 dark:bg-red-500/10',       icon: AlertTriangle },
  overstocked: { label: 'Overstock',   color: 'bg-purple-500',  textColor: 'text-purple-600',  bg: 'bg-purple-50 dark:bg-purple-500/10', icon: TrendingUp },
  slow_moving: { label: 'Slow Moving', color: 'bg-blue-500',    textColor: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-500/10',     icon: Snail },
  dead_stock:  { label: 'Dead Stock',  color: 'bg-slate-500',   textColor: 'text-slate-600',   bg: 'bg-slate-50 dark:bg-white/5',        icon: Archive },
};

const InventoryDashboard = () => {
  const [stats, setStats]       = useState({ totalProducts: 0, totalInventory: 0, availableStock: 0, reservedStock: 0, inTransitStock: 0, inventoryValue: 0, lowStock: 0, outOfStock: 0, overstock: 0, healthyStock: 0, slowMoving: 0, deadStock: 0, incoming: 0, pendingRequests: 0, receivedToday: 0, adjustmentsToday: 0, warehouseCapacity: 0, inventoryHealthScore: 0, activeAlerts: 0 });
  const [health, setHealth]     = useState({ summary: {}, healthScore: 0 });
  const [alerts, setAlerts]     = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading]   = useState(true);

  const monthlyData = [];

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [statsRes, activityRes, healthRes, alertsRes] = await Promise.all([
      inventoryService.getDashboardStats(),
      inventoryService.getDashboardActivity(),
      inventoryService.getInventoryHealth(),
      inventoryService.getStockAlerts({ status: 'active', limit: 5 })
    ]);
    if (statsRes.success)  setStats(statsRes.stats);
    if (activityRes.success) setActivity(activityRes.activity);
    if (healthRes.success)  setHealth({ summary: healthRes.summary, healthScore: healthRes.healthScore });
    if (alertsRes.success)  setAlerts(alertsRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const sub1 = supabase.channel('inv_dash_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' },           fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory_movements' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'purchase_requests' },  fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stock_alerts' },        fetchData)
      .subscribe();
    return () => supabase.removeChannel(sub1);
  }, [fetchData]);

  const healthPieData = Object.entries(health.summary || {}).map(([key, val]) => ({
    name: HEALTH_CONFIG[key]?.label || key, value: val, fill: HEALTH_CONFIG[key]?.color.replace('bg-', '#').replace('-500','') || '#64748b'
  })).filter(d => d.value > 0);

  const HEALTH_COLORS = { healthy: '#10b981', low_stock: '#f59e0b', out_of_stock: '#ef4444', overstocked: '#a855f7', slow_moving: '#3b82f6', dead_stock: '#64748b' };

  const kpis = [
    { label: 'Total Products', value: stats.totalProducts.toLocaleString(), color: 'text-primary', bg: 'bg-primary/10 dark:bg-primary/10', icon: Box },
    { label: 'Total Inventory', value: stats.totalInventory?.toLocaleString() || 0, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', icon: Package },
    { label: 'Available Stock', value: stats.availableStock?.toLocaleString() || 0, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: ClipboardCheck },
    { label: 'Reserved Stock', value: stats.reservedStock?.toLocaleString() || 0, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', icon: AlertTriangle },
    { label: 'In Transit', value: stats.inTransitStock?.toLocaleString() || 0, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10', icon: Truck },
    { label: 'Total Stock Value', value: `$${stats.inventoryValue?.toLocaleString() || 0}`, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: DollarSign },
    { label: 'Low Stock Items', value: stats.lowStock || 0, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10', icon: TrendingDown },
    { label: 'Out of Stock', value: stats.outOfStock || 0, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10', icon: AlertTriangle },
    { label: 'Pending POs', value: stats.pendingRequests || 0, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/10', icon: ShoppingCart },
    { label: 'Received Today', value: stats.receivedToday || 0, color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-500/10', icon: Warehouse },
    { label: 'Warehouse Capacity', value: `${stats.warehouseCapacity || 0}%`, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-500/10', icon: Database },
    { label: 'Inventory Health', value: `${stats.inventoryHealthScore || 0}%`, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: Activity },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Warehouse Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time inventory metrics and stock health</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors">
            <RefreshCw size={16} className="text-slate-600 dark:text-slate-300" />
          </button>
          <Link to="/inventory/goods-received" className="inline-flex items-center gap-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors">
            <ClipboardCheck size={18} /> Receive GRN
          </Link>
          <Link to="/inventory/transfers" className="inline-flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-primary/25">
            <ArrowRightLeft size={18} /> Transfers
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white dark:bg-dark-surface p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex items-center gap-4 group hover:border-primary/40 dark:hover:border-primary/30 transition-colors"
          >
            <div className={`p-4 rounded-xl ${kpi.bg} transition-transform group-hover:scale-110`}>
              <kpi.icon size={24} className={kpi.color} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{kpi.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {loading ? <div className="h-8 w-16 bg-slate-100 dark:bg-white/5 rounded animate-pulse" /> : kpi.value}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Procurement Overview */}
      <div className="mb-6 bg-white dark:bg-dark-surface p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4"><ShoppingCart className="text-primary" size={20} /> Procurement Overview</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Suppliers</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{loading ? '-' : stats.totalSuppliers || 0}</p>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg"><Box size={20} /></div>
          </div>
          <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Open POs</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{loading ? '-' : stats.openPOs || 0}</p>
            </div>
            <div className="p-3 bg-orange-500/10 text-orange-500 rounded-lg"><Clock size={20} /></div>
          </div>
          <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Approved POs</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{loading ? '-' : stats.approvedPOs || 0}</p>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg"><CheckCircle2 size={20} /></div>
          </div>
          <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Received POs</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{loading ? '-' : stats.receivedPOs || 0}</p>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-lg"><Warehouse size={20} /></div>
          </div>
        </div>
      </div>
      {/* Inventory Health + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Breakdown */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-surface p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Activity className="text-primary" size={20} /> Inventory Health Breakdown</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Score:</span>
              <span className={`font-bold text-lg ${health.healthScore >= 80 ? 'text-emerald-600' : health.healthScore >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{loading ? 'â€”' : `${health.healthScore}%`}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(HEALTH_CONFIG).map(([key, cfg]) => {
              const count = health.summary?.[key] || 0;
              const Icon = cfg.icon;
              return (
                <motion.div key={key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`${cfg.bg} rounded-xl p-4 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all group`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={16} className={cfg.textColor} />
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{cfg.label}</span>
                  </div>
                  <p className={`text-3xl font-bold ${cfg.textColor}`}>{loading ? 'â€”' : count}</p>
                  <p className="text-xs text-slate-400 mt-1">{loading || !stats.totalProducts ? '' : `${Math.round((count / stats.totalProducts) * 100)}% of total`}</p>
                </motion.div>
              );
            })}
          </div>
          {Object.values(health.summary || {}).some(v => v > 0) && (
            <div className="mt-5">
              <div className="h-2.5 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden flex">
                {Object.entries(health.summary || {}).map(([key, val]) => val > 0 && (
                  <div key={key} className={`h-full ${HEALTH_CONFIG[key]?.color} transition-all`} style={{ width: `${Math.round((val / stats.totalProducts) * 100)}%` }} title={`${HEALTH_CONFIG[key]?.label}: ${val}`} />
                ))}
              </div>
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                {Object.entries(HEALTH_CONFIG).map(([key, cfg]) => (health.summary?.[key] || 0) > 0 && (
                  <div key={key} className="flex items-center gap-1.5 text-xs text-slate-500"><span className={`w-2.5 h-2.5 rounded-full ${cfg.color}`} />{cfg.label}: {health.summary[key]}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Active Alerts Panel */}
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Bell className="text-primary" size={20} /> Active Alerts
              {stats.activeAlerts > 0 && <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">{stats.activeAlerts}</span>}
            </h3>
            <Link to="/inventory/notifications" className="text-xs font-bold text-primary hover:text-orange-600">View All</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse" />)}</div>
          ) : alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.slice(0, 5).map(alert => {
                const sevBg = { critical: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20', urgent: 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20', warning: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20', info: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20' };
                const sevTxt = { critical: 'text-red-600 dark:text-red-400', urgent: 'text-rose-600 dark:text-rose-400', warning: 'text-amber-600 dark:text-amber-400', info: 'text-blue-600 dark:text-blue-400' };
                const icon  = alert.severity === 'critical' ? <AlertCircle size={14} /> : <AlertTriangle size={14} />;
                return (
                  <div key={alert.id} className={`rounded-xl p-3 border ${sevBg[alert.severity] || sevBg.warning} transition-colors`}>
                    <div className={`flex items-center gap-1.5 text-xs font-semibold ${sevTxt[alert.severity] || sevTxt.warning} mb-1`}>{icon}{alert.title}</div>
                    <p className="text-xs text-slate-500 line-clamp-2">{alert.message}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle2 size={40} className="mx-auto text-emerald-400 mb-3" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">All Clear</p>
              <p className="text-xs text-slate-400 mt-1">No active stock alerts</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
         <div className="flex items-center justify-between mb-6">
           <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
             <Calendar className="text-primary" size={20} /> Recent Activity
           </h3>
           <Link to="/inventory/movements" className="text-xs font-bold text-primary hover:text-orange-600">View All</Link>
         </div>
         
         <div className="space-y-4">
           {loading ? (
             <div className="animate-pulse space-y-4">
               {[1,2,3].map(i => (
                 <div key={i} className="h-16 bg-slate-100 dark:bg-white/5 rounded-xl w-full"></div>
               ))}
             </div>
           ) : activity.length > 0 ? (
             activity.map(act => (
               <div key={act.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-colors">
                 <div className="p-2 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary rounded-lg">
                   <Package size={20} />
                 </div>
                 <div className="flex-1">
                   <h4 className="text-sm font-medium text-slate-900 dark:text-white">
                     {act.type === 'IN' || act.type === 'RECEIPT' ? 'Stock Received' : act.type === 'OUT' ? 'Stock Dispatched' : 'Stock Adjustment'} - {act.product}
                   </h4>
                   <p className="text-xs text-slate-500 mt-1">{act.quantity} units â€¢ {act.reason} â€¢ By {act.user}</p>
                 </div>
                 <div className="text-xs text-slate-400">{new Date(act.date).toLocaleString()}</div>
               </div>
             ))
           ) : (
             <div className="p-8 text-center text-slate-500 bg-slate-50/50 dark:bg-white/[0.02] rounded-xl border border-dashed border-slate-200 dark:border-white/10">
               <Calendar size={32} className="mx-auto mb-3 text-slate-400" />
               <p className="text-sm font-medium">No recent warehouse activity</p>
             </div>
           )}
         </div>
      </div>

    </div>
  );
};

export default InventoryDashboard;

