import React, { useState } from 'react';
import { Settings, Bell, Globe, Lock, Moon, Sun } from 'lucide-react';

const DriverSettingsPage = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto pb-24">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-slate-500/20 flex items-center justify-center">
          <Settings className="text-nexus-textSecondary" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-sm text-nexus-textSecondary">Manage your app preferences.</p>
        </div>
      </div>

      <div className="bg-nexus-surface border border-nexus-border rounded-2xl overflow-hidden shadow-lg">
        {/* Notifications */}
        <div className="p-5 flex items-center justify-between border-b border-nexus-border">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-nexus-bg flex items-center justify-center">
              <Bell size={18} className="text-nexus-textSecondary" />
            </div>
            <div>
              <p className="text-white font-medium">Notifications</p>
              <p className="text-xs text-nexus-textSecondary">Route updates and assignments</p>
            </div>
          </div>
          <button 
            onClick={() => setNotifications(!notifications)}
            className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? 'bg-nexus-success' : 'bg-slate-700'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifications ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        {/* Theme */}
        <div className="p-5 flex items-center justify-between border-b border-nexus-border">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-nexus-bg flex items-center justify-center">
              {darkMode ? <Moon size={18} className="text-nexus-textSecondary" /> : <Sun size={18} className="text-nexus-textSecondary" />}
            </div>
            <div>
              <p className="text-white font-medium">Dark Mode</p>
              <p className="text-xs text-nexus-textSecondary">Better for night driving</p>
            </div>
          </div>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`w-12 h-6 rounded-full transition-colors relative ${darkMode ? 'bg-nexus-success' : 'bg-slate-700'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${darkMode ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        {/* Language */}
        <button className="w-full p-5 flex items-center justify-between border-b border-nexus-border hover:bg-slate-800/50 transition-colors text-left">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-nexus-bg flex items-center justify-center">
              <Globe size={18} className="text-nexus-textSecondary" />
            </div>
            <div>
              <p className="text-white font-medium">Language</p>
              <p className="text-xs text-nexus-textSecondary">English (US)</p>
            </div>
          </div>
        </button>

        {/* Password */}
        <button className="w-full p-5 flex items-center justify-between hover:bg-slate-800/50 transition-colors text-left">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-nexus-bg flex items-center justify-center">
              <Lock size={18} className="text-nexus-textSecondary" />
            </div>
            <div>
              <p className="text-white font-medium">Change Password</p>
              <p className="text-xs text-nexus-textSecondary">Update your security</p>
            </div>
          </div>
        </button>
      </div>

      <div className="mt-8 text-center text-xs text-slate-600">
        Driver Portal v1.0.0
      </div>
    </div>
  );
};

export default DriverSettingsPage;
