import React, { useState } from 'react';
import { Search, Filter, UserPlus, Shield, Key, Lock, Edit2, ShieldAlert } from 'lucide-react';

const SystemUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-nexus-heading flex items-center gap-2">
             <Shield className="text-nexus-primary" />
             Security Centre
          </h1>
          <p className="text-sm text-nexus-textSecondary">Manage system users, roles, sessions, and security protocols.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-nexus-primary hover:bg-nexus-primary-hover text-white rounded-xl text-sm font-medium transition-colors">
          <UserPlus size={16} /> Create User
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
         <div className="bg-white dark:bg-nexus-bg border border-nexus-border rounded-2xl p-4 flex items-center justify-between">
            <div>
               <p className="text-sm text-nexus-textSecondary">Active Users</p>
               <p className="text-xl font-bold">142</p>
            </div>
            <div className="p-3 bg-nexus-success/5 text-nexus-success dark:bg-nexus-success/10 dark:text-nexus-success rounded-xl">
               <Shield size={20} />
            </div>
         </div>
         <div className="bg-white dark:bg-nexus-bg border border-nexus-border rounded-2xl p-4 flex items-center justify-between">
            <div>
               <p className="text-sm text-nexus-textSecondary">Locked Accounts</p>
               <p className="text-xl font-bold">3</p>
            </div>
            <div className="p-3 bg-nexus-error/5 text-nexus-error dark:bg-nexus-error/10 dark:text-nexus-error rounded-xl">
               <Lock size={20} />
            </div>
         </div>
         <div className="bg-white dark:bg-nexus-bg border border-nexus-border rounded-2xl p-4 flex items-center justify-between">
            <div>
               <p className="text-sm text-nexus-textSecondary">MFA Enrolled</p>
               <p className="text-xl font-bold">98%</p>
            </div>
            <div className="p-3 bg-info/10 text-info dark:bg-info/100/10 dark:text-info rounded-xl">
               <Key size={20} />
            </div>
         </div>
      </div>

      <div className="bg-white dark:bg-nexus-bg border border-nexus-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-nexus-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-nexus-surface dark:bg-nexus-hover">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-textSecondary" size={18} />
            <input 
              type="text" 
              placeholder="Search users..." 
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
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Department</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">MFA</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nexus-border dark:divide-nexus-card">
              <tr className="hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-nexus-heading">Admin User</div>
                  <div className="text-xs text-nexus-textSecondary">admin@gmail.com</div>
                </td>
                <td className="px-6 py-4"><span className="text-nexus-primary font-medium">Super Admin</span></td>
                <td className="px-6 py-4 text-nexus-muted">HQ</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-nexus-success/10 text-nexus-success dark:bg-nexus-success/20 dark:text-nexus-success">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 text-nexus-success"><ShieldAlert size={16} /></td>
                <td className="px-6 py-4 text-right">
                   <button className="text-nexus-textSecondary hover:text-nexus-primary transition-colors mx-2"><Edit2 size={16}/></button>
                </td>
              </tr>
              <tr className="hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-nexus-heading">Derrick O.</div>
                  <div className="text-xs text-nexus-textSecondary">financem@gmail.com</div>
                </td>
                <td className="px-6 py-4 text-nexus-muted">Finance_Manager</td>
                <td className="px-6 py-4 text-nexus-muted">Finance</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-nexus-success/10 text-nexus-success dark:bg-nexus-success/20 dark:text-nexus-success">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 text-nexus-success"><ShieldAlert size={16} /></td>
                <td className="px-6 py-4 text-right">
                   <button className="text-nexus-textSecondary hover:text-nexus-primary transition-colors mx-2"><Edit2 size={16}/></button>
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
