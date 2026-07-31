import React from 'react';
import { Download, Plus, Search, CheckSquare, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const QuickActions = () => {
  const actions = [
    { title: 'Receive Goods', icon: Download, link: '/inventory/receiving', color: 'bg-nexus-success/5 text-nexus-success dark:bg-nexus-success/10 dark:text-nexus-success' },
    { title: 'Scan Product', icon: Search, link: '/inventory/stock', color: 'bg-nexus-warninglue-50 text-nexus-warninglue-600 dark:bg-nexus-warninglue-500/10 dark:text-nexus-warninglue-500' },
    { title: 'Stock Adjustment', icon: Plus, link: '/inventory/control', color: 'bg-nexus-primary/10 text-nexus-primary dark:bg-nexus-primary/10 dark:text-nexus-primary' },
    { title: 'Process Orders', icon: CheckSquare, link: '/inventory/orders', color: 'bg-info/10 text-info dark:bg-info/100/10 dark:text-info' },
    { title: 'Generate Report', icon: FileText, link: '/inventory/reports', color: 'bg-nexus-surface text-nexus-muted dark:bg-nexus-hover dark:text-nexus-textSecondary' },
  ];

  return (
    <div className="bg-white dark:bg-nexus-bg border border-nexus-border rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-bold text-nexus-heading mb-4">Quick Actions</h2>
      <div className="space-y-3">
        {actions.map((action, idx) => (
          <Link 
            key={idx} 
            to={action.link}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-nexus-surface dark:hover:bg-nexus-hover border border-transparent hover:border-nexus-border dark:hover:border-nexus-border transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${action.color}`}>
                <action.icon size={18} />
              </div>
              <span className="font-medium text-sm text-nexus-muted group-hover:text-nexus-heading dark:group-hover:text-nexus-heading transition-colors">
                {action.title}
              </span>
            </div>
            <ArrowRight size={16} className="text-nexus-textSecondary group-hover:text-nexus-primary transition-colors opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
