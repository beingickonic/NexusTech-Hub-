import React from 'react';
import { Package, RefreshCw, DollarSign, CheckCircle } from 'lucide-react';

const RecentActivity = () => {
  const activities = [
    { id: 1, title: 'New Order Received', desc: 'ORD-8821 for 2x iPhone 15 Pro', time: '10 mins ago', icon: Package, color: 'text-nexus-primary bg-nexus-primary/10 dark:bg-nexus-primary/10' },
    { id: 2, title: 'Stock Updated', desc: 'Added 50 units to MacBook Air M3', time: '1 hour ago', icon: RefreshCw, color: 'text-nexus-warninglue-500 bg-nexus-warninglue-50 dark:bg-nexus-warninglue-500/10' },
    { id: 3, title: 'Payment Received', desc: 'Finance cleared Inv-992 for $4,500', time: '3 hours ago', icon: DollarSign, color: 'text-nexus-success bg-nexus-success/5 dark:bg-nexus-success/10' },
    { id: 4, title: 'Product Approved', desc: 'Samsung Galaxy S24 is now live', time: '5 hours ago', icon: CheckCircle, color: 'text-info bg-info/10 dark:bg-info/100/10' },
  ];

  return (
    <div className="bg-white dark:bg-nexus-bg border border-nexus-border rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-bold text-nexus-heading mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map(activity => (
          <div key={activity.id} className="flex gap-4 items-start relative">
            <div className={`p-2 rounded-full ${activity.color} flex-shrink-0 z-10`}>
              <activity.icon size={16} />
            </div>
            <div className="flex-1 pb-4 border-b border-nexus-border last:border-0 last:pb-0">
              <div className="flex justify-between items-start mb-1">
                <p className="text-sm font-bold text-nexus-heading">{activity.title}</p>
                <span className="text-xs text-nexus-textSecondary whitespace-nowrap ml-2">{activity.time}</span>
              </div>
              <p className="text-sm text-nexus-muted">{activity.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
