import React from 'react';
import DepartmentCard from '../../../components/admin/DepartmentCard';

const Departments = () => {
  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Department Overview</h1>
        <p className="text-sm text-nexus-textSecondary">Monitor operational status across all business units.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DepartmentCard 
          name="Finance" 
          manager="Derrick O." 
          status="Online" 
          metrics={['12 Employees', '3 Pending Tasks', 'KES 145K Revenue Today', '0 Open Issues']} 
          link="/finance/dashboard" 
        />
        <DepartmentCard 
          name="Inventory" 
          manager="Sarah K." 
          status="Warning" 
          metrics={['24 Employees', '5 PO Requests', '12 Low Stock Items', '1 Open Issue']} 
          link="/inventory/dashboard" 
        />
        <DepartmentCard 
          name="Dispatch" 
          manager="John Doe" 
          status="Busy" 
          metrics={['45 Employees', '42 Deliveries Today', '6 Delayed', '2 Open Issues']} 
          link="/dispatch/dashboard" 
        />
        <DepartmentCard 
          name="Office (Admin)" 
          manager="Admin User" 
          status="Online" 
          metrics={['8 Employees', '14 Active Visitors', '3 Pending Approvals', '0 Open Issues']} 
          link="/admin/dashboard" 
        />
        <DepartmentCard 
          name="Customer Support" 
          manager="Jane Smith" 
          status="Online" 
          metrics={['18 Employees', '14 Open Tickets', '2 Escalated', 'Avg. Resp: 12m']} 
          link="/profile/account" 
        />
      </div>
    </div>
  );
};

export default Departments;
