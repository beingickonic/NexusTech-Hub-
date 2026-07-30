import React from 'react';
import { Star, XCircle, AlertTriangle, Clock } from 'lucide-react';

const BusinessHealthWidget = () => {
  const stats = [
    { label: 'Store Rating', value: '4.8/5.0', icon: Star, color: 'text-yellow-500' },
    { label: 'Cancelled Orders', value: '2%', icon: XCircle, color: 'text-red-500' },
    { label: 'Out of Stock', value: '4 Items', icon: AlertTriangle, color: 'text-orange-500' },
    { label: 'Avg Delivery', value: '1.2 Days', icon: Clock, color: 'text-nexus-warninglue-500' },
  ];

  return (
    <div className="bg-white dark:bg-nexus-bg border border-slate-200 dark:border-nexus-border rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Business Health</h2>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-nexus-border">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={16} className={stat.color} />
              <span className="text-xs font-medium text-nexus-textSecondary dark:text-nexus-textSecondary">{stat.label}</span>
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BusinessHealthWidget;
