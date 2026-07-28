import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, FileText, Download, BarChart2, Filter } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

const InventoryReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setReports([
        { id: 1, name: 'Q3 Inventory Valuation', type: 'Valuation', date: new Date().toISOString(), size: '2.4 MB' },
        { id: 2, name: 'Monthly Stock Movement - August', type: 'Movement', date: new Date(Date.now() - 86400000).toISOString(), size: '1.1 MB' },
        { id: 3, name: 'Low Stock Alerts Summary', type: 'Alerts', date: new Date(Date.now() - 172800000).toISOString(), size: '845 KB' },
        { id: 4, name: 'Damaged Stock Disposal Q2', type: 'Disposal', date: new Date(Date.now() - 2592000000).toISOString(), size: '3.2 MB' },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Inventory Reports</h1>
          <p className="text-slate-500 text-sm mt-1">Generate and download warehouse analytics</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-violet-600/20">
          <BarChart2 size={18} /> Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
         <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:border-violet-300 transition-colors cursor-pointer group">
           <FileText className="text-violet-500 mb-2 group-hover:scale-110 transition-transform" />
           <h3 className="font-bold text-slate-900 dark:text-white">Valuation Report</h3>
           <p className="text-xs text-slate-500 mt-1">Current value of all stock in warehouses</p>
         </div>
         <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:border-blue-300 transition-colors cursor-pointer group">
           <FileText className="text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
           <h3 className="font-bold text-slate-900 dark:text-white">Movement Report</h3>
           <p className="text-xs text-slate-500 mt-1">Log of all inward and outward goods</p>
         </div>
         <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:border-red-300 transition-colors cursor-pointer group">
           <FileText className="text-red-500 mb-2 group-hover:scale-110 transition-transform" />
           <h3 className="font-bold text-slate-900 dark:text-white">Low Stock Report</h3>
           <p className="text-xs text-slate-500 mt-1">Items below their designated reorder level</p>
         </div>
         <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:border-emerald-300 transition-colors cursor-pointer group">
           <FileText className="text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
           <h3 className="font-bold text-slate-900 dark:text-white">Goods Received</h3>
           <p className="text-xs text-slate-500 mt-1">Summary of all accepted supplier GRNs</p>
         </div>
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
          <h3 className="font-bold text-slate-900 dark:text-white">Saved Reports</h3>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Search..." className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white placeholder-slate-400" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Report Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Generated On</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-400">Loading reports...</td></tr>
              ) : reports.map((r) => (
                <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <FileText className="text-violet-500" size={20} />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{r.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{r.size} • PDF</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">{r.type}</span></td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 dark:bg-violet-500/10 dark:hover:bg-violet-500/20 px-3 py-1.5 rounded-lg transition-colors">
                      <Download size={16} /> Download
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryReportsPage;
