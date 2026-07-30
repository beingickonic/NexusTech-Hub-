import React from 'react';

const SettingsPage = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-nexus-textSecondary mt-1">Configure Finance Portal preferences</p>
      </div>
      
      <div className="bg-white/10 dark:bg-slate-800/50 backdrop-blur-lg border border-white/20 dark:border-nexus-border/50 p-8 rounded-2xl shadow-xl">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Finance Settings</h2>
        <p className="text-nexus-textSecondary">
          Settings configuration (Tax rates, Fiscal Year, Notifications, Budgets) will be implemented in Phase 4.
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;
