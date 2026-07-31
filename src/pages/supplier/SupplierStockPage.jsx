import React, { useState } from 'react';
import { Search, Filter, AlertTriangle, ArrowUpCircle, ArrowDownCircle, Info } from 'lucide-react';

const SupplierStockPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-nexus-heading">Stock Control</h1>
          <p className="text-sm text-nexus-textSecondary">Monitor and adjust your product inventory levels.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-nexus-bg p-4 rounded-xl border border-nexus-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-nexus-textSecondary">Available Stock</p>
            <p className="text-xl font-bold text-nexus-heading mt-1">1,245</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-nexus-success/5 flex items-center justify-center text-nexus-success dark:bg-nexus-success/10">
            <Info size={18} />
          </div>
        </div>
        <div className="bg-white dark:bg-nexus-bg p-4 rounded-xl border border-nexus-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-nexus-textSecondary">Reserved Stock</p>
            <p className="text-xl font-bold text-nexus-heading mt-1">45</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-nexus-primary/10 flex items-center justify-center text-nexus-primary dark:bg-nexus-primary/10">
            <Info size={18} />
          </div>
        </div>
        <div className="bg-white dark:bg-nexus-bg p-4 rounded-xl border border-nexus-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-nexus-textSecondary">Sold Today</p>
            <p className="text-xl font-bold text-nexus-heading mt-1">12</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-nexus-warninglue-50 flex items-center justify-center text-nexus-warninglue-500 dark:bg-nexus-warninglue-500/10">
            <Info size={18} />
          </div>
        </div>
        <div className="bg-white dark:bg-nexus-bg p-4 rounded-xl border border-nexus-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-nexus-textSecondary">Incoming Stock</p>
            <p className="text-xl font-bold text-nexus-heading mt-1">100</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center text-info dark:bg-info/100/10">
            <Info size={18} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-nexus-bg border border-nexus-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-nexus-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-nexus-surface dark:bg-nexus-hover">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-textSecondary" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
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
                <th className="px-6 py-4 font-medium">Available</th>
                <th className="px-6 py-4 font-medium">Reserved</th>
                <th className="px-6 py-4 font-medium">Reorder Level</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Adjust Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nexus-border dark:divide-nexus-card">
              <tr className="hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors">
                <td className="px-6 py-4 font-medium text-nexus-heading">Sony WH-1000XM5</td>
                <td className="px-6 py-4 text-nexus-muted">45</td>
                <td className="px-6 py-4 text-nexus-muted">5</td>
                <td className="px-6 py-4 text-nexus-muted">10</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-nexus-success/10 text-nexus-success dark:bg-nexus-success/20 dark:text-nexus-success">
                    Healthy
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button className="text-nexus-textSecondary hover:text-nexus-success transition-colors" title="Increase"><ArrowUpCircle size={18} /></button>
                  <button className="text-nexus-textSecondary hover:text-nexus-error transition-colors" title="Decrease"><ArrowDownCircle size={18} /></button>
                </td>
              </tr>
              <tr className="hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors">
                <td className="px-6 py-4 font-medium text-nexus-heading">Mechanical Keyboard Keychron Q1</td>
                <td className="px-6 py-4 font-bold text-nexus-error">2</td>
                <td className="px-6 py-4 text-nexus-muted">0</td>
                <td className="px-6 py-4 text-nexus-muted">15</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-nexus-error/10 text-nexus-error dark:bg-nexus-error/20 dark:text-nexus-error flex items-center gap-1 w-max">
                    <AlertTriangle size={12} /> Low Stock
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button className="text-nexus-textSecondary hover:text-nexus-success transition-colors" title="Increase"><ArrowUpCircle size={18} /></button>
                  <button className="text-nexus-textSecondary hover:text-nexus-error transition-colors" title="Decrease"><ArrowDownCircle size={18} /></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SupplierStockPage;
