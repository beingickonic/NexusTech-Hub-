import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

const DepartmentCard = ({ name, manager, status, metrics, link }) => {
  const statusColor = {
    'Online': 'bg-nexus-success',
    'Warning': 'bg-nexus-primary',
    'Busy': 'bg-nexus-warninglue-500',
    'Offline': 'bg-nexus-muted'
  }[status] || 'bg-nexus-muted';

  return (
    <div className="bg-white dark:bg-nexus-bg border border-nexus-border dark:border-nexus-card rounded-2xl p-5 shadow-sm flex flex-col h-full relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-nexus-primary/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="font-bold text-nexus-heading text-lg">{name}</h3>
          <p className="text-sm text-nexus-muted">Head: {manager}</p>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-nexus-surface dark:bg-nexus-hover border border-nexus-border">
          <div className={`w-2 h-2 rounded-full ${statusColor}`} />
          <span className="text-xs font-medium text-nexus-muted">{status}</span>
        </div>
      </div>

      <div className="space-y-2 mb-6 flex-grow relative z-10">
        {metrics.map((metric, idx) => (
          <div key={idx} className="text-sm font-medium text-nexus-muted">
            • {metric}
          </div>
        ))}
      </div>

      <Link to={link} className="mt-auto relative z-10">
        <button className="w-full py-2.5 px-4 rounded-xl bg-nexus-primary/10 hover:bg-nexus-primary/15 text-nexus-primary dark:bg-nexus-primary/10 dark:hover:bg-nexus-primary/20 dark:text-nexus-primary font-semibold text-sm transition-colors flex items-center justify-center gap-2">
          Open Department
          <ExternalLink size={14} />
        </button>
      </Link>
    </div>
  );
};

export default DepartmentCard;
