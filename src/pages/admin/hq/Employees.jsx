import React, { useState } from 'react';
import { Search, Filter, Download, MoreVertical, Edit2, Trash2 } from 'lucide-react';

const Employees = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-nexus-heading">Employees</h1>
          <p className="text-sm text-nexus-textSecondary">Manage HQ and department staff.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-nexus-surface dark:bg-nexus-hover hover:bg-nexus-surface dark:hover:bg-nexus-hover rounded-xl text-sm font-medium transition-colors">
            <Download size={16} /> Export
          </button>
          <button className="px-4 py-2 bg-nexus-primary hover:bg-nexus-primary-hover text-white rounded-xl text-sm font-medium transition-colors">
            + Add Employee
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-nexus-bg border border-nexus-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-nexus-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-nexus-surface dark:bg-nexus-hover">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-textSecondary" size={18} />
            <input 
              type="text" 
              placeholder="Search employees..." 
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
                <th className="px-6 py-4 font-medium">Employee</th>
                <th className="px-6 py-4 font-medium">Department</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Last Login</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nexus-border dark:divide-nexus-card">
              <tr className="hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-nexus-heading">Derrick O.</div>
                  <div className="text-xs text-nexus-textSecondary">financem@gmail.com</div>
                </td>
                <td className="px-6 py-4 text-nexus-muted">Finance</td>
                <td className="px-6 py-4 text-nexus-muted">Manager</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-nexus-success/10 text-nexus-success dark:bg-nexus-success/20 dark:text-nexus-success">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 text-nexus-muted">Today, 09:41 AM</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-nexus-textSecondary hover:text-nexus-muted dark:hover:text-nexus-textSecondary rounded-lg hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-nexus-heading">Sarah K.</div>
                  <div className="text-xs text-nexus-textSecondary">inventory@gmail.com</div>
                </td>
                <td className="px-6 py-4 text-nexus-muted">Inventory</td>
                <td className="px-6 py-4 text-nexus-muted">Staff</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-nexus-success/10 text-nexus-success dark:bg-nexus-success/20 dark:text-nexus-success">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 text-nexus-muted">Yesterday</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-nexus-textSecondary hover:text-nexus-muted dark:hover:text-nexus-textSecondary rounded-lg hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Employees;
