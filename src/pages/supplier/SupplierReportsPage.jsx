import React from 'react';
import { FileText, Download, TrendingUp, Package, ShoppingCart, DollarSign } from 'lucide-react';

const SupplierReportsPage = () => {
  const reportCategories = [
    {
      title: 'Sales & Revenue',
      icon: TrendingUp,
      color: 'text-green-500 bg-green-50 dark:bg-green-500/10',
      reports: ['Sales Summary', 'Revenue by Category', 'Best Selling Products']
    },
    {
      title: 'Products & Inventory',
      icon: Package,
      color: 'text-nexus-warninglue-500 bg-nexus-warninglue-50 dark:bg-nexus-warninglue-500/10',
      reports: ['Product Performance', 'Out of Stock Items', 'Returns & Defects']
    },
    {
      title: 'Order Fulfillment',
      icon: ShoppingCart,
      color: 'text-orange-500 bg-orange-50 dark:bg-orange-500/10',
      reports: ['Completed Orders', 'Cancelled Orders', 'Pending Fulfillment']
    },
    {
      title: 'Financials',
      icon: DollarSign,
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-500/10',
      reports: ['Payment History', 'Outstanding Balances', 'Commission Statements']
    }
  ];

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports</h1>
          <p className="text-sm text-nexus-textSecondary">Download insights on your business performance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportCategories.map((category, idx) => (
          <div key={idx} className="bg-white dark:bg-nexus-bg border border-slate-200 dark:border-nexus-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-xl ${category.color}`}>
                <category.icon size={20} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{category.title}</h2>
            </div>
            
            <div className="space-y-3">
              {category.reports.map((report, rIdx) => (
                <div key={rIdx} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-nexus-border hover:border-slate-300 dark:hover:border-nexus-border hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="text-nexus-textSecondary" />
                    <span className="font-medium text-sm text-slate-700 dark:text-nexus-textSecondary">{report}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-nexus-textSecondary hover:bg-slate-200 dark:hover:bg-white/10 transition-colors flex items-center gap-1">
                      PDF
                    </button>
                    <button className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-nexus-textSecondary hover:bg-slate-200 dark:hover:bg-white/10 transition-colors flex items-center gap-1">
                      CSV
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupplierReportsPage;
