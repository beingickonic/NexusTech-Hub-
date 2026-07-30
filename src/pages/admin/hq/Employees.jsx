import React, { useState } from 'react';
import { Search, Filter, Download, MoreVertical, Edit2, Trash2 } from 'lucide-react';

const Employees = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Employees</h1>
          <p className="text-sm text-nexus-textSecondary">Manage HQ and department staff.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl text-sm font-medium transition-colors">
            <Download size={16} /> Export
          </button>
          <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors">
            + Add Employee
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-nexus-bg border border-slate-200 dark:border-nexus-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-nexus-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50 dark:bg-white/5">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-textSecondary" size={18} />
            <input 
              type="text" 
              placeholder="Search employees..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-nexus-bg border border-slate-200 dark:border-nexus-border rounded-xl text-sm focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-nexus-bg border border-slate-200 dark:border-nexus-border rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 w-full sm:w-auto">
            <Filter size={16} /> Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-white/5 text-nexus-textSecondary dark:text-nexus-textSecondary">
              <tr>
                <th className="px-6 py-4 font-medium">Employee</th>
                <th className="px-6 py-4 font-medium">Department</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Last Login</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900 dark:text-white">Derrick O.</div>
                  <div className="text-xs text-nexus-textSecondary">financem@gmail.com</div>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-nexus-textSecondary">Finance</td>
                <td className="px-6 py-4 text-slate-600 dark:text-nexus-textSecondary">Manager</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-nexus-textSecondary">Today, 09:41 AM</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-nexus-textSecondary hover:text-slate-600 dark:hover:text-nexus-textSecondary rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900 dark:text-white">Sarah K.</div>
                  <div className="text-xs text-nexus-textSecondary">inventory@gmail.com</div>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-nexus-textSecondary">Inventory</td>
                <td className="px-6 py-4 text-slate-600 dark:text-nexus-textSecondary">Staff</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-nexus-textSecondary">Yesterday</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-nexus-textSecondary hover:text-slate-600 dark:hover:text-nexus-textSecondary rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
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
