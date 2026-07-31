import React from 'react';

const RecentActivity = () => {
  const activities = [
    { id: 1, text: 'Finance generated Monthly Report', time: '10 mins ago', type: 'system' },
    { id: 2, text: 'New Employee added to Inventory', time: '1 hr ago', type: 'hr' },
    { id: 3, text: 'Dispatch delayed 6 orders', time: '2 hrs ago', type: 'alert' },
  ];

  return (
    <div className="bg-white dark:bg-nexus-bg border border-nexus-border rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-bold text-nexus-heading mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map(activity => (
          <div key={activity.id} className="flex gap-4">
            <div className="w-2 h-2 mt-2 rounded-full bg-nexus-muted dark:bg-nexus-muted flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-nexus-heading">{activity.text}</p>
              <p className="text-xs text-nexus-muted">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
