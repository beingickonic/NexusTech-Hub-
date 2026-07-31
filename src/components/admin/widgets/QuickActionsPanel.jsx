import React from 'react';
import { Plus, Tag, FolderPlus, Send, Percent } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActionsPanel = () => {
  const navigate = useNavigate();

  const actions = [
    { label: 'Add Product', icon: Plus, color: 'text-primary bg-primary/10 border-primary/20', path: '/admin/products' },
    { label: 'Create Coupon', icon: Tag, color: 'text-success bg-success/10 border-success/20', path: '/admin/coupons' },
    { label: 'Add Category', icon: FolderPlus, color: 'text-warning bg-warning/10 border-warning/20', path: '/admin/categories' },
    { label: 'Send Campaign', icon: Send, color: 'text-nexus-info bg-nexus-info/10 border-nexus-info/20', path: '/admin/marketing' },
    { label: 'Create Discount', icon: Percent, color: 'text-info bg-info/100/10 border-info/20', path: '/admin/discounts' }
  ];

  return (
    <div className="bg-nexus-card backdrop-blur-md p-4 md:p-6 rounded-xl md:rounded-2xl border border-nexus-border shadow-sm">
      <h3 className="text-base md:text-lg font-bold text-nexus-heading mb-4 md:mb-6">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-3">
        {actions.map((action, idx) => (
          <button 
            key={idx}
            onClick={() => navigate(action.path)}
            className="flex flex-col items-center justify-center p-3 md:p-4 rounded-xl border border-nexus-border hover:border-nexus-border dark:hover:border-nexus-border hover:bg-nexus-surface dark:hover:bg-nexus-hover/50 transition-all group"
          >
            <div className={`p-2 md:p-3 rounded-full border mb-2 md:mb-3 group-hover:scale-110 transition-transform ${action.color}`}>
              <action.icon size={16} className="md:w-5 md:h-5" />
            </div>
            <span className="text-[10px] md:text-xs font-semibold text-nexus-muted text-center">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsPanel;
