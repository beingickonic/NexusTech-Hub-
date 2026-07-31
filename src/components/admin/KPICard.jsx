import React from 'react';

const KPICard = ({ title, value, icon: Icon, color }) => {
  const colorMap = {
    blue: 'bg-nexus-warninglue-50 text-nexus-warninglue-600 dark:bg-nexus-warninglue-500/10 dark:text-nexus-warninglue-400',
    indigo: 'bg-info/10 text-info dark:bg-info/100/10 dark:text-info',
    orange: 'bg-nexus-primary/10 text-nexus-primary dark:bg-nexus-primary/10 dark:text-nexus-primary',
    purple: 'bg-info/10 text-info dark:bg-info/100/10 dark:text-info',
  };

  return (
    <div className="bg-white dark:bg-nexus-bg p-5 rounded-2xl border border-nexus-border dark:border-nexus-card shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${colorMap[color] || colorMap.blue}`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-sm text-nexus-muted font-medium">{title}</p>
          <p className="text-2xl font-bold text-nexus-heading">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default KPICard;
