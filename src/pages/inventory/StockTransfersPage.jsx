import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ArrowRightLeft, CheckCircle2, Clock, XCircle, Truck } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

const StockTransfersPage = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setTransfers([
        { id: 'TRN-23-085', product: 'Dell XPS 15', qty: 20, from: 'Main HQ Warehouse', to: 'Mombasa Depot', status: 'completed', date: new Date().toISOString(), requestedBy: 'Inventory Officer' },
        { id: 'TRN-23-084', product: 'Herman Miller Aeron', qty: 5, from: 'Main HQ Warehouse', to: 'Kisumu Hub', status: 'in_transit', date: new Date(Date.now() - 3600000).toISOString(), requestedBy: 'Jane Smith' },
        { id: 'TRN-23-083', product: 'Logitech MX Master 3S', qty: 50, from: 'Mombasa Depot', to: 'Main HQ Warehouse', status: 'pending', date: new Date(Date.now() - 86400000).toISOString(), requestedBy: 'John Doe' },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 px-2.5 py-1 rounded-md text-xs font-semibold"><CheckCircle2 size={14}/> Completed</span>;
      case 'in_transit': return <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 px-2.5 py-1 rounded-md text-xs font-semibold"><Truck size={14}/> In Transit</span>;
      case 'pending': return <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 px-2.5 py-1 rounded-md text-xs font-semibold"><Clock size={14}/> Pending</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Stock Transfers</h1>
          <p className="text-slate-500 text-sm mt-1">Manage inventory transfers between warehouses</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-violet-600/20">
          <ArrowRightLeft size={18} /> New Transfer
        </button>
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input type="text" placeholder="Search transfers..." className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white placeholder-slate-400" />
          </div>
          <button className="inline-flex items-center gap-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors">
            <Filter size={18} /> Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Transfer ID & Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Product & Qty</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Route</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-400">Loading transfers...</td></tr>
              ) : transfers.length > 0 ? (
                transfers.map((t) => (
                  <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 dark:text-white">{t.id}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{new Date(t.date).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900 dark:text-white">{t.product}</p>
                      <p className="text-sm font-bold text-violet-600 dark:text-violet-400 mt-0.5">{t.qty} units</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-slate-600 dark:text-slate-400">{t.from}</span>
                        <ArrowRightLeft size={14} className="text-slate-400" />
                        <span className="font-semibold text-slate-900 dark:text-white">{t.to}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {getStatusBadge(t.status)}
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-500">No transfers found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockTransfersPage;
