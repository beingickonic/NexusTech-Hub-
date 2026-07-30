import React, { useState, useEffect } from 'react';
import { officeService } from '../../../services/officeService';
import { Search, Filter, Mail, Phone, MapPin, Briefcase, Building2, User, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const EmployeeCard = ({ employee }) => {
  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md hover:border-orange-500/30">
      <div className="p-5 flex flex-col items-center text-center border-b border-slate-100 dark:border-slate-700/50 relative">
        <div className="absolute top-4 right-4 flex gap-1">
          <span className={`w-2.5 h-2.5 rounded-full ${employee.attendance_status === 'Present' ? 'bg-green-500' : employee.attendance_status === 'Leave' ? 'bg-yellow-500' : 'bg-red-500'}`} title={employee.attendance_status}></span>
        </div>
        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-700 mb-3 overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm flex items-center justify-center">
          {employee.avatar_url ? (
            <img src={employee.avatar_url} alt={employee.full_name} className="w-full h-full object-cover" />
          ) : (
            <User size={32} className="text-slate-400" />
          )}
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">{employee.full_name}</h3>
        <p className="text-sm font-medium text-orange-600 dark:text-orange-500">{employee.job_title || 'Staff Member'}</p>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-300 mt-2">
          <Building2 size={12} />
          {employee.department?.name || 'Unassigned'}
        </div>
      </div>
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-center">
        <a href={`mailto:${employee.email}`} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 hover:text-orange-500 transition-colors">
          <Mail size={16} className="text-slate-400" />
          <span className="truncate">{employee.email}</span>
        </a>
        {employee.phone && (
          <a href={`tel:${employee.phone}`} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 hover:text-orange-500 transition-colors">
            <Phone size={16} className="text-slate-400" />
            <span>{employee.phone}</span>
          </a>
        )}
        {employee.office_extension && (
          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
            <Phone size={16} className="text-slate-400" />
            <span>Ext: {employee.office_extension}</span>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/30 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 font-medium">
        <span>{employee.employment_status || 'Active'}</span>
        <button onClick={() => toast('Opening profile modal...', { icon: '👤' })} className="text-orange-600 hover:text-orange-700 font-semibold transition-colors">View Profile</button>
      </div>
    </div>
  );
};

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [empRes, deptRes] = await Promise.all([
        officeService.getEmployees(),
        officeService.getDepartments()
      ]);
      setEmployees(empRes.data || []);
      setDepartments(deptRes.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load employees.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = (emp.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                          (emp.job_title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (emp.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter ? emp.department_id === deptFilter : true;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="animate-fade-in pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Employee Directory</h1>
        <p className="text-slate-500 dark:text-slate-400">View and manage staff profiles, roles, and contact information across all departments.</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:max-w-md">
          <input 
            type="text"
            placeholder="Search by name, role, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none transition-all placeholder:text-slate-400 text-slate-900 dark:text-white"
          />
          <Search size={18} className="absolute left-3 top-3 text-slate-400" />
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <select 
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full md:w-auto bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none transition-all text-slate-900 dark:text-white appearance-none"
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors border border-slate-200 dark:border-slate-600">
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="text-center py-20 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <Users size={48} className="mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No employees found</h3>
          <p className="text-slate-500">Try adjusting your search or department filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredEmployees.map(emp => (
            <EmployeeCard key={emp.id} employee={emp} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;
