import React, { useState } from 'react';
import { Search, Filter, ClipboardList, AlertCircle } from 'lucide-react';

const StockControlPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Stock Control</h1>
          <p className="text-sm text-nexus-textSecondary">Monitor inventory accuracy through stock counts and adjustments.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl text-sm font-medium transition-colors">
            <AlertCircle size={16} /> Report Missing
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors">
            <ClipboardList size={16} /> New Stock Count
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-nexus-bg border border-slate-200 dark:border-nexus-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-nexus-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50 dark:bg-white/5">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-textSecondary" size={18} />
            <input 
              type="text" 
              placeholder="Search adjustments..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-nexus-bg border border-slate-200 dark:border-nexus-border rounded-xl text-sm focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-nexus-bg border border-slate-200 dark:border-nexus-border rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 w-full sm:w-auto">
            <Filter size={16} /> Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-white/5 text-nexus-textSecondary dark:text-nexus-textSecondary">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Current Qty</th>
                <th className="px-6 py-4 font-medium">Counted Qty</th>
                <th className="px-6 py-4 font-medium">Difference</th>
                <th className="px-6 py-4 font-medium">Reason</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">iPhone 15 Pro</td>
                <td className="px-6 py-4 text-slate-600 dark:text-nexus-textSecondary">145</td>
                <td className="px-6 py-4 text-slate-600 dark:text-nexus-textSecondary">143</td>
                <td className="px-6 py-4 text-red-500 font-medium">-2</td>
                <td className="px-6 py-4 text-nexus-textSecondary">Missing from shelf</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400">
                    Pending Approval
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">MacBook Air M3</td>
                <td className="px-6 py-4 text-slate-600 dark:text-nexus-textSecondary">8</td>
                <td className="px-6 py-4 text-slate-600 dark:text-nexus-textSecondary">9</td>
                <td className="px-6 py-4 text-green-500 font-medium">+1</td>
                <td className="px-6 py-4 text-nexus-textSecondary">Found in wrong bin</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400">
                    Approved
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockControlPage;
