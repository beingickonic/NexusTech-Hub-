import React, { useState } from 'react';
import { Download, Plus, Search, Filter, ScanLine, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const ReceivingGoodsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Receiving Goods</h1>
          <p className="text-sm text-nexus-textSecondary">Manage and verify incoming inventory deliveries.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-500 rounded-xl text-sm font-medium transition-colors">
            <ScanLine size={16} /> Scan Delivery
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors">
            <Plus size={16} /> New Receipt
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-nexus-bg border border-slate-200 dark:border-nexus-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-nexus-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50 dark:bg-white/5">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-textSecondary" size={18} />
            <input 
              type="text" 
              placeholder="Search by PO or Supplier..." 
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
                <th className="px-6 py-4 font-medium">PO Number</th>
                <th className="px-6 py-4 font-medium">Supplier</th>
                <th className="px-6 py-4 font-medium">Delivery Date</th>
                <th className="px-6 py-4 font-medium">Received Items</th>
                <th className="px-6 py-4 font-medium">Issues</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">PO-10294</td>
                <td className="px-6 py-4 text-slate-600 dark:text-nexus-textSecondary">TechSupplies Inc.</td>
                <td className="px-6 py-4 text-slate-600 dark:text-nexus-textSecondary">Today, 08:30 AM</td>
                <td className="px-6 py-4 text-slate-600 dark:text-nexus-textSecondary">120 / 120</td>
                <td className="px-6 py-4"><span className="text-nexus-textSecondary">-</span></td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 flex items-center gap-1 w-max">
                    <CheckCircle size={12} /> Accepted
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-orange-500 hover:text-orange-600 font-medium text-xs">View Details</button>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">PO-10295</td>
                <td className="px-6 py-4 text-slate-600 dark:text-nexus-textSecondary">Global Electronics</td>
                <td className="px-6 py-4 text-slate-600 dark:text-nexus-textSecondary">Today, 10:15 AM</td>
                <td className="px-6 py-4 text-slate-600 dark:text-nexus-textSecondary">45 / 50</td>
                <td className="px-6 py-4 text-red-500 font-medium">5 Missing</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 flex items-center gap-1 w-max">
                    <AlertTriangle size={12} /> Pending Verification
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-orange-500 hover:text-orange-600 font-medium text-xs">Verify</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReceivingGoodsPage;
