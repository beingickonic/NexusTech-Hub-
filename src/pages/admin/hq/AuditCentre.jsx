import React, { useState } from 'react';
import { Search, Filter, ShieldAlert } from 'lucide-react';

const AuditCentre = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-nexus-heading flex items-center gap-2">
             <ShieldAlert className="text-nexus-primary" />
             Audit Centre
          </h1>
          <p className="text-sm text-nexus-textSecondary">Immutable log of system-wide actions and events.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-nexus-bg border border-nexus-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-nexus-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-nexus-surface dark:bg-nexus-hover">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-textSecondary" size={18} />
            <input 
              type="text" 
              placeholder="Search audit logs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-nexus-bg border border-nexus-border rounded-xl text-sm focus:outline-none focus:border-nexus-primary transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-nexus-bg border border-nexus-border rounded-xl text-sm font-medium hover:bg-nexus-surface dark:hover:bg-nexus-hover w-full sm:w-auto">
            <Filter size={16} /> Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-nexus-surface dark:bg-nexus-hover text-nexus-muted">
              <tr>
                <th className="px-6 py-4 font-medium">Time</th>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Department</th>
                <th className="px-6 py-4 font-medium">Action</th>
                <th className="px-6 py-4 font-medium">Module</th>
                <th className="px-6 py-4 font-medium">IP Address</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nexus-border dark:divide-nexus-card">
              <tr className="hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors">
                <td className="px-6 py-4 text-nexus-textSecondary">Today, 09:41 AM</td>
                <td className="px-6 py-4 font-medium text-nexus-heading">Admin User</td>
                <td className="px-6 py-4 text-nexus-muted">HQ</td>
                <td className="px-6 py-4 font-medium">Login Success</td>
                <td className="px-6 py-4 text-nexus-muted">Auth</td>
                <td className="px-6 py-4 text-nexus-textSecondary">192.168.1.1</td>
                <td className="px-6 py-4">
                  <span className="text-nexus-success dark:text-nexus-success font-medium text-xs bg-nexus-success/5 dark:bg-nexus-success/10 px-2 py-1 rounded">Success</span>
                </td>
              </tr>
              <tr className="hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors">
                <td className="px-6 py-4 text-nexus-textSecondary">Yesterday, 14:22 PM</td>
                <td className="px-6 py-4 font-medium text-nexus-heading">Derrick O.</td>
                <td className="px-6 py-4 text-nexus-muted">Finance</td>
                <td className="px-6 py-4 font-medium">Approved Invoice #INV-1029</td>
                <td className="px-6 py-4 text-nexus-muted">Invoices</td>
                <td className="px-6 py-4 text-nexus-textSecondary">10.0.0.42</td>
                <td className="px-6 py-4">
                  <span className="text-nexus-success dark:text-nexus-success font-medium text-xs bg-nexus-success/5 dark:bg-nexus-success/10 px-2 py-1 rounded">Success</span>
                </td>
              </tr>
              <tr className="hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors">
                <td className="px-6 py-4 text-nexus-textSecondary">Yesterday, 11:05 AM</td>
                <td className="px-6 py-4 font-medium text-nexus-heading">Unknown</td>
                <td className="px-6 py-4 text-nexus-muted">System</td>
                <td className="px-6 py-4 font-medium text-nexus-error">Failed Login Attempt</td>
                <td className="px-6 py-4 text-nexus-muted">Auth</td>
                <td className="px-6 py-4 text-nexus-textSecondary">45.22.19.102</td>
                <td className="px-6 py-4">
                  <span className="text-nexus-error font-medium text-xs bg-nexus-error/5 dark:bg-nexus-error/10 px-2 py-1 rounded">Failed</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditCentre;
