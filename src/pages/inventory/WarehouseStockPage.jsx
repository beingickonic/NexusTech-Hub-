import React, { useState } from 'react';
import { Search, Filter, Box, ArrowRightLeft, Printer, RefreshCw } from 'lucide-react';

const WarehouseStockPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Warehouse Stock</h1>
          <p className="text-sm text-nexus-textSecondary">Manage, organize, and track all products in the warehouse.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl text-sm font-medium transition-colors">
            <Printer size={16} /> Print Barcodes
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors">
            <ArrowRightLeft size={16} /> Transfer Stock
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-nexus-bg border border-slate-200 dark:border-nexus-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-nexus-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50 dark:bg-white/5">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-textSecondary" size={18} />
            <input 
              type="text" 
              placeholder="Search by Product Name or SKU..." 
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
                <th className="px-6 py-4 font-medium">Location</th>
                <th className="px-6 py-4 font-medium">Available</th>
                <th className="px-6 py-4 font-medium">Reserved</th>
                <th className="px-6 py-4 font-medium">Min Level</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0">
                      <Box size={20} className="text-nexus-textSecondary" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">iPhone 15 Pro</p>
                      <p className="text-xs text-nexus-textSecondary">SKU: IP15P-128-BLK</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-nexus-textSecondary">A1-R4-S2</td>
                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">145</td>
                <td className="px-6 py-4 text-nexus-textSecondary">12</td>
                <td className="px-6 py-4 text-nexus-textSecondary">50</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400">
                    In Stock
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button className="text-nexus-textSecondary hover:text-orange-500 transition-colors"><RefreshCw size={16} /></button>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0">
                      <Box size={20} className="text-nexus-textSecondary" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">MacBook Air M3</p>
                      <p className="text-xs text-nexus-textSecondary">SKU: MBA-M3-256</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-nexus-textSecondary">B2-R1-S1</td>
                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">8</td>
                <td className="px-6 py-4 text-nexus-textSecondary">2</td>
                <td className="px-6 py-4 text-nexus-textSecondary">10</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400">
                    Low Stock
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button className="text-nexus-textSecondary hover:text-orange-500 transition-colors"><RefreshCw size={16} /></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WarehouseStockPage;
