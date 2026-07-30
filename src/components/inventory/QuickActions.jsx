import React from 'react';
import { Download, Plus, Search, CheckSquare, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const QuickActions = () => {
  const actions = [
    { title: 'Receive Goods', icon: Download, link: '/inventory/receiving', color: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-500' },
    { title: 'Scan Product', icon: Search, link: '/inventory/stock', color: 'bg-nexus-warninglue-50 text-nexus-warninglue-600 dark:bg-nexus-warninglue-500/10 dark:text-nexus-warninglue-500' },
    { title: 'Stock Adjustment', icon: Plus, link: '/inventory/control', color: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-500' },
    { title: 'Process Orders', icon: CheckSquare, link: '/inventory/orders', color: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-500' },
    { title: 'Generate Report', icon: FileText, link: '/inventory/reports', color: 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-nexus-textSecondary' },
  ];

  return (
    <div className="bg-white dark:bg-nexus-bg border border-slate-200 dark:border-nexus-border rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
      <div className="space-y-3">
        {actions.map((action, idx) => (
          <Link 
            key={idx} 
            to={action.link}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-nexus-border transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${action.color}`}>
                <action.icon size={18} />
              </div>
              <span className="font-medium text-sm text-slate-700 dark:text-nexus-textSecondary group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                {action.title}
              </span>
            </div>
            <ArrowRight size={16} className="text-nexus-textSecondary group-hover:text-orange-500 transition-colors opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
