import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Activity, FileText, Plus } from 'lucide-react';
import { financeService } from '../../services/financeService';
import { Link } from 'react-router-dom';

const FinanceDashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    financeService.getFinanceStats().then(res => {
      if (res.success) setStats(res.stats);
      setLoading(false);
    });
  }, []);

  const kpis = [
    { label: 'Total Revenue', value: `$${(stats.revenue || 0).toLocaleString()}`, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', icon: DollarSign },
    { label: 'Total Expenses', value: `$${(stats.expenses || 0).toLocaleString()}`, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10', icon: TrendingUp },
    { label: 'Net Profit', value: `$${(stats.net_profit || 0).toLocaleString()}`, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: Activity },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Financial Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Live metrics from all company departments</p>
        </div>
        <Link to="/finance/transactions" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-blue-600/20">
          <Plus size={18} /> Record Expense
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
        {/* Placeholder for P&L Chart */}
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
           <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                <Activity className="text-blue-500" size={20} /> Revenue vs Expenses (30d)
             </div>
           </div>
           <div className="aspect-[2/1] bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400 text-sm">
             [Chart loaded in main Finance page]
           </div>
        </div>

        {/* Shortcuts */}
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
           <h3 className="font-bold text-slate-900 dark:text-white mb-4">Financial Actions</h3>
           <div className="grid grid-cols-2 gap-3">
             <Link to="/finance/transactions" className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl text-center hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
               <FileText className="mx-auto text-blue-500 mb-2" />
               <p className="text-sm font-medium text-slate-900 dark:text-white">Transactions</p>
             </Link>
             <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl text-center opacity-50 cursor-not-allowed">
               <DollarSign className="mx-auto text-emerald-500 mb-2" />
               <p className="text-sm font-medium text-slate-900 dark:text-white">Payroll</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
