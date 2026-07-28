import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Warehouse, Package, AlertTriangle, ArrowRightLeft, 
  TrendingUp, TrendingDown, ClipboardCheck, DollarSign,
  ShoppingCart, Box, BarChart2, Calendar, Truck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell, PieChart, Pie } from 'recharts';
import { supabase } from '../../services/supabaseClient';
import { inventoryService } from '../../services/inventoryService';

const InventoryDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStock: 0,
    outOfStock: 0,
    incoming: 0,
    pendingRequests: 0,
    receivedToday: 0,
    adjustmentsToday: 0
  });
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // We do not have live endpoints for these specific charts yet, so we will show empty states
  const monthlyData = [];
  const categoryData = [];

  const fetchData = async () => {
    setLoading(true);
    const [statsRes, activityRes] = await Promise.all([
      inventoryService.getDashboardStats(),
      inventoryService.getDashboardActivity()
    ]);
    if (statsRes.success) setStats(statsRes.stats);
    if (activityRes.success) setActivity(activityRes.activity);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    const sub1 = supabase.channel('inventory_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory_movements' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'purchase_requests' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(sub1);
    };
  }, []);

  const kpis = [
    { label: 'Total Products', value: stats.totalProducts.toLocaleString(), color: 'text-primary', bg: 'bg-primary/10 dark:bg-primary/10', icon: Box },
    { label: 'Total Stock Value', value: `$${stats.totalValue.toLocaleString()}`, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: DollarSign },
    { label: 'Low Stock Items', value: stats.lowStock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', icon: AlertTriangle },
    { label: 'Out of Stock', value: stats.outOfStock, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10', icon: Warehouse },
    
    { label: 'Incoming Deliveries', value: stats.incoming, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', icon: Truck },
    { label: 'Pending POs', value: stats.pendingRequests, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10', icon: ShoppingCart },
    { label: 'Received Today', value: stats.receivedToday, color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-500/10', icon: ClipboardCheck },
    { label: 'Adjustments Today', value: stats.adjustmentsToday, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-500/10', icon: ArrowRightLeft },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Warehouse Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time inventory metrics and stock alerts</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/inventory/goods-received" className="inline-flex items-center gap-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors">
            <ClipboardCheck size={18} /> Receive GRN
          </Link>
          <Link to="/inventory/movements" className="inline-flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-primary/25">
            <ArrowRightLeft size={18} /> Transfer Stock
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-surface p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between mb-6">
             <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
               <TrendingUp className="text-primary" size={20} /> Monthly Stock Movement
             </h3>
             <select className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary/40">
               <option>Last 6 Months</option>
               <option>This Year</option>
             </select>
          </div>
          <div className="h-[300px] w-full flex items-center justify-center bg-slate-50/50 dark:bg-white/[0.02] rounded-xl border border-dashed border-slate-200 dark:border-white/10">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorInward" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOutward" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="inward" name="Stock In" stroke="#10b981" fillOpacity={1} fill="url(#colorInward)" />
                  <Area type="monotone" dataKey="outward" name="Stock Out" stroke="#f59e0b" fillOpacity={1} fill="url(#colorOutward)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-400">
                <BarChart2 size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">No movement data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <BarChart2 className="text-primary" size={20} /> Category Distribution
          </h3>
          <div className="h-[250px] w-full flex items-center justify-center bg-slate-50/50 dark:bg-white/[0.02] rounded-xl border border-dashed border-slate-200 dark:border-white/10">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-400">
                <Box size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">No category data</p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {categoryData.map(cat => (
              <div key={cat.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                <span className="text-xs text-slate-600 dark:text-slate-400">{cat.name}</span>
              </div>
            ))}
          </div>
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
                   <p className="text-xs text-slate-500 mt-1">{act.quantity} units • {act.reason} • By {act.user}</p>
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
