import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Activity, CreditCard, Wallet, BookOpen, Clock } from 'lucide-react';
import { financeErpService } from '../../services/finance';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const FinanceDashboard = () => {
  const [stats, setStats] = useState({
    revenueToday: 0,
    revenueThisMonth: 0,
    cashBalance: 0,
    arBalance: 0,
    apBalance: 0,
    grossProfit: 0,
    outstandingInvoices: 0,
    pendingJournals: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    const { data, error } = await financeErpService.dashboard.getDashboardKpis();
    if (error) {
      toast.error('Failed to load dashboard metrics');
    } else if (data) {
      setStats(data);
    }
    setLoading(false);
  };

  const kpis = [
    { label: 'Revenue This Month', value: `${stats.revenueThisMonth.toLocaleString()}`, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', icon: TrendingUp },
    { label: 'Cash Balance', value: `${stats.cashBalance.toLocaleString()}`, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: DollarSign },
    { label: 'Accounts Receivable', value: `${stats.arBalance.toLocaleString()}`, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10', icon: CreditCard },
    { label: 'Accounts Payable', value: `${stats.apBalance.toLocaleString()}`, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10', icon: Wallet },
    { label: 'Gross Profit', value: `${stats.grossProfit.toLocaleString()}`, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-500/10', icon: Activity },
    { label: 'Revenue Today', value: `${stats.revenueToday.toLocaleString()}`, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-500/10', icon: TrendingUp },
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">Financial Overview</h1>
          <p className="text-slate-500 dark:text-slate-400">Live metrics from all company departments</p>
        </div>
        <Link to="/finance/general-ledger" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-blue-600/20">
          <BookOpen size={18} /> New Journal Entry
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4"
          >
            <div className={`p-4 rounded-xl ${kpi.bg}`}>
              <kpi.icon size={24} className={kpi.color} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{kpi.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {loading ? '...' : kpi.value} <span className="text-sm text-slate-400 font-normal">KES</span>
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Required Widget */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
           <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
             <Clock className="text-orange-500" /> Action Required
           </h3>
           <div className="space-y-4">
              <Link to="/finance/accounts-receivable" className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl hover:ring-2 ring-blue-500 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-lg"><CreditCard size={18}/></div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Outstanding AR</div>
                    <div className="text-xs text-slate-500">Invoices needing payment</div>
                  </div>
                </div>
                <div className="font-bold text-lg text-slate-900 dark:text-white">{loading ? '-' : stats.outstandingInvoices}</div>
              </Link>

              <Link to="/finance/general-ledger" className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl hover:ring-2 ring-blue-500 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 rounded-lg"><BookOpen size={18}/></div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Pending Journals</div>
                    <div className="text-xs text-slate-500">Awaiting your approval</div>
                  </div>
                </div>
                <div className="font-bold text-lg text-slate-900 dark:text-white">{loading ? '-' : stats.pendingJournals}</div>
              </Link>
           </div>
        </div>

        {/* Shortcuts */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
           <h3 className="font-bold text-slate-900 dark:text-white mb-6">Financial Modules</h3>
           <div className="grid grid-cols-2 gap-4">
             <Link to="/finance/chart-of-accounts" className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl text-center hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 border border-transparent transition-colors group">
               <div className="p-3 bg-white dark:bg-slate-800 rounded-lg inline-block shadow-sm mb-3 group-hover:scale-110 transition-transform">
                 <Activity className="text-blue-500" size={24} />
               </div>
               <p className="font-semibold text-slate-900 dark:text-white">Chart of Accounts</p>
             </Link>
             <Link to="/finance/accounts-payable" className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl text-center hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 border border-transparent transition-colors group">
               <div className="p-3 bg-white dark:bg-slate-800 rounded-lg inline-block shadow-sm mb-3 group-hover:scale-110 transition-transform">
                 <Wallet className="text-indigo-500" size={24} />
               </div>
               <p className="font-semibold text-slate-900 dark:text-white">Accounts Payable</p>
             </Link>
           </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
