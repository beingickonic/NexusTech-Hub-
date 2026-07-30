import React from 'react';

const InventoryKPICard = ({ title, value, icon: Icon, colorClass, trend }) => {
  return (
    <div className="bg-white dark:bg-nexus-bg p-5 rounded-2xl border border-slate-200 dark:border-[#1F2937] shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClass}`}>
          <Icon size={24} />
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{value}</h3>
        <p className="text-sm font-medium text-nexus-textSecondary dark:text-nexus-textSecondary">{title}</p>
      </div>
    </div>
  );
};

export default InventoryKPICard;
