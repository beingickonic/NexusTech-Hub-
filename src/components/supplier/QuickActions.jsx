import React from 'react';
import { Plus, RefreshCw, ShoppingBag, MessageSquare, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

const QuickActions = () => {
  const actions = [
    { title: 'Add Product', icon: Plus, link: '/supplier/products', color: 'bg-nexus-success/5 text-nexus-success dark:bg-nexus-success/10 dark:text-nexus-success' },
    { title: 'Update Stock', icon: RefreshCw, link: '/supplier/stock', color: 'bg-nexus-warninglue-50 text-nexus-warninglue-600 dark:bg-nexus-warninglue-500/10 dark:text-nexus-warninglue-500' },
    { title: 'Process Orders', icon: ShoppingBag, link: '/supplier/orders', color: 'bg-nexus-primary/10 text-nexus-primary dark:bg-nexus-primary/10 dark:text-nexus-primary' },
    { title: 'Contact Inventory', icon: MessageSquare, link: '/supplier/messages', color: 'bg-info/10 text-info dark:bg-info/100/10 dark:text-info' },
    { title: 'Contact Finance', icon: Briefcase, link: '/supplier/messages', color: 'bg-nexus-surface text-nexus-muted dark:bg-nexus-hover dark:text-nexus-textSecondary' },
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
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
