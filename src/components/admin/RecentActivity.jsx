import React from 'react';

const RecentActivity = () => {
  const activities = [
    { id: 1, text: 'Finance generated Monthly Report', time: '10 mins ago', type: 'system' },
    { id: 2, text: 'New Employee added to Inventory', time: '1 hr ago', type: 'hr' },
    { id: 3, text: 'Dispatch delayed 6 orders', time: '2 hrs ago', type: 'alert' },
  ];

  return (
    <div className="bg-white dark:bg-nexus-bg border border-slate-200 dark:border-nexus-border rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map(activity => (
          <div key={activity.id} className="flex gap-4">
            <div className="w-2 h-2 mt-2 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{activity.text}</p>
              <p className="text-xs text-nexus-textSecondary dark:text-nexus-textSecondary">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
