import React from 'react';
import { Mail, Phone, Calendar, Monitor, Coffee, HelpCircle, Package, Users } from 'lucide-react';

const OfficeOperations = () => {
  const operations = [
    { title: 'Visitor Log', icon: Users, count: 12, desc: 'Visitors today' },
    { title: 'Incoming Mail', icon: Mail, count: 4, desc: 'Unsorted packages' },
    { title: 'Outgoing Mail', icon: Package, count: 2, desc: 'Pending dispatch' },
    { title: 'Meeting Rooms', icon: Calendar, count: 3, desc: 'Rooms in use' },
    { title: 'Office Assets', icon: Monitor, count: 156, desc: 'Active assets' },
    { title: 'Internal Requests', icon: Coffee, count: 5, desc: 'Open requests' },
    { title: 'Support Tickets', icon: HelpCircle, count: 14, desc: 'Open tickets' },
    { title: 'Phone Directory', icon: Phone, count: 89, desc: 'Internal contacts' },
  ];

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Office Operations</h1>
        <p className="text-sm text-nexus-textSecondary">Manage daily HQ operations and reception.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {operations.map((op, idx) => (
          <div key={idx} className="bg-white dark:bg-nexus-bg border border-slate-200 dark:border-nexus-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-500 rounded-xl group-hover:scale-110 transition-transform">
                <op.icon size={20} />
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{op.count}</span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">{op.title}</h3>
            <p className="text-sm text-nexus-textSecondary dark:text-nexus-textSecondary">{op.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-nexus-bg border border-slate-200 dark:border-nexus-border rounded-2xl p-6 shadow-sm mt-6">
         <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Operations Activity</h2>
         <p className="text-sm text-nexus-textSecondary">Operation logs will be displayed here.</p>
      </div>
    </div>
  );
};

export default OfficeOperations;
