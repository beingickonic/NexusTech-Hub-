import React from 'react';
import { Bell } from 'lucide-react';

const NotificationPanel = () => {
  const notifications = [
    { id: 1, text: 'New Employee onboarding incomplete', time: '10m' },
    { id: 2, text: 'Meeting Reminder: Dept Heads at 2PM', time: '1h' },
    { id: 3, text: 'Finance Alert: Month End pending', time: '2h' },
    { id: 4, text: 'Low Inventory: 12 items', time: '5h' },
  ];

  return (
    <div className="bg-white dark:bg-nexus-bg border border-nexus-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Bell size={20} className="text-nexus-heading" />
        <h2 className="text-lg font-bold text-nexus-heading">HQ Notifications</h2>
      </div>
      <div className="space-y-4 mt-4">
        {notifications.map(n => (
          <div key={n.id} className="flex justify-between items-start gap-2 p-3 rounded-xl bg-nexus-surface dark:bg-nexus-hover">
            <p className="text-sm font-medium text-nexus-heading leading-tight">{n.text}</p>
            <span className="text-xs text-nexus-textSecondary whitespace-nowrap">{n.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationPanel;
