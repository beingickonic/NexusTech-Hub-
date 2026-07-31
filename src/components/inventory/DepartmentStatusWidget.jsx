import React from 'react';
import { Database, AlertCircle, ShoppingBag, Truck } from 'lucide-react';

const DepartmentStatusWidget = () => {
  const stats = [
    { label: 'Warehouse Capacity', value: '78%', icon: Database, color: 'text-info' },
    { label: 'Low Stock Alerts', value: '12', icon: AlertCircle, color: 'text-nexus-error' },
    { label: 'Orders Waiting', value: '45', icon: ShoppingBag, color: 'text-nexus-primary' },
    { label: 'Supplier Deliveries', value: '3', icon: Truck, color: 'text-nexus-warninglue-500' },
  ];

  return (
    <div className="bg-white dark:bg-nexus-bg border border-nexus-border rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-bold text-nexus-heading mb-4">Department Status</h2>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="p-4 bg-nexus-surface dark:bg-nexus-hover rounded-xl border border-nexus-border">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={16} className={stat.color} />
              <span className="text-xs font-medium text-nexus-muted">{stat.label}</span>
            </div>
            <p className="text-xl font-bold text-nexus-heading">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DepartmentStatusWidget;
