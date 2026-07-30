import React from 'react';
import { Bell, Lock, Globe, Shield, Moon } from 'lucide-react';

const SupplierSettingsPage = () => {
  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-sm text-nexus-textSecondary">Manage your portal preferences and notifications.</p>
        </div>
        <button className="px-4 py-2 bg-nexus-primary hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors">
          Save Preferences
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-nexus-primary/10 text-nexus-primary font-medium text-sm text-left">
            <Bell size={18} /> Notifications
          </button>
          <button className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-600 dark:text-nexus-textSecondary hover:bg-slate-50 dark:hover:bg-white/5 font-medium text-sm text-left transition-colors">
            <Lock size={18} /> Security & Password
          </button>
          <button className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-600 dark:text-nexus-textSecondary hover:bg-slate-50 dark:hover:bg-white/5 font-medium text-sm text-left transition-colors">
            <Globe size={18} /> Language & Region
          </button>
          <button className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-600 dark:text-nexus-textSecondary hover:bg-slate-50 dark:hover:bg-white/5 font-medium text-sm text-left transition-colors">
            <Moon size={18} /> Appearance
          </button>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-nexus-bg border border-slate-200 dark:border-nexus-border rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6">Email Notifications</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-slate-900 dark:text-white">New Orders</p>
                  <p className="text-xs text-nexus-textSecondary">Receive an email when a customer places an order</p>
                </div>
                <div className="w-11 h-6 bg-nexus-primary rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-slate-900 dark:text-white">Product Approvals</p>
                  <p className="text-xs text-nexus-textSecondary">Get notified when admin approves/rejects your products</p>
                </div>
                <div className="w-11 h-6 bg-nexus-primary rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-slate-900 dark:text-white">Low Stock Warnings</p>
                  <p className="text-xs text-nexus-textSecondary">Email alerts when stock falls below reorder level</p>
                </div>
                <div className="w-11 h-6 bg-nexus-primary rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-slate-900 dark:text-white">Payments & Payouts</p>
                  <p className="text-xs text-nexus-textSecondary">Receive receipts when Finance issues a payment</p>
                </div>
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierSettingsPage;
