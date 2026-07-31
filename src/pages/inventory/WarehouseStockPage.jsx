import React, { useState } from 'react';
import { Search, Filter, Box, ArrowRightLeft, Printer, RefreshCw } from 'lucide-react';

const WarehouseStockPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-nexus-heading">Warehouse Stock</h1>
          <p className="text-sm text-nexus-textSecondary">Manage, organize, and track all products in the warehouse.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-nexus-surface dark:bg-nexus-hover hover:bg-nexus-surface dark:hover:bg-nexus-hover rounded-xl text-sm font-medium transition-colors">
            <Printer size={16} /> Print Barcodes
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-nexus-primary hover:bg-nexus-primary-hover text-white rounded-xl text-sm font-medium transition-colors">
            <ArrowRightLeft size={16} /> Transfer Stock
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-nexus-bg border border-nexus-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-nexus-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-nexus-surface dark:bg-nexus-hover">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-textSecondary" size={18} />
            <input 
              type="text" 
              placeholder="Search by Product Name or SKU..." 
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
                <th className="px-6 py-4 font-medium">Location</th>
                <th className="px-6 py-4 font-medium">Available</th>
                <th className="px-6 py-4 font-medium">Reserved</th>
                <th className="px-6 py-4 font-medium">Min Level</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nexus-border dark:divide-nexus-card">
              <tr className="hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-nexus-surface dark:bg-nexus-hover flex items-center justify-center flex-shrink-0">
                      <Box size={20} className="text-nexus-textSecondary" />
                    </div>
                    <div>
                      <p className="font-medium text-nexus-heading">iPhone 15 Pro</p>
                      <p className="text-xs text-nexus-textSecondary">SKU: IP15P-128-BLK</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-nexus-muted">A1-R4-S2</td>
                <td className="px-6 py-4 font-bold text-nexus-heading">145</td>
                <td className="px-6 py-4 text-nexus-textSecondary">12</td>
                <td className="px-6 py-4 text-nexus-textSecondary">50</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-nexus-success/10 text-nexus-success dark:bg-nexus-success/20 dark:text-nexus-success">
                    In Stock
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button className="text-nexus-textSecondary hover:text-nexus-primary transition-colors"><RefreshCw size={16} /></button>
                </td>
              </tr>
              <tr className="hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-nexus-surface dark:bg-nexus-hover flex items-center justify-center flex-shrink-0">
                      <Box size={20} className="text-nexus-textSecondary" />
                    </div>
                    <div>
                      <p className="font-medium text-nexus-heading">MacBook Air M3</p>
                      <p className="text-xs text-nexus-textSecondary">SKU: MBA-M3-256</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-nexus-muted">B2-R1-S1</td>
                <td className="px-6 py-4 font-bold text-nexus-heading">8</td>
                <td className="px-6 py-4 text-nexus-textSecondary">2</td>
                <td className="px-6 py-4 text-nexus-textSecondary">10</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-nexus-primary/15 text-nexus-primary dark:bg-nexus-primary/20 dark:text-nexus-primary">
                    Low Stock
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button className="text-nexus-textSecondary hover:text-nexus-primary transition-colors"><RefreshCw size={16} /></button>
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
