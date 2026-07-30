import React from 'react';

const ProgressCard = ({ completed, total }) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return (
    <div className="bg-nexus-surface border border-nexus-border rounded-2xl p-6 shadow-lg mb-6">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-white font-bold text-lg mb-1">Today's Progress</h2>
          <p className="text-nexus-textSecondary text-sm">{completed} / {total} Deliveries Completed</p>
        </div>
        <div className="text-2xl font-bold text-nexus-success">
          {percentage}%
        </div>
      </div>
      
      <div className="h-4 bg-nexus-bg rounded-full overflow-hidden border border-nexus-border/50">
        <div 
          className="h-full bg-gradient-to-r from-nexus-success to-[#34d399] rounded-full transition-all duration-1000 ease-out relative"
          style={{ width: `${percentage}%` }}
        >
          {/* Shine effect */}
          <div className="absolute top-0 left-0 w-full h-full bg-white/20"></div>
        </div>
      </div>
    </div>
  );
};

export default ProgressCard;
