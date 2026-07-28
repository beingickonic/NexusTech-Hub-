import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Warehouse, Package, AlertTriangle, ArrowRightLeft, Plus } from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import { Link } from 'react-router-dom';

const InventoryDashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    inventoryService.getInventoryStats().then(res => {
      if (res.success) setStats(res.stats);
      setLoading(false);
    });
  }, []);

  const kpis = [
    { label: 'Total Items', value: stats.total_items || 0, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/10', icon: Package },
    { label: 'Low Stock Alerts', value: stats.low_stock || 0, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10', icon: AlertTriangle },
    { label: 'Out of Stock', value: stats.out_of_stock || 0, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-white/5', icon: Warehouse },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Warehouse Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time inventory metrics and stock alerts</p>
        </div>
        <Link to="/inventory/stock" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-violet-600/20">
          <Plus size={18} /> Receive Stock
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-dark-surface p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex items-center gap-4"
          >
            <div className={`p-4 rounded-xl ${kpi.bg}`}>
              <kpi.icon size={24} className={kpi.color} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{kpi.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {loading ? '-' : kpi.value}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Movements Widget */}
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
           <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                <ArrowRightLeft className="text-violet-500" size={20} /> Recent Movements
             </div>
             <Link to="/inventory/stock" className="text-xs font-bold text-violet-600 hover:text-violet-700">View All</Link>
           </div>
           
           <div className="space-y-4">
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-12 bg-slate-100 dark:bg-white/5 rounded-xl"></div>
                  <div className="h-12 bg-slate-100 dark:bg-white/5 rounded-xl"></div>
                  <div className="h-12 bg-slate-100 dark:bg-white/5 rounded-xl"></div>
                </div>
              ) : (
                <div className="text-center p-6 text-slate-500 text-sm bg-slate-50 dark:bg-white/5 rounded-xl">
                  Movement history loaded in full stock view.
                </div>
              )}
           </div>
        </div>

        {/* Shortcuts */}
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
           <h3 className="font-bold text-slate-900 dark:text-white mb-4">Inventory Tasks</h3>
           <div className="grid grid-cols-2 gap-3">
             <Link to="/inventory/stock" className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl text-center hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
               <Package className="mx-auto text-violet-500 mb-2" />
               <p className="text-sm font-medium text-slate-900 dark:text-white">Stock Levels</p>
             </Link>
             <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl text-center opacity-50 cursor-not-allowed">
               <AlertTriangle className="mx-auto text-red-500 mb-2" />
               <p className="text-sm font-medium text-slate-900 dark:text-white">Replenishment</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
