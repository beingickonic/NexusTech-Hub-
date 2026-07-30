import React, { useState } from 'react';
import { Search, Filter, UserPlus, Shield, Key, Lock, Edit2, ShieldAlert } from 'lucide-react';

const SystemUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
             <Shield className="text-orange-500" />
             Security Centre
          </h1>
          <p className="text-sm text-nexus-textSecondary">Manage system users, roles, sessions, and security protocols.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors">
          <UserPlus size={16} /> Create User
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
         <div className="bg-white dark:bg-nexus-bg border border-slate-200 dark:border-nexus-border rounded-2xl p-4 flex items-center justify-between">
            <div>
               <p className="text-sm text-nexus-textSecondary">Active Users</p>
               <p className="text-xl font-bold">142</p>
            </div>
            <div className="p-3 bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-500 rounded-xl">
               <Shield size={20} />
            </div>
         </div>
         <div className="bg-white dark:bg-nexus-bg border border-slate-200 dark:border-nexus-border rounded-2xl p-4 flex items-center justify-between">
            <div>
               <p className="text-sm text-nexus-textSecondary">Locked Accounts</p>
               <p className="text-xl font-bold">3</p>
            </div>
            <div className="p-3 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-500 rounded-xl">
               <Lock size={20} />
            </div>
         </div>
         <div className="bg-white dark:bg-nexus-bg border border-slate-200 dark:border-nexus-border rounded-2xl p-4 flex items-center justify-between">
            <div>
               <p className="text-sm text-nexus-textSecondary">MFA Enrolled</p>
               <p className="text-xl font-bold">98%</p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-500 rounded-xl">
               <Key size={20} />
            </div>
         </div>
      </div>

      <div className="bg-white dark:bg-nexus-bg border border-slate-200 dark:border-nexus-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-nexus-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50 dark:bg-white/5">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-textSecondary" size={18} />
            <input 
              type="text" 
              placeholder="Search users..." 
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
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Department</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">MFA</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900 dark:text-white">Admin User</div>
                  <div className="text-xs text-nexus-textSecondary">admin@gmail.com</div>
                </td>
                <td className="px-6 py-4"><span className="text-orange-500 font-medium">Super Admin</span></td>
                <td className="px-6 py-4 text-slate-600 dark:text-nexus-textSecondary">HQ</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 text-green-500"><ShieldAlert size={16} /></td>
                <td className="px-6 py-4 text-right">
                   <button className="text-nexus-textSecondary hover:text-orange-500 transition-colors mx-2"><Edit2 size={16}/></button>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900 dark:text-white">Derrick O.</div>
                  <div className="text-xs text-nexus-textSecondary">financem@gmail.com</div>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-nexus-textSecondary">Finance_Manager</td>
                <td className="px-6 py-4 text-slate-600 dark:text-nexus-textSecondary">Finance</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 text-green-500"><ShieldAlert size={16} /></td>
                <td className="px-6 py-4 text-right">
                   <button className="text-nexus-textSecondary hover:text-orange-500 transition-colors mx-2"><Edit2 size={16}/></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SystemUsers;
