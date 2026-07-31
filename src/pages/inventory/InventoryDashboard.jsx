import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Warehouse, Package, AlertTriangle, ArrowRightLeft, 
  TrendingUp, TrendingDown, ClipboardCheck, DollarSign,
  ShoppingCart, Box, BarChart2, Calendar, Truck, Database, Activity,
  CheckCircle2, AlertCircle, Bell, RefreshCw, ZapOff, Snail, Archive, Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { supabase } from '../../services/supabaseClient';
import { inventoryService } from '../../services/inventoryService';

const HEALTH_CONFIG = {
  healthy:     { label: 'Healthy',     color: 'bg-nexus-success', textColor: 'text-nexus-success', bg: 'bg-nexus-success/10 dark:bg-nexus-success/10', icon: CheckCircle2 },
  low_stock:   { label: 'Low Stock',   color: 'bg-nexus-gold',   textColor: 'text-nexus-gold',   bg: 'bg-nexus-gold/10 dark:bg-nexus-gold/10',   icon: TrendingDown },
  out_of_stock:{ label: 'Out of Stock',color: 'bg-nexus-error',     textColor: 'text-nexus-error',     bg: 'bg-nexus-error/5 dark:bg-nexus-error/10',       icon: AlertTriangle },
  overstocked: { label: 'Overstock',   color: 'bg-info/100',  textColor: 'text-info',  bg: 'bg-info/10 dark:bg-info/100/10', icon: TrendingUp },
  slow_moving: { label: 'Slow Moving', color: 'bg-nexus-info',    textColor: 'text-nexus-info',    bg: 'bg-nexus-info/10 dark:bg-nexus-info/10',     icon: Snail },
  dead_stock:  { label: 'Dead Stock',  color: 'bg-nexus-muted',   textColor: 'text-nexus-muted',   bg: 'bg-nexus-surface dark:bg-nexus-hover',        icon: Archive },
};

const InventoryDashboard = () => {
  const [stats, setStats]       = useState({ totalProducts: 0, totalInventory: 0, availableStock: 0, reservedStock: 0, inTransitStock: 0, inventoryValue: 0, lowStock: 0, outOfStock: 0, overstock: 0, healthyStock: 0, slowMoving: 0, deadStock: 0, incoming: 0, pendingRequests: 0, receivedToday: 0, adjustmentsToday: 0, warehouseCapacity: 0, inventoryHealthScore: 0, activeAlerts: 0 });
  const [health, setHealth]     = useState({ summary: {}, healthScore: 0 });
  const [alerts, setAlerts]     = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [pendingApprovals, setPendingApprovals] = useState(0);

  const monthlyData = [];

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [statsRes, activityRes, healthRes, alertsRes] = await Promise.all([
      inventoryService.getDashboardStats(),
      inventoryService.getDashboardActivity(),
      inventoryService.getInventoryHealth(),
      inventoryService.getStockAlerts({ status: 'active', limit: 5 }),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'Finance Approved')
    ]);
    if (statsRes.success)  setStats(statsRes.stats);
    if (activityRes.success) setActivity(activityRes.activity);
    if (healthRes.success)  setHealth({ summary: healthRes.summary, healthScore: healthRes.healthScore });
    if (alertsRes.success)  setAlerts(alertsRes.data);
    if (!alertsRes[4]?.error) setPendingApprovals(alertsRes[4]?.count || 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const sub1 = supabase.channel('inv_dash_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' },           fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory_movements' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'purchase_requests' },  fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stock_alerts' },        fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' },              fetchData)
      .subscribe();
    return () => supabase.removeChannel(sub1);
  }, [fetchData]);

  const healthPieData = Object.entries(health.summary || {}).map(([key, val]) => ({
    name: HEALTH_CONFIG[key]?.label || key, value: val, fill: HEALTH_CONFIG[key]?.color.replace('bg-', '#').replace('-500','') || '#64748b'
  })).filter(d => d.value > 0);

  const HEALTH_COLORS = { healthy: '#10b981', low_stock: '#f59e0b', out_of_stock: '#ef4444', overstocked: '#a855f7', slow_moving: '#3b82f6', dead_stock: '#64748b' };

  const kpis = [
    { label: 'Total Products', value: stats.totalProducts.toLocaleString(), color: 'text-primary', bg: 'bg-primary/10 dark:bg-primary/10', icon: Box },
    { label: 'Orders Awaiting Approval', value: pendingApprovals, color: 'text-nexus-gold', bg: 'bg-nexus-gold/10 dark:bg-nexus-gold/10', icon: Clock, link: '/inventory/order-approvals' },
    { label: 'Total Inventory', value: stats.totalInventory?.toLocaleString() || 0, color: 'text-nexus-info', bg: 'bg-nexus-info/10 dark:bg-nexus-info/10', icon: Package },
    { label: 'Available Stock', value: stats.availableStock?.toLocaleString() || 0, color: 'text-nexus-success', bg: 'bg-nexus-success/10 dark:bg-nexus-success/10', icon: ClipboardCheck },
    { label: 'Reserved Stock', value: stats.reservedStock?.toLocaleString() || 0, color: 'text-nexus-gold', bg: 'bg-nexus-gold/10 dark:bg-nexus-gold/10', icon: AlertTriangle },
    { label: 'In Transit', value: stats.inTransitStock?.toLocaleString() || 0, color: 'text-info', bg: 'bg-info/10 dark:bg-info/100/10', icon: Truck },
    { label: 'Total Stock Value', value: `$${stats.inventoryValue?.toLocaleString() || 0}`, color: 'text-nexus-success', bg: 'bg-nexus-success/10 dark:bg-nexus-success/10', icon: DollarSign },
    { label: 'Low Stock Items', value: stats.lowStock || 0, color: 'text-nexus-gold', bg: 'bg-nexus-gold/10 dark:bg-nexus-gold/10', icon: TrendingDown },
    { label: 'Out of Stock', value: stats.outOfStock || 0, color: 'text-nexus-error', bg: 'bg-nexus-error/5 dark:bg-nexus-error/10', icon: AlertTriangle },
    { label: 'Pending POs', value: stats.pendingRequests || 0, color: 'text-info', bg: 'bg-info/10 dark:bg-info/100/10', icon: ShoppingCart },
    { label: 'Received Today', value: stats.receivedToday || 0, color: 'text-success', bg: 'bg-success/10 dark:bg-success/100/10', icon: Warehouse },
    { label: 'Warehouse Capacity', value: `${stats.warehouseCapacity || 0}%`, color: 'text-nexus-textSecondary', bg: 'bg-nexus-surface dark:bg-nexus-muted/10', icon: Database },
    { label: 'Inventory Health', value: `${stats.inventoryHealthScore || 0}%`, color: 'text-nexus-success', bg: 'bg-nexus-success/10 dark:bg-nexus-success/10', icon: Activity },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-nexus-heading">Warehouse Overview</h1>
          <p className="text-nexus-textSecondary text-sm mt-1">Real-time inventory metrics and stock health</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="p-2.5 rounded-xl bg-nexus-surface dark:bg-nexus-hover hover:bg-nexus-surface dark:hover:bg-nexus-hover border border-nexus-border transition-colors">
            <RefreshCw size={16} className="text-nexus-muted" />
          </button>
          <Link to="/inventory/goods-received" className="inline-flex items-center gap-2 bg-nexus-surface dark:bg-nexus-hover hover:bg-nexus-surface dark:hover:bg-nexus-hover text-nexus-heading px-4 py-2.5 rounded-xl font-medium text-sm transition-colors">
            <ClipboardCheck size={18} /> Receive GRN
          </Link>
          <Link to="/inventory/transfers" className="inline-flex items-center gap-2 bg-primary hover:bg-nexus-primary-hover text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-primary/25">
            <ArrowRightLeft size={18} /> Transfers
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const card = (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-nexus-card p-5 rounded-2xl border border-nexus-border shadow-sm flex items-center gap-4 group hover:border-primary/40 dark:hover:border-primary/30 transition-colors"
            >
              <div className={`p-4 rounded-xl ${kpi.bg} transition-transform group-hover:scale-110`}>
                <kpi.icon size={24} className={kpi.color} />
              </div>
              <div>
                <p className="text-xs font-medium text-nexus-muted uppercase tracking-wider">{kpi.label}</p>
                <h3 className="text-2xl font-bold text-nexus-heading mt-1">
                  {loading ? <div className="h-8 w-16 bg-nexus-surface dark:bg-nexus-hover rounded animate-pulse" /> : kpi.value}
                </h3>
              </div>
            </motion.div>
          );
          return kpi.link ? <Link key={idx} to={kpi.link}>{card}</Link> : card;
        })}
      </div>

      {/* Procurement Overview */}
      <div className="mb-6 bg-nexus-card p-6 rounded-2xl border border-nexus-border shadow-sm">
        <h3 className="font-bold text-nexus-heading flex items-center gap-2 mb-4"><ShoppingCart className="text-primary" size={20} /> Procurement Overview</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-nexus-surface dark:bg-nexus-hover p-4 rounded-xl border border-nexus-border flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-nexus-textSecondary uppercase tracking-wide">Total Suppliers</p>
              <p className="text-2xl font-bold text-nexus-heading mt-1">{loading ? '-' : stats.totalSuppliers || 0}</p>
            </div>
            <div className="p-3 bg-nexus-info/10 text-nexus-info rounded-lg"><Box size={20} /></div>
          </div>
          <div className="bg-nexus-surface dark:bg-nexus-hover p-4 rounded-xl border border-nexus-border flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-nexus-textSecondary uppercase tracking-wide">Open POs</p>
              <p className="text-2xl font-bold text-nexus-heading mt-1">{loading ? '-' : stats.openPOs || 0}</p>
            </div>
            <div className="p-3 bg-nexus-primary/10 text-nexus-primary rounded-lg"><Clock size={20} /></div>
          </div>
          <div className="bg-nexus-surface dark:bg-nexus-hover p-4 rounded-xl border border-nexus-border flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-nexus-textSecondary uppercase tracking-wide">Approved POs</p>
              <p className="text-2xl font-bold text-nexus-heading mt-1">{loading ? '-' : stats.approvedPOs || 0}</p>
            </div>
            <div className="p-3 bg-nexus-success/10 text-nexus-success rounded-lg"><CheckCircle2 size={20} /></div>
          </div>
          <div className="bg-nexus-surface dark:bg-nexus-hover p-4 rounded-xl border border-nexus-border flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-nexus-textSecondary uppercase tracking-wide">Received POs</p>
              <p className="text-2xl font-bold text-nexus-heading mt-1">{loading ? '-' : stats.receivedPOs || 0}</p>
            </div>
            <div className="p-3 bg-info/100/10 text-info rounded-lg"><Warehouse size={20} /></div>
          </div>
        </div>
      </div>
      {/* Inventory Health + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Breakdown */}
        <div className="lg:col-span-2 bg-nexus-card p-6 rounded-2xl border border-nexus-border shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-nexus-heading flex items-center gap-2"><Activity className="text-primary" size={20} /> Inventory Health Breakdown</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-nexus-textSecondary">Score:</span>
              <span className={`font-bold text-lg ${health.healthScore >= 80 ? 'text-nexus-success' : health.healthScore >= 50 ? 'text-nexus-gold' : 'text-nexus-error'}`}>{loading ? 'â€”' : `${health.healthScore}%`}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(HEALTH_CONFIG).map(([key, cfg]) => {
              const count = health.summary?.[key] || 0;
              const Icon = cfg.icon;
              return (
                <motion.div key={key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`${cfg.bg} rounded-xl p-4 border border-transparent hover:border-nexus-border dark:hover:border-nexus-border transition-all group`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={16} className={cfg.textColor} />
                    <span className="text-xs font-semibold text-nexus-textSecondary uppercase tracking-wide">{cfg.label}</span>
                  </div>
                  <p className={`text-3xl font-bold ${cfg.textColor}`}>{loading ? 'â€”' : count}</p>
                  <p className="text-xs text-nexus-textSecondary mt-1">{loading || !stats.totalProducts ? '' : `${Math.round((count / stats.totalProducts) * 100)}% of total`}</p>
                </motion.div>
              );
            })}
          </div>
          {Object.values(health.summary || {}).some(v => v > 0) && (
            <div className="mt-5">
              <div className="h-2.5 rounded-full bg-nexus-surface dark:bg-nexus-hover overflow-hidden flex">
                {Object.entries(health.summary || {}).map(([key, val]) => val > 0 && (
                  <div key={key} className={`h-full ${HEALTH_CONFIG[key]?.color} transition-all`} style={{ width: `${Math.round((val / stats.totalProducts) * 100)}%` }} title={`${HEALTH_CONFIG[key]?.label}: ${val}`} />
                ))}
              </div>
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                {Object.entries(HEALTH_CONFIG).map(([key, cfg]) => (health.summary?.[key] || 0) > 0 && (
                  <div key={key} className="flex items-center gap-1.5 text-xs text-nexus-textSecondary"><span className={`w-2.5 h-2.5 rounded-full ${cfg.color}`} />{cfg.label}: {health.summary[key]}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Active Alerts Panel */}
        <div className="bg-nexus-card p-6 rounded-2xl border border-nexus-border shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-nexus-heading flex items-center gap-2"><Bell className="text-primary" size={20} /> Active Alerts
              {stats.activeAlerts > 0 && <span className="ml-1 px-1.5 py-0.5 bg-nexus-error text-white text-xs rounded-full font-bold">{stats.activeAlerts}</span>}
            </h3>
            <Link to="/inventory/notifications" className="text-xs font-bold text-primary hover:text-nexus-primary">View All</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-nexus-surface dark:bg-nexus-hover rounded-xl animate-pulse" />)}</div>
          ) : alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.slice(0, 5).map(alert => {
                const sevBg = { critical: 'bg-nexus-error/5 dark:bg-nexus-error/10 border-nexus-error/20 dark:border-nexus-error/20', urgent: 'bg-nexus-error/5 dark:bg-nexus-error/10 border-error/20 dark:border-error/20', warning: 'bg-nexus-gold/10 dark:bg-nexus-gold/10 border-nexus-gold/20', info: 'bg-nexus-info/10 dark:bg-nexus-info/10 border-nexus-info/20' };
                const sevTxt = { critical: 'text-nexus-error', urgent: 'text-nexus-error', warning: 'text-nexus-gold', info: 'text-nexus-info' };
                const icon  = alert.severity === 'critical' ? <AlertCircle size={14} /> : <AlertTriangle size={14} />;
                return (
                  <div key={alert.id} className={`rounded-xl p-3 border ${sevBg[alert.severity] || sevBg.warning} transition-colors`}>
                    <div className={`flex items-center gap-1.5 text-xs font-semibold ${sevTxt[alert.severity] || sevTxt.warning} mb-1`}>{icon}{alert.title}</div>
                    <p className="text-xs text-nexus-textSecondary line-clamp-2">{alert.message}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle2 size={40} className="mx-auto text-nexus-success mb-3" />
              <p className="text-sm font-semibold text-nexus-muted">All Clear</p>
              <p className="text-xs text-nexus-textSecondary mt-1">No active stock alerts</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-nexus-card p-6 rounded-2xl border border-nexus-border shadow-sm">
         <div className="flex items-center justify-between mb-6">
           <h3 className="font-bold text-nexus-heading flex items-center gap-2">
             <Calendar className="text-primary" size={20} /> Recent Activity
           </h3>
           <Link to="/inventory/movements" className="text-xs font-bold text-primary hover:text-nexus-primary">View All</Link>
         </div>
         
         <div className="space-y-4">
           {loading ? (
             <div className="animate-pulse space-y-4">
               {[1,2,3].map(i => (
                 <div key={i} className="h-16 bg-nexus-surface dark:bg-nexus-hover rounded-xl w-full"></div>
               ))}
             </div>
           ) : activity.length > 0 ? (
             activity.map(act => (
               <div key={act.id} className="flex items-center gap-4 p-4 rounded-xl bg-nexus-surface dark:bg-nexus-hover border border-transparent hover:border-nexus-border dark:hover:border-nexus-border transition-colors">
                 <div className="p-2 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary rounded-lg">
                   <Package size={20} />
                 </div>
                 <div className="flex-1">
                   <h4 className="text-sm font-medium text-nexus-heading">
                     {act.type === 'IN' || act.type === 'RECEIPT' ? 'Stock Received' : act.type === 'OUT' ? 'Stock Dispatched' : 'Stock Adjustment'} - {act.product}
                   </h4>
                   <p className="text-xs text-nexus-textSecondary mt-1">{act.quantity} units â€¢ {act.reason} â€¢ By {act.user}</p>
                 </div>
                 <div className="text-xs text-nexus-textSecondary">{new Date(act.date).toLocaleString()}</div>
               </div>
             ))
           ) : (
             <div className="p-8 text-center text-nexus-textSecondary bg-nexus-surface/50 dark:bg-white/[0.02] rounded-xl border border-dashed border-nexus-border">
               <Calendar size={32} className="mx-auto mb-3 text-nexus-textSecondary" />
               <p className="text-sm font-medium">No recent warehouse activity</p>
             </div>
           )}
         </div>
      </div>

    </div>
  );
};

export default InventoryDashboard;

