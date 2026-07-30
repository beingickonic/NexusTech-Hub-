import React, { useState } from 'react';
import { Search, Filter, Truck, Calendar, MapPin } from 'lucide-react';

const SupplierDeliveriesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Deliveries</h1>
          <p className="text-sm text-nexus-textSecondary">Track shipments and courier dispatch statuses.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-nexus-bg border border-slate-200 dark:border-nexus-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-nexus-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50 dark:bg-white/5">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-textSecondary" size={18} />
            <input 
              type="text" 
              placeholder="Search tracking or order number..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-nexus-bg border border-slate-200 dark:border-nexus-border rounded-xl text-sm focus:outline-none focus:border-nexus-primary transition-colors"
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
                <th className="px-6 py-4 font-medium">Order / Courier</th>
                <th className="px-6 py-4 font-medium">Tracking Number</th>
                <th className="px-6 py-4 font-medium">Pickup Date</th>
                <th className="px-6 py-4 font-medium">Est. Delivery</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-slate-900 dark:text-white">ORD-8820</p>
                  <p className="text-xs text-nexus-textSecondary flex items-center gap-1"><Truck size={12} /> Nexus Logistics</p>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-nexus-textSecondary">TRK-10928374</td>
                <td className="px-6 py-4 text-slate-600 dark:text-nexus-textSecondary">Today, 08:00 AM</td>
                <td className="px-6 py-4 text-slate-600 dark:text-nexus-textSecondary">Tomorrow</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-nexus-warninglue-100 text-nexus-warninglue-700 dark:bg-nexus-warninglue-500/20 dark:text-nexus-warninglue-400">
                    In Transit
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-orange-500 hover:text-orange-600 font-medium text-xs">View Status</button>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-slate-900 dark:text-white">ORD-8815</p>
                  <p className="text-xs text-nexus-textSecondary flex items-center gap-1"><Truck size={12} /> FedEx Express</p>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-nexus-textSecondary">FDX-99881122</td>
                <td className="px-6 py-4 text-slate-600 dark:text-nexus-textSecondary">Yesterday</td>
                <td className="px-6 py-4 text-slate-600 dark:text-nexus-textSecondary">Today</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400">
                    Delivered
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-orange-500 hover:text-orange-600 font-medium text-xs">Proof of Delivery</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SupplierDeliveriesPage;
