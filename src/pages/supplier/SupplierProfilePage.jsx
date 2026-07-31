import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import { Building2, User, Phone, Mail, MapPin, CreditCard, FileText, Upload } from 'lucide-react';

const SupplierProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-nexus-heading">Business Profile</h1>
          <p className="text-sm text-nexus-textSecondary">Manage your business information, compliance, and payout details.</p>
        </div>
        <button className="px-4 py-2 bg-nexus-primary hover:bg-nexus-primary-hover text-white rounded-xl text-sm font-medium transition-colors">
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Logo & Basic Info */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-nexus-bg border border-nexus-border rounded-2xl p-6 shadow-sm flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-nexus-surface dark:bg-nexus-bg border-4 border-white dark:border-nexus-bg shadow-lg flex items-center justify-center mb-4 relative overflow-hidden group">
              <Building2 size={40} className="text-nexus-textSecondary group-hover:opacity-0 transition-opacity" />
              <div className="absolute inset-0 bg-nexus-warninglack/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Upload size={24} className="text-white mb-1" />
                <span className="text-white text-xs font-medium">Upload Logo</span>
              </div>
            </div>
            <h2 className="text-xl font-bold text-nexus-heading">{user?.full_name || 'Business Name'}</h2>
            <p className="text-sm text-nexus-textSecondary mb-4">Supplier Partner</p>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-nexus-success/10 text-nexus-success dark:bg-nexus-success/20 dark:text-nexus-success">
              Active Account
            </span>
          </div>

          <div className="bg-white dark:bg-nexus-bg border border-nexus-border rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-nexus-heading mb-4">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User size={18} className="text-nexus-textSecondary mt-0.5" />
                <div>
                  <p className="text-xs text-nexus-textSecondary">Owner Name</p>
                  <p className="text-sm font-medium text-nexus-heading">{user?.full_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-nexus-textSecondary mt-0.5" />
                <div>
                  <p className="text-xs text-nexus-textSecondary">Email Address</p>
                  <p className="text-sm font-medium text-nexus-heading">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={18} className="text-nexus-textSecondary mt-0.5" />
                <div>
                  <p className="text-xs text-nexus-textSecondary">Phone Number</p>
                  <p className="text-sm font-medium text-nexus-heading">+254 700 000000</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-nexus-bg border border-nexus-border rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-nexus-heading mb-4 flex items-center gap-2">
              <Building2 size={18} className="text-nexus-primary" /> Business Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-nexus-textSecondary">Legal Business Name</label>
                <input type="text" className="w-full bg-nexus-surface dark:bg-nexus-hover border border-nexus-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-nexus-primary dark:text-white" defaultValue="Nexus Vendor Ltd" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-nexus-textSecondary">KRA PIN / Tax ID</label>
                <input type="text" className="w-full bg-nexus-surface dark:bg-nexus-hover border border-nexus-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-nexus-primary dark:text-white" defaultValue="P051234567Z" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium text-nexus-textSecondary">Physical Address</label>
                <input type="text" className="w-full bg-nexus-surface dark:bg-nexus-hover border border-nexus-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-nexus-primary dark:text-white" defaultValue="123 Biashara Street, Nairobi, Kenya" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-nexus-bg border border-nexus-border rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-nexus-heading mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-nexus-warninglue-500" /> Payout & Banking
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-nexus-textSecondary">Bank Name</label>
                <input type="text" className="w-full bg-nexus-surface dark:bg-nexus-hover border border-nexus-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-nexus-primary dark:text-white" defaultValue="Equity Bank" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-nexus-textSecondary">Branch</label>
                <input type="text" className="w-full bg-nexus-surface dark:bg-nexus-hover border border-nexus-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-nexus-primary dark:text-white" defaultValue="Upperhill" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-nexus-textSecondary">Account Name</label>
                <input type="text" className="w-full bg-nexus-surface dark:bg-nexus-hover border border-nexus-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-nexus-primary dark:text-white" defaultValue="Nexus Vendor Ltd" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-nexus-textSecondary">Account Number</label>
                <input type="text" className="w-full bg-nexus-surface dark:bg-nexus-hover border border-nexus-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-nexus-primary dark:text-white" defaultValue="08101000000" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-nexus-bg border border-nexus-border rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-nexus-heading mb-4 flex items-center gap-2">
              <FileText size={18} className="text-nexus-success" /> Compliance Documents
            </h3>
            <div className="p-4 rounded-xl border border-dashed border-nexus-border bg-nexus-surface dark:bg-nexus-hover flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText size={24} className="text-nexus-textSecondary" />
                <div>
                  <p className="font-medium text-sm text-nexus-heading">Business Registration Certificate</p>
                  <p className="text-xs text-nexus-textSecondary">Uploaded on Jan 12, 2026</p>
                </div>
              </div>
              <button className="text-sm font-medium text-nexus-warninglue-500 hover:text-nexus-warninglue-600">View</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SupplierProfilePage;
