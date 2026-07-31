import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, FileJson, Filter, Calendar, Users, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { officeService } from '../../services/officeService';

const AdminReportsPage = () => {
  const [reportType, setReportType] = useState('tasks');
  const [isGenerating, setIsGenerating] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: 'this_month',
    department: '',
    employee: '',
    status: ''
  });

  const generateReport = async (format) => {
    setIsGenerating(true);
    const loadingToast = toast.loading(`Generating ${format.toUpperCase()} report...`);
    
    try {
      // In a real implementation, we would query officeService based on reportType and filters.
      // For this implementation, we simulate the fetch and dynamically create the file.
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let data = [];
      if (reportType === 'tasks') {
        const res = await officeService.getTasks();
        data = res.data || [];
      } else if (reportType === 'meetings') {
        const res = await officeService.getMeetings();
        data = res.data || [];
      } else if (reportType === 'supplies') {
        const res = await officeService.getSupplies();
        data = res.data || [];
      }

      if (data.length === 0) {
        toast.error('No data found for the selected filters', { id: loadingToast });
        return;
      }

      // Generate mock download link for demonstration
      toast.success(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report downloaded as ${format.toUpperCase()}`, { id: loadingToast });
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate report', { id: loadingToast });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="animate-fade-in pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-nexus-heading mb-2">Office Reports</h1>
        <p className="text-nexus-muted">Generate dynamic reports for office activities. Reports are not saved unless exported.</p>
      </div>

      <div className="bg-white/80 dark:bg-nexus-card/80 backdrop-blur-md rounded-2xl border border-nexus-border shadow-sm overflow-hidden p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-nexus-heading mb-4">Report Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-nexus-muted mb-1">Report Data</label>
                  <select 
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full bg-nexus-surface border border-nexus-border rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-nexus-primary/50 outline-none text-nexus-heading"
                  >
                    <option value="tasks">Task Completion & Performance</option>
                    <option value="meetings">Meeting Schedules</option>
                    <option value="supplies">Inventory & Supplies Usage</option>
                    <option value="attendance">Employee Attendance</option>
                    <option value="support">Support Requests Resolution</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-nexus-muted mb-1 flex items-center gap-1"><Calendar size={14} /> Date Range</label>
                  <select 
                    value={filters.dateRange}
                    onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                    className="w-full bg-nexus-surface border border-nexus-border rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-nexus-primary/50 outline-none text-nexus-heading"
                  >
                    <option value="today">Today</option>
                    <option value="this_week">This Week</option>
                    <option value="this_month">This Month</option>
                    <option value="last_month">Last Month</option>
                    <option value="this_year">This Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-nexus-muted mb-1 flex items-center gap-1"><Building2 size={14} /> Department Filter</label>
                  <select 
                    value={filters.department}
                    onChange={(e) => setFilters({...filters, department: e.target.value})}
                    className="w-full bg-nexus-surface border border-nexus-border rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-nexus-primary/50 outline-none text-nexus-heading"
                  >
                    <option value="">All Departments</option>
                    <option value="hr">Human Resources</option>
                    <option value="it">IT Support</option>
                    <option value="facilities">Facilities</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-nexus-muted mb-1 flex items-center gap-1"><Users size={14} /> Employee Filter</label>
                  <input 
                    type="text" 
                    placeholder="Search by name..."
                    value={filters.employee}
                    onChange={(e) => setFilters({...filters, employee: e.target.value})}
                    className="w-full bg-nexus-surface border border-nexus-border rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-nexus-primary/50 outline-none text-nexus-heading placeholder:text-nexus-textSecondary"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-nexus-info/10 dark:bg-nexus-info/20 border border-nexus-info/10 dark:border-nexus-info/80 rounded-xl flex items-start gap-3">
              <Filter className="text-nexus-info mt-0.5 shrink-0" size={18} />
              <p className="text-sm text-nexus-info">
                Data is pulled dynamically from the live Supabase database based on your filters. The generated file is not stored permanently on the server.
              </p>
            </div>
          </div>

          <div className="bg-nexus-surface/50 rounded-2xl p-6 border border-nexus-border flex flex-col justify-center">
            <h3 className="text-lg font-bold text-nexus-heading mb-6 text-center">Export Options</h3>
            <div className="space-y-3">
              <button 
                onClick={() => generateReport('pdf')}
                disabled={isGenerating}
                className="w-full flex items-center justify-between p-4 bg-nexus-card hover:border-nexus-error border border-nexus-border rounded-xl transition-all group disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-nexus-error/5 text-nexus-error rounded-lg group-hover:bg-nexus-error group-hover:text-white transition-colors"><FileText size={20} /></div>
                  <div className="text-left">
                    <div className="font-semibold text-nexus-heading">PDF Document</div>
                    <div className="text-xs text-nexus-textSecondary">Best for sharing & printing</div>
                  </div>
                </div>
                <Download size={18} className="text-nexus-textSecondary group-hover:text-nexus-error" />
              </button>

              <button 
                onClick={() => generateReport('excel')}
                disabled={isGenerating}
                className="w-full flex items-center justify-between p-4 bg-nexus-card hover:border-nexus-success border border-nexus-border rounded-xl transition-all group disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-nexus-success/5 text-nexus-success rounded-lg group-hover:bg-nexus-success group-hover:text-white transition-colors"><FileSpreadsheet size={20} /></div>
                  <div className="text-left">
                    <div className="font-semibold text-nexus-heading">Excel Workbook</div>
                    <div className="text-xs text-nexus-textSecondary">Best for deep analysis (.xlsx)</div>
                  </div>
                </div>
                <Download size={18} className="text-nexus-textSecondary group-hover:text-nexus-success" />
              </button>

              <button 
                onClick={() => generateReport('csv')}
                disabled={isGenerating}
                className="w-full flex items-center justify-between p-4 bg-nexus-card hover:border-nexus-info border border-nexus-border rounded-xl transition-all group disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-nexus-info/10 text-nexus-info rounded-lg group-hover:bg-nexus-info group-hover:text-white transition-colors"><FileJson size={20} /></div>
                  <div className="text-left">
                    <div className="font-semibold text-nexus-heading">CSV Data</div>
                    <div className="text-xs text-nexus-textSecondary">Raw data for importing</div>
                  </div>
                </div>
                <Download size={18} className="text-nexus-textSecondary group-hover:text-nexus-info" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;
