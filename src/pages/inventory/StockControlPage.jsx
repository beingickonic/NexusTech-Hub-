import React, { useState } from 'react';
import { Search, Filter, ClipboardList, AlertCircle } from 'lucide-react';

const StockControlPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-nexus-heading">Stock Control</h1>
          <p className="text-sm text-nexus-textSecondary">Monitor inventory accuracy through stock counts and adjustments.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-nexus-surface dark:bg-nexus-hover hover:bg-nexus-surface dark:hover:bg-nexus-hover rounded-xl text-sm font-medium transition-colors">
            <AlertCircle size={16} /> Report Missing
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-nexus-primary hover:bg-nexus-primary-hover text-white rounded-xl text-sm font-medium transition-colors">
            <ClipboardList size={16} /> New Stock Count
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-nexus-bg border border-nexus-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-nexus-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-nexus-surface dark:bg-nexus-hover">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-textSecondary" size={18} />
            <input 
              type="text" 
              placeholder="Search adjustments..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-nexus-bg border border-nexus-border rounded-xl text-sm focus:outline-none focus:border-nexus-primary transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-nexus-bg border border-nexus-border rounded-xl text-sm font-medium hover:bg-nexus-surface dark:hover:bg-nexus-hover w-full sm:w-auto">
            <Filter size={16} /> Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-nexus-surface dark:bg-nexus-hover text-nexus-muted">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Current Qty</th>
                <th className="px-6 py-4 font-medium">Counted Qty</th>
                <th className="px-6 py-4 font-medium">Difference</th>
                <th className="px-6 py-4 font-medium">Reason</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nexus-border dark:divide-nexus-card">
              <tr className="hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors">
                <td className="px-6 py-4 font-medium text-nexus-heading">iPhone 15 Pro</td>
                <td className="px-6 py-4 text-nexus-muted">145</td>
                <td className="px-6 py-4 text-nexus-muted">143</td>
                <td className="px-6 py-4 text-nexus-error font-medium">-2</td>
                <td className="px-6 py-4 text-nexus-textSecondary">Missing from shelf</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-nexus-primary/15 text-nexus-primary dark:bg-nexus-primary/20 dark:text-nexus-primary">
                    Pending Approval
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors">
                <td className="px-6 py-4 font-medium text-nexus-heading">MacBook Air M3</td>
                <td className="px-6 py-4 text-nexus-muted">8</td>
                <td className="px-6 py-4 text-nexus-muted">9</td>
                <td className="px-6 py-4 text-nexus-success font-medium">+1</td>
                <td className="px-6 py-4 text-nexus-textSecondary">Found in wrong bin</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-nexus-success/10 text-nexus-success dark:bg-nexus-success/20 dark:text-nexus-success">
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
