import React, { useState } from 'react';
import { Search, Filter, Plus, Box, Edit2, Trash2 } from 'lucide-react';

const SupplierProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Products</h1>
          <p className="text-sm text-nexus-textSecondary">Manage your product catalog and listings.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-nexus-primary hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="bg-white dark:bg-nexus-bg border border-slate-200 dark:border-nexus-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-nexus-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50 dark:bg-white/5">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-textSecondary" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-nexus-bg border border-slate-200 dark:border-nexus-border rounded-xl text-sm focus:outline-none focus:border-nexus-primary transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-nexus-bg border border-slate-200 dark:border-nexus-border rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 w-full sm:w-auto">
            <Filter size={16} /> Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-white/5 text-nexus-textSecondary dark:text-nexus-textSecondary">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Stock</th>
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
                      <p className="font-medium text-slate-900 dark:text-white">Sony WH-1000XM5</p>
                      <p className="text-xs text-nexus-textSecondary">SKU: SONY-WH5-BLK</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-nexus-textSecondary">Electronics</td>
                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">$349.00</td>
                <td className="px-6 py-4 text-slate-600 dark:text-nexus-textSecondary">45</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400">
                    Published
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button className="text-nexus-textSecondary hover:text-nexus-warninglue-500 transition-colors"><Edit2 size={16} /></button>
                  <button className="text-nexus-textSecondary hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0">
                      <Box size={20} className="text-nexus-textSecondary" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Mechanical Keyboard Keychron Q1</p>
                      <p className="text-xs text-nexus-textSecondary">SKU: KEY-Q1-PRO</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-nexus-textSecondary">Accessories</td>
                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">$199.00</td>
                <td className="px-6 py-4 text-slate-600 dark:text-nexus-textSecondary">0</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400">
                    Pending Approval
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button className="text-nexus-textSecondary hover:text-nexus-warninglue-500 transition-colors"><Edit2 size={16} /></button>
                  <button className="text-nexus-textSecondary hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SupplierProductsPage;
