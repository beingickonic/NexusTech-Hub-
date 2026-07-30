import React from 'react';
import { Package, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

const RecentActivityFeed = () => {
  const activities = [
    { id: 1, title: 'Goods Received', desc: 'PO-1029 from TechSupplies Inc.', time: '10 mins ago', icon: Package, color: 'text-nexus-warninglue-500 bg-nexus-warninglue-50 dark:bg-nexus-warninglue-500/10' },
    { id: 2, title: 'Stock Adjustment', desc: 'Manual adjustment for iPhone 15 Pro (+5)', time: '1 hour ago', icon: RefreshCw, color: 'text-orange-500 bg-orange-50 dark:bg-orange-500/10' },
    { id: 3, title: 'Damaged Goods Reported', desc: '2x Samsung S24 Ultra marked as damaged', time: '3 hours ago', icon: AlertTriangle, color: 'text-red-500 bg-red-50 dark:bg-red-500/10' },
    { id: 4, title: 'Order Picked', desc: 'Order #ORD-8821 ready for dispatch', time: '5 hours ago', icon: CheckCircle, color: 'text-green-500 bg-green-50 dark:bg-green-500/10' },
  ];

  return (
    <div className="bg-white dark:bg-nexus-bg border border-slate-200 dark:border-nexus-border rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map(activity => (
          <div key={activity.id} className="flex gap-4 items-start relative">
            <div className={`p-2 rounded-full ${activity.color} flex-shrink-0 z-10`}>
              <activity.icon size={16} />
            </div>
            <div className="flex-1 pb-4 border-b border-slate-100 dark:border-nexus-border last:border-0 last:pb-0">
              <div className="flex justify-between items-start mb-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{activity.title}</p>
                <span className="text-xs text-nexus-textSecondary whitespace-nowrap ml-2">{activity.time}</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-nexus-textSecondary">{activity.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivityFeed;
