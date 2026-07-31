import React, { useState } from 'react';
import { Building, Clock, Bell, Shield, Palette, Database, Save, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const SettingsSection = ({ title, icon: Icon, children }) => (
  <div className="bg-white/80 dark:bg-nexus-card/80 backdrop-blur-md rounded-2xl border border-nexus-border shadow-sm overflow-hidden mb-6">
    <div className="p-4 border-b border-nexus-border bg-nexus-surface/50 dark:bg-nexus-surface/30 flex items-center gap-2">
      <Icon size={18} className="text-nexus-primary" />
      <h3 className="font-bold text-nexus-heading">{title}</h3>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

const AdminSettingsPage = () => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Settings saved successfully');
    setIsSaving(false);
  };

  return (
    <div className="animate-fade-in pb-10">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-nexus-heading mb-2">Office Settings</h1>
          <p className="text-nexus-muted">Configure global office parameters and administration preferences.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 bg-nexus-primary hover:bg-nexus-primary-hover disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-primary/30"
        >
          {isSaving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Save size={18} />}
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6">
        <div>
          <SettingsSection title="Company Information" icon={Building}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-nexus-muted mb-1">Company Name</label>
                <input type="text" defaultValue="NexusTech Hub" className="w-full bg-nexus-surface border border-nexus-border rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-nexus-primary/50 outline-none text-nexus-heading" />
              </div>
              <div>
                <label className="block text-sm font-medium text-nexus-muted mb-1">Headquarters Address</label>
                <textarea rows="2" defaultValue="123 Tech Lane, Innovation City, 00100" className="w-full bg-nexus-surface border border-nexus-border rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-nexus-primary/50 outline-none text-nexus-heading" />
              </div>
            </div>
          </SettingsSection>

          <SettingsSection title="Office Hours" icon={Clock}>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-nexus-muted mb-1">Opening Time</label>
                  <input type="time" defaultValue="08:00" className="w-full bg-nexus-surface border border-nexus-border rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-nexus-primary/50 outline-none text-nexus-heading" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-nexus-muted mb-1">Closing Time</label>
                  <input type="time" defaultValue="18:00" className="w-full bg-nexus-surface border border-nexus-border rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-nexus-primary/50 outline-none text-nexus-heading" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="weekend" defaultChecked className="rounded border-nexus-border text-nexus-primary focus:ring-nexus-primary/50" />
                <label htmlFor="weekend" className="text-sm text-nexus-muted">Closed on Weekends</label>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection title="System Theme & UI" icon={Palette}>
            <div className="space-y-4">
              <p className="text-sm text-nexus-muted mb-2">Default application appearance for new staff accounts.</p>
              <div className="flex gap-4">
                <label className="flex-1 cursor-pointer relative">
                  <input type="radio" name="theme" className="peer sr-only" defaultChecked />
                  <div className="p-4 border-2 border-nexus-border rounded-xl text-center peer-checked:border-nexus-primary peer-checked:bg-nexus-primary/10 dark:peer-checked:bg-nexus-primary/10 transition-all">
                    <span className="block text-sm font-bold text-nexus-heading">Auto Match</span>
                  </div>
                </label>
                <label className="flex-1 cursor-pointer relative">
                  <input type="radio" name="theme" className="peer sr-only" />
                  <div className="p-4 border-2 border-nexus-border rounded-xl text-center peer-checked:border-nexus-primary peer-checked:bg-nexus-primary/10 dark:peer-checked:bg-nexus-primary/10 transition-all">
                    <span className="block text-sm font-bold text-nexus-heading">Light Mode</span>
                  </div>
                </label>
                <label className="flex-1 cursor-pointer relative">
                  <input type="radio" name="theme" className="peer sr-only" />
                  <div className="p-4 border-2 border-nexus-border rounded-xl text-center peer-checked:border-nexus-primary peer-checked:bg-nexus-primary/10 dark:peer-checked:bg-nexus-primary/10 transition-all">
                    <span className="block text-sm font-bold text-nexus-heading">Dark Mode</span>
                  </div>
                </label>
              </div>
            </div>
          </SettingsSection>
        </div>

        <div>
          <SettingsSection title="Notification Rules" icon={Bell}>
            <div className="space-y-3">
              {[
                'Send daily task digest to managers',
                'Alert admins on new support requests',
                'Auto-remind staff of upcoming meetings (15m prior)',
                'Notify inventory manager on low supplies',
                'Send broadcast emails for major announcements'
              ].map((text, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-nexus-surface/50 rounded-lg border border-nexus-border">
                  <span className="text-sm text-nexus-muted">{text}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked={i !== 4} />
                    <div className="w-9 h-5 bg-nexus-surface peer-focus:outline-none rounded-full peer dark:bg-nexus-card peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-nexus-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-nexus-border peer-checked:bg-nexus-primary"></div>
                  </label>
                </div>
              ))}
            </div>
          </SettingsSection>

          <SettingsSection title="Security Policies" icon={Shield}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-nexus-muted mb-1">Session Timeout (Minutes)</label>
                <input type="number" defaultValue="120" className="w-full bg-nexus-surface border border-nexus-border rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-nexus-primary/50 outline-none text-nexus-heading" />
              </div>
              <div className="flex items-center justify-between p-3 bg-nexus-surface/50 rounded-lg border border-nexus-border mt-2">
                <span className="text-sm text-nexus-muted">Enforce Two-Factor Auth (2FA) for Managers</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-9 h-5 bg-nexus-surface peer-focus:outline-none rounded-full peer dark:bg-nexus-card peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-nexus-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-nexus-border peer-checked:bg-nexus-primary"></div>
                </label>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection title="Database & Backup" icon={Database}>
            <div className="bg-nexus-surface/50 p-4 rounded-xl border border-nexus-border">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-nexus-muted">Supabase Connection</span>
                <span className="flex items-center gap-1 text-xs font-bold text-nexus-success bg-nexus-success/10 dark:bg-nexus-success/20 dark:text-nexus-success px-2 py-1 rounded-full"><Check size={12} /> Connected</span>
              </div>
              <div className="space-y-2 text-sm text-nexus-muted">
                <div className="flex justify-between"><span>Last automated backup:</span> <span className="font-medium text-nexus-muted">Today, 02:00 AM</span></div>
                <div className="flex justify-between"><span>Database Region:</span> <span className="font-medium text-nexus-muted">EU West (London)</span></div>
                <div className="flex justify-between"><span>Total Storage Used:</span> <span className="font-medium text-nexus-muted">1.2 GB / 50 GB</span></div>
              </div>
              <p className="text-xs text-nexus-textSecondary mt-4 italic">Backups and scaling are managed via the Supabase external dashboard.</p>
            </div>
          </SettingsSection>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
