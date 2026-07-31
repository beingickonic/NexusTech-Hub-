import React, { useState } from 'react';
import { Building, Users, Lock, Bell, Palette, Shield } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('Company');

  const tabs = [
    { id: 'Company', icon: Building },
    { id: 'Departments', icon: Users },
    { id: 'Roles', icon: Lock },
    { id: 'Notifications', icon: Bell },
    { id: 'Security', icon: Shield },
    { id: 'Appearance', icon: Palette },
  ];

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-nexus-heading">HQ Settings</h1>
        <p className="text-sm text-nexus-textSecondary">Configure global system parameters and security.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-nexus-bg border border-nexus-border rounded-2xl p-4 shadow-sm space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-nexus-primary/10 text-nexus-primary dark:text-nexus-primary'
                    : 'text-nexus-muted hover:bg-nexus-surface dark:hover:bg-nexus-hover hover:text-nexus-heading'
                }`}
              >
                <tab.icon size={18} />
                {tab.id}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-white dark:bg-nexus-bg border border-nexus-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-nexus-heading mb-6">{activeTab} Settings</h2>
            
            {activeTab === 'Company' && (
              <div className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-nexus-muted mb-1">Company Name</label>
                  <input type="text" defaultValue="Nexus Tech Hub" className="w-full px-4 py-2 bg-white dark:bg-nexus-bg border border-nexus-border rounded-xl focus:ring-2 focus:ring-nexus-primary focus:border-nexus-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-nexus-muted mb-1">Company Address</label>
                  <textarea rows={3} defaultValue="123 Tech Lane, Innovation City" className="w-full px-4 py-2 bg-white dark:bg-nexus-bg border border-nexus-border rounded-xl focus:ring-2 focus:ring-nexus-primary focus:border-nexus-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-nexus-muted mb-1">Tax/VAT Number</label>
                  <input type="text" defaultValue="VAT-1029485" className="w-full px-4 py-2 bg-white dark:bg-nexus-bg border border-nexus-border rounded-xl focus:ring-2 focus:ring-nexus-primary focus:border-nexus-primary outline-none" />
                </div>
                <button className="px-6 py-2 bg-nexus-primary hover:bg-nexus-primary-hover text-white rounded-xl font-medium transition-colors">
                  Save Changes
                </button>
              </div>
            )}

            {activeTab === 'Security' && (
              <div className="space-y-6 max-w-2xl">
                <div className="flex items-center justify-between p-4 bg-nexus-surface dark:bg-nexus-hover rounded-xl border border-nexus-border">
                  <div>
                    <h3 className="font-medium text-nexus-heading">Multi-Factor Authentication (MFA)</h3>
                    <p className="text-sm text-nexus-textSecondary">Require all users to use MFA for login.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-nexus-surface peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary dark:peer-focus:ring-primary rounded-full peer dark:bg-nexus-card peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-nexus-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-nexus-border peer-checked:bg-nexus-primary"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-nexus-surface dark:bg-nexus-hover rounded-xl border border-nexus-border">
                  <div>
                    <h3 className="font-medium text-nexus-heading">Session Timeout</h3>
                    <p className="text-sm text-nexus-textSecondary">Automatically logout users after inactivity.</p>
                  </div>
                  <select className="px-4 py-2 bg-white dark:bg-nexus-bg border border-nexus-border rounded-xl outline-none">
                    <option>15 Minutes</option>
                    <option>30 Minutes</option>
                    <option>1 Hour</option>
                  </select>
                </div>
              </div>
            )}
            
            {activeTab !== 'Company' && activeTab !== 'Security' && (
              <p className="text-nexus-textSecondary text-sm">Configuration options for {activeTab} will appear here.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
