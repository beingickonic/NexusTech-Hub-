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
    <div className="bg-white/80 dark:bg-nexus-card/80 backdrop-blur-md rounded-2xl border border-nexus-border p-6 shadow-sm flex flex-col hover:border-nexus-primary/30 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-nexus-heading">{dept.name}</h3>
          <p className="text-sm text-nexus-muted">Head: {dept.head_id ? members.find(m => m.id === dept.head_id)?.full_name : 'Unassigned'}</p>
        </div>
        <div className="p-2 bg-nexus-primary/10 dark:bg-nexus-primary/10 text-nexus-primary dark:text-nexus-primary rounded-xl">
          <Users size={20} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6 flex-1">
        <div className="bg-nexus-surface/50 p-3 rounded-xl border border-nexus-border">
          <div className="flex items-center gap-2 text-nexus-muted text-xs font-medium mb-1">
            <Users size={14} /> Total Staff
          </div>
          <div className="text-xl font-bold text-nexus-heading">{deptMembers.length}</div>
        </div>
        <div className="bg-nexus-surface/50 p-3 rounded-xl border border-nexus-border">
          <div className="flex items-center gap-2 text-nexus-muted text-xs font-medium mb-1">
            <CheckSquare size={14} /> Total Tasks
          </div>
          <div className="text-xl font-bold text-nexus-heading">{totalTasks}</div>
        </div>
        <div className="bg-nexus-success/5 dark:bg-nexus-success/10 p-3 rounded-xl border border-nexus-success/10 dark:border-nexus-success/20">
          <div className="flex items-center gap-2 text-nexus-success dark:text-nexus-success text-xs font-medium mb-1">
            <CheckCircle size={14} /> Completed
          </div>
          <div className="text-xl font-bold text-nexus-success">{completed}</div>
        </div>
        <div className="bg-nexus-info/10 dark:bg-nexus-info/10 p-3 rounded-xl border border-nexus-info/10 dark:border-nexus-info/20">
          <div className="flex items-center gap-2 text-nexus-info dark:text-nexus-info text-xs font-medium mb-1">
            <Clock size={14} /> Pending
          </div>
          <div className="text-xl font-bold text-nexus-info">{pending}</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs font-medium text-nexus-muted mb-1">
          <span>Task Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-nexus-surface rounded-full h-2">
          <div className="bg-nexus-primary h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-nexus-border">
        <button 
          onClick={() => toast('Opening task assignment modal...')} 
          className="w-full flex items-center justify-center gap-2 py-2 bg-nexus-surface hover:bg-nexus-surface dark:bg-nexus-card dark:hover:bg-nexus-hover text-nexus-muted rounded-lg text-sm font-medium transition-colors"
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
          <h1 className="text-3xl font-extrabold text-nexus-heading mb-2">Team Coordination</h1>
          <p className="text-nexus-muted">Monitor department progress, staffing, and assign tasks directly to teams.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-nexus-primary hover:bg-nexus-primary-hover text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-primary/30">
          <Plus size={18} /> New Department
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nexus-primary"></div>
        </div>
      ) : departments.length === 0 ? (
        <div className="text-center py-20 bg-white/50 dark:bg-nexus-card rounded-2xl border border-dashed border-nexus-border">
          <Users size={48} className="mx-auto text-nexus-textSecondary mb-4" />
          <h3 className="text-lg font-bold text-nexus-heading mb-1">No departments found</h3>
          <p className="text-nexus-textSecondary">Seed the database or create a new department.</p>
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
