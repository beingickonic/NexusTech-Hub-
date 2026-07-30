import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

const DepartmentCard = ({ name, manager, status, metrics, link }) => {
  const statusColor = {
    'Online': 'bg-green-500',
    'Warning': 'bg-orange-500',
    'Busy': 'bg-nexus-warninglue-500',
    'Offline': 'bg-slate-400'
  }[status] || 'bg-slate-500';

  return (
    <div className="bg-white dark:bg-nexus-bg border border-slate-200 dark:border-[#1F2937] rounded-2xl p-5 shadow-sm flex flex-col h-full relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">{name}</h3>
          <p className="text-sm text-nexus-textSecondary dark:text-nexus-textSecondary">Head: {manager}</p>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-nexus-border">
          <div className={`w-2 h-2 rounded-full ${statusColor}`} />
          <span className="text-xs font-medium text-slate-600 dark:text-nexus-textSecondary">{status}</span>
        </div>
      </div>

      <div className="space-y-2 mb-6 flex-grow relative z-10">
        {metrics.map((metric, idx) => (
          <div key={idx} className="text-sm font-medium text-slate-700 dark:text-nexus-textSecondary">
            • {metric}
          </div>
        ))}
      </div>

      <Link to={link} className="mt-auto relative z-10">
        <button className="w-full py-2.5 px-4 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 dark:text-orange-500 font-semibold text-sm transition-colors flex items-center justify-center gap-2">
          Open Department
          <ExternalLink size={14} />
        </button>
      </Link>
    </div>
  );
};

export default DepartmentCard;
