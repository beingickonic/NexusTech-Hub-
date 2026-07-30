import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, FileText, Download, BarChart2 } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

const InventoryReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch from inventoryService.getReports()
    // For now, no reports generated yet.
    setReports([]);
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Inventory Reports</h1>
          <p className="text-nexus-textSecondary text-sm mt-1">Generate and download warehouse analytics</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-primary/25">
          <BarChart2 size={18} /> Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
         <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-nexus-border hover:border-primary/40 transition-colors cursor-pointer group">
           <FileText className="text-primary mb-2 group-hover:scale-110 transition-transform" />
           <h3 className="font-bold text-slate-900 dark:text-white">Valuation Report</h3>
           <p className="text-xs text-nexus-textSecondary mt-1">Current value of all stock in warehouses</p>
         </div>
         <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-nexus-border hover:border-blue-300 transition-colors cursor-pointer group">
           <FileText className="text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
           <h3 className="font-bold text-slate-900 dark:text-white">Movement Report</h3>
           <p className="text-xs text-nexus-textSecondary mt-1">Log of all inward and outward goods</p>
         </div>
         <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-nexus-border hover:border-red-300 transition-colors cursor-pointer group">
           <FileText className="text-red-500 mb-2 group-hover:scale-110 transition-transform" />
           <h3 className="font-bold text-slate-900 dark:text-white">Low Stock Report</h3>
           <p className="text-xs text-nexus-textSecondary mt-1">Items below their designated reorder level</p>
         </div>
         <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-nexus-border hover:border-emerald-300 transition-colors cursor-pointer group">
           <FileText className="text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
           <h3 className="font-bold text-slate-900 dark:text-white">Goods Received</h3>
           <p className="text-xs text-nexus-textSecondary mt-1">Summary of all accepted supplier GRNs</p>
         </div>
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-nexus-border shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-nexus-border flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
          <h3 className="font-bold text-slate-900 dark:text-white">Saved Reports</h3>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-textSecondary" size={16} />
            <input type="text" placeholder="Search..." className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-nexus-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-slate-900 dark:text-white placeholder-slate-400" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-nexus-border">
                <th className="px-6 py-4 text-xs font-semibold text-nexus-textSecondary dark:text-nexus-textSecondary uppercase tracking-wider">Report Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-nexus-textSecondary dark:text-nexus-textSecondary uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-nexus-textSecondary dark:text-nexus-textSecondary uppercase tracking-wider">Generated On</th>
                <th className="px-6 py-4 text-xs font-semibold text-nexus-textSecondary dark:text-nexus-textSecondary uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-nexus-textSecondary">Loading reports...</td></tr>
              ) : reports.length > 0 ? (
                reports.map((r) => (
                  <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="text-primary" size={20} />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{r.name}</p>
                          <p className="text-xs text-nexus-textSecondary mt-0.5">{r.size} • PDF</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="text-sm font-medium text-slate-700 dark:text-nexus-textSecondary bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">{r.type}</span></td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-nexus-textSecondary">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-orange-600 bg-primary/10 hover:bg-primary/20 dark:bg-primary/10 dark:hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors">
                        <Download size={16} /> Download
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <FileText size={32} className="text-nexus-textSecondary" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Reports Found</h3>
                      <p className="text-nexus-textSecondary text-sm max-w-sm mx-auto">No inventory reports have been generated yet. Use the action cards above to generate a new report.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryReportsPage;
