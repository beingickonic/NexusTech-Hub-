import React from 'react';
import { Download, FileText, BarChart2, Users, Briefcase, Truck } from 'lucide-react';

const Reports = () => {
  const reports = [
    { title: 'Company Summary', icon: Building2, desc: 'High-level business overview' },
    { title: 'Finance Summary (View Only)', icon: BarChart2, desc: 'Revenue, expenses, and cash flow' },
    { title: 'Inventory Summary', icon: Package, desc: 'Stock levels and valuation' },
    { title: 'Dispatch Summary', icon: Truck, desc: 'Delivery performance metrics' },
    { title: 'HR Summary', icon: Users, desc: 'Headcount and turnover' },
    { title: 'Employee Attendance', icon: Clock, desc: 'Clock-in/out and leave records' },
    { title: 'Department Performance', icon: Briefcase, desc: 'KPI tracking by department' },
    { title: 'Task Completion', icon: CheckSquare, desc: 'Company-wide task analytics' },
  ];

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-nexus-heading">Executive Reporting Centre</h1>
          <p className="text-sm text-nexus-textSecondary">Access high-level management reports across all departments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reports.map((report, idx) => (
          <div key={idx} className="bg-white dark:bg-nexus-bg border border-nexus-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-nexus-surface text-nexus-muted dark:bg-nexus-hover dark:text-nexus-textSecondary rounded-xl group-hover:bg-nexus-primary/10 group-hover:text-nexus-primary transition-colors">
                  <report.icon size={20} />
               </div>
               <button className="text-nexus-textSecondary hover:text-nexus-primary transition-colors" title="Export">
                  <Download size={18} />
               </button>
            </div>
            <h3 className="font-bold text-nexus-heading mb-1">{report.title}</h3>
            <p className="text-sm text-nexus-muted">{report.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Simple stubs for icons not imported in this exact scope to prevent build errors
const Building2 = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>;
const Package = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>;
const Clock = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const CheckSquare = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;

export default Reports;
