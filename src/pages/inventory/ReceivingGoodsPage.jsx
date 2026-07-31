import React, { useState } from 'react';
import { Download, Plus, Search, Filter, ScanLine, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const ReceivingGoodsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-nexus-heading">Receiving Goods</h1>
          <p className="text-sm text-nexus-textSecondary">Manage and verify incoming inventory deliveries.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-nexus-primary/10 text-nexus-primary dark:bg-nexus-primary/10 dark:text-nexus-primary rounded-xl text-sm font-medium transition-colors">
            <ScanLine size={16} /> Scan Delivery
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-nexus-primary hover:bg-nexus-primary-hover text-white rounded-xl text-sm font-medium transition-colors">
            <Plus size={16} /> New Receipt
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-nexus-bg border border-nexus-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-nexus-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-nexus-surface dark:bg-nexus-hover">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-textSecondary" size={18} />
            <input 
              type="text" 
              placeholder="Search by PO or Supplier..." 
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
                <th className="px-6 py-4 font-medium">PO Number</th>
                <th className="px-6 py-4 font-medium">Supplier</th>
                <th className="px-6 py-4 font-medium">Delivery Date</th>
                <th className="px-6 py-4 font-medium">Received Items</th>
                <th className="px-6 py-4 font-medium">Issues</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nexus-border dark:divide-nexus-card">
              <tr className="hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors">
                <td className="px-6 py-4 font-medium text-nexus-heading">PO-10294</td>
                <td className="px-6 py-4 text-nexus-muted">TechSupplies Inc.</td>
                <td className="px-6 py-4 text-nexus-muted">Today, 08:30 AM</td>
                <td className="px-6 py-4 text-nexus-muted">120 / 120</td>
                <td className="px-6 py-4"><span className="text-nexus-textSecondary">-</span></td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-nexus-success/10 text-nexus-success dark:bg-nexus-success/20 dark:text-nexus-success flex items-center gap-1 w-max">
                    <CheckCircle size={12} /> Accepted
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-nexus-primary hover:text-nexus-primary font-medium text-xs">View Details</button>
                </td>
              </tr>
              <tr className="hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors">
                <td className="px-6 py-4 font-medium text-nexus-heading">PO-10295</td>
                <td className="px-6 py-4 text-nexus-muted">Global Electronics</td>
                <td className="px-6 py-4 text-nexus-muted">Today, 10:15 AM</td>
                <td className="px-6 py-4 text-nexus-muted">45 / 50</td>
                <td className="px-6 py-4 text-nexus-error font-medium">5 Missing</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-nexus-primary/15 text-nexus-primary dark:bg-nexus-primary/20 dark:text-nexus-primary flex items-center gap-1 w-max">
                    <AlertTriangle size={12} /> Pending Verification
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-nexus-primary hover:text-nexus-primary font-medium text-xs">Verify</button>
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
