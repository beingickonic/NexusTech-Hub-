import React from 'react';

const KPICard = ({ title, value, icon: Icon, color }) => {
  const colorMap = {
    blue: 'bg-nexus-warninglue-50 text-nexus-warninglue-600 dark:bg-nexus-warninglue-500/10 dark:text-nexus-warninglue-400',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
  };

  return (
    <div className="bg-white dark:bg-nexus-bg p-5 rounded-2xl border border-slate-200 dark:border-[#1F2937] shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${colorMap[color] || colorMap.blue}`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-sm text-nexus-textSecondary dark:text-nexus-textSecondary font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default KPICard;
