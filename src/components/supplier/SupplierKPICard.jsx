import React from 'react';

const SupplierKPICard = ({ title, value, icon: Icon, colorClass, trend }) => {
  return (
    <div className="bg-white dark:bg-nexus-bg p-5 rounded-2xl border border-nexus-border dark:border-nexus-card shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClass}`}>
          <Icon size={24} />
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend > 0 ? 'bg-nexus-success/10 text-nexus-success dark:bg-nexus-success/20 dark:text-nexus-success' : 'bg-nexus-error/10 text-nexus-error dark:bg-nexus-error/20 dark:text-nexus-error'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <h3 className="text-3xl font-bold text-nexus-heading mb-1">{value}</h3>
        <p className="text-sm font-medium text-nexus-muted">{title}</p>
      </div>
    </div>
  );
};

export default SupplierKPICard;
