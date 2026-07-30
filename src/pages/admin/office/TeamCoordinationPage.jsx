import React, { useState, useEffect } from 'react';
import { officeService } from '../../../services/officeService';
import { Search, Filter, Users, CheckCircle, Clock, CheckSquare, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const DepartmentCard = ({ dept, tasks, members }) => {
  const deptTasks = tasks.filter(t => t.assigned_to?.department_id === dept.id);
  const deptMembers = members.filter(m => m.department_id === dept.id);
  
  const completed = deptTasks.filter(t => t.status === 'Completed').length;
  const pending = deptTasks.filter(t => t.status === 'Pending').length;
  const totalTasks = deptTasks.length;
  const progress = totalTasks === 0 ? 0 : Math.round((completed / totalTasks) * 100);

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm flex flex-col hover:border-orange-500/30 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{dept.name}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Head: {dept.head_id ? members.find(m => m.id === dept.head_id)?.full_name : 'Unassigned'}</p>
        </div>
        <div className="p-2 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 rounded-xl">
          <Users size={20} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6 flex-1">
        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            <Users size={14} /> Total Staff
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">{deptMembers.length}</div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
            <CheckSquare size={14} /> Total Tasks
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">{totalTasks}</div>
        </div>
        <div className="bg-green-50 dark:bg-green-500/10 p-3 rounded-xl border border-green-100 dark:border-green-500/20">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-500 text-xs font-medium mb-1">
            <CheckCircle size={14} /> Completed
          </div>
          <div className="text-xl font-bold text-green-700 dark:text-green-400">{completed}</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-500/10 p-3 rounded-xl border border-blue-100 dark:border-blue-500/20">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-500 text-xs font-medium mb-1">
            <Clock size={14} /> Pending
          </div>
          <div className="text-xl font-bold text-blue-700 dark:text-blue-400">{pending}</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
          <span>Task Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
          <div className="bg-orange-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
        <button 
          onClick={() => toast('Opening task assignment modal...')} 
          className="w-full flex items-center justify-center gap-2 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Assign Task
        </button>
      </div>
    </div>
  );
};

const TeamCoordinationPage = () => {
  const [departments, setDepartments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [deptRes, tasksRes, empRes] = await Promise.all([
        officeService.getDepartments(),
        officeService.getTasks(),
        officeService.getEmployees()
      ]);
      setDepartments(deptRes.data || []);
      setTasks(tasksRes.data || []);
      setMembers(empRes.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load team data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="animate-fade-in pb-10">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Team Coordination</h1>
          <p className="text-slate-500 dark:text-slate-400">Monitor department progress, staffing, and assign tasks directly to teams.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-orange-500/30">
          <Plus size={18} /> New Department
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : departments.length === 0 ? (
        <div className="text-center py-20 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <Users size={48} className="mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No departments found</h3>
          <p className="text-slate-500">Seed the database or create a new department.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map(dept => (
            <DepartmentCard 
              key={dept.id} 
              dept={dept} 
              tasks={tasks} 
              members={members} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamCoordinationPage;
