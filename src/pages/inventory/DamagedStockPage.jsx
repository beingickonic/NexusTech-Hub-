import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { inventoryService } from '../../services/inventoryService';

const DamagedStockPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { success, data } = await inventoryService.getDamagedStock();
      if (success) {
        const mapped = data.map(r => ({
          id: r.id,
          product: r.inventory?.products?.title || 'Unknown Product',
          sku: r.inventory?.products?.sku || 'N/A',
          qty: r.quantity,
          reason: r.reason,
          status: r.status?.toLowerCase() || 'reported',
          date: r.created_at,
          by: r.profiles?.full_name || 'System'
        }));
        setReports(mapped);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDispose = async (report) => {
    if (!window.confirm(`Are you sure you want to approve disposal of ${report.qty}x ${report.product}?`)) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await inventoryService.disposeDamagedStock(report.id, user?.id);
      await fetchReports();
    } catch (error) {
      console.error('Failed to dispose stock:', error);
      alert('Failed to approve disposal.');
    }
  };

  const filteredReports = reports.filter(r => 
    r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Damaged Stock</h1>
          <p className="text-slate-500 text-sm mt-1">Report and manage damaged or expired inventory</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-red-600/20">
          <AlertTriangle size={18} /> Report Damage
        </button>
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search reports..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>
          <button className="inline-flex items-center gap-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors">
            <Filter size={18} /> Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Report Info</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Qty & Reason</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {loading ? (
                 <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-400">Loading...</td></tr>
              ) : filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <motion.tr key={report.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 dark:text-white">{report.id}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{new Date(report.date).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900 dark:text-white">{report.product}</p>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">{report.sku}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded">{report.qty} items</span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">{report.reason}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       {report.status === 'reported' ? (
                         <div className="flex items-center justify-end gap-2">
                           <button 
                             onClick={() => handleDispose(report)}
                             className="px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-sm font-medium transition-colors"
                           >
                             Approve Disposal
                           </button>
                         </div>
                       ) : (
                         <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400 px-2.5 py-1 rounded-md text-xs font-semibold"><CheckCircle size={14}/> Disposed</span>
                       )}
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-500">No damaged stock reports</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DamagedStockPage;
