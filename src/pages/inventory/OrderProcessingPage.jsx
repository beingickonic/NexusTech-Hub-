import React, { useState } from 'react';
import { Search, Filter, Box, PackageCheck, Printer } from 'lucide-react';

const OrderProcessingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Order Processing</h1>
          <p className="text-sm text-nexus-textSecondary">Pick, pack, and prepare customer orders for dispatch.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-nexus-bg border border-slate-200 dark:border-nexus-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-nexus-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50 dark:bg-white/5">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-textSecondary" size={18} />
            <input 
              type="text" 
              placeholder="Search by Order ID or Customer..." 
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
                <th className="px-6 py-4 font-medium">Order Number</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Products</th>
                <th className="px-6 py-4 font-medium">Priority</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">ORD-8821</td>
                <td className="px-6 py-4 text-slate-600 dark:text-nexus-textSecondary">Michael Johnson</td>
                <td className="px-6 py-4 text-slate-600 dark:text-nexus-textSecondary">2 Items</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400">
                    High
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-nexus-warninglue-100 text-nexus-warninglue-700 dark:bg-nexus-warninglue-500/20 dark:text-nexus-warninglue-400">
                    To Pick
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button className="text-orange-500 hover:text-orange-600 font-medium text-xs flex inline-flex items-center gap-1">
                    <Box size={14} /> Start Picking
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">ORD-8822</td>
                <td className="px-6 py-4 text-slate-600 dark:text-nexus-textSecondary">Sarah Williams</td>
                <td className="px-6 py-4 text-slate-600 dark:text-nexus-textSecondary">1 Item</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-nexus-textSecondary">
                    Normal
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400">
                    Packing
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button className="text-orange-500 hover:text-orange-600 font-medium text-xs flex inline-flex items-center gap-1">
                    <PackageCheck size={14} /> Complete Packing
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderProcessingPage;
