import { useState, useEffect } from 'react';
import { useAuth } from '../../../auth/AuthContext';
import { Users, Building2, Calendar, CheckSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import KPICard from '../../../components/admin/KPICard';
import DepartmentCard from '../../../components/admin/DepartmentCard';
import RecentActivity from '../../../components/admin/RecentActivity';
import NotificationPanel from '../../../components/admin/NotificationPanel';

const Dashboard = () => {
  const { user } = useAuth();
  
  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
            HQ Dashboard
          </h1>
          <p className="text-sm md:text-nexus-warningase text-nexus-textSecondary dark:text-nexus-textSecondary font-medium">
            Welcome back, {user?.full_name || 'Executive'}. Here's the company overview today.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Total Employees" value="124" icon={Users} color="blue" />
        <KPICard title="Active Departments" value="6" icon={Building2} color="indigo" />
        <KPICard title="Pending Tasks" value="42" icon={CheckSquare} color="orange" />
        <KPICard title="Meetings Today" value="8" icon={Calendar} color="purple" />
      </div>

      {/* Department Status */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Department Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DepartmentCard name="Finance" manager="Derrick O." status="Online" metrics={['3 Pending Tasks', 'KES 145K Revenue']} link="/finance/dashboard" />
          <DepartmentCard name="Inventory" manager="Sarah K." status="Warning" metrics={['12 Low Stock', '5 PO Requests']} link="/inventory/dashboard" />
          <DepartmentCard name="Dispatch" manager="John Doe" status="Busy" metrics={['42 Deliveries', '6 Delayed']} link="/dispatch/dashboard" />
          <DepartmentCard name="Customer Support" manager="Jane Smith" status="Online" metrics={['14 Open Tickets', '2 Escalated']} link="/profile/account" />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RecentActivity />
        </div>
        <div>
          <NotificationPanel />
        </div>
      </div>

      {/* Performance Dashboard */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Performance Summary</h2>
        <div className="bg-white dark:bg-nexus-bg border border-slate-200 dark:border-nexus-border rounded-2xl p-6 shadow-sm">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                 <p className="text-sm text-nexus-textSecondary">Orders Today</p>
                 <p className="text-xl font-bold dark:text-white">142</p>
              </div>
              <div>
                 <p className="text-sm text-nexus-textSecondary">Revenue Today</p>
                 <p className="text-xl font-bold text-green-500">KES 2.4M</p>
              </div>
              <div>
                 <p className="text-sm text-nexus-textSecondary">Deliveries Completed</p>
                 <p className="text-xl font-bold text-nexus-warninglue-500">89</p>
              </div>
              <div>
                 <p className="text-sm text-nexus-textSecondary">New Customers</p>
                 <p className="text-xl font-bold text-purple-500">24</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
