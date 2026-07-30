import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../auth/AuthContext';
import { officeService } from '../../../services/officeService';
import { supabase } from '../../../services/supabaseClient';
import { CheckSquare, MessageSquare, Calendar, AlertCircle, TrendingUp, Users, FolderOpen, LifeBuoy } from 'lucide-react';
import { getGreeting } from '../../../utils/helpers';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon, trend, colorClass }) => (
  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
      {trend && (
        <p className="text-xs font-medium text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
          <TrendingUp size={12} /> {trend}
        </p>
      )}
    </div>
    <div className={`p-3 rounded-xl ${colorClass}`}>
      <Icon size={20} />
    </div>
  </div>
);

const OfficeDashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await officeService.getDashboardStats();
        setStats(stats);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
        toast.error("Failed to load live KPIs");
      }
    };
    fetchStats();

    // Subscribe to realtime updates for major tables
    const taskSub = supabase.channel('dashboard-tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'office_tasks' }, () => fetchStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'office_messages' }, () => fetchStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'office_support_requests' }, () => fetchStats())
      .subscribe();

    return () => {
      supabase.removeChannel(taskSub);
    };
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-4 md:space-y-8 pb-10 px-0 md:px-0">
      {/* Dashboard Hero */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 md:gap-4 px-1 md:px-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
            {getGreeting(user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Admin')}
          </h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium">
            Here's your office administration overview for today.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          title="Pending Tasks" 
          value={stats.pendingTasks} 
          icon={CheckSquare} 
          trend="2 completed today"
          colorClass="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-500" 
        />
        <StatCard 
          title="Meetings Today" 
          value={stats.meetingsToday} 
          icon={Calendar} 
          colorClass="bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-500" 
        />
        <StatCard 
          title="Unread Messages" 
          value={stats.unreadMessages} 
          icon={MessageSquare} 
          trend="3 new"
          colorClass="bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-500" 
        />
        <StatCard 
          title="Low Supplies" 
          value={stats.lowSupplies} 
          icon={AlertCircle} 
          colorClass="bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-500" 
        />
        <StatCard 
          title="Visitors Today" 
          value={stats.visitorsToday} 
          icon={Users} 
          colorClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-500" 
        />
        <StatCard 
          title="Open Requests" 
          value={stats.openRequests} 
          icon={LifeBuoy} 
          colorClass="bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Main Panel */}
        <div className="lg:col-span-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Announcements</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-orange-800 dark:text-orange-400">Quarterly Review Meeting</h4>
                <span className="text-xs font-medium text-orange-600 dark:text-orange-500">High Priority</span>
              </div>
              <p className="text-sm text-orange-700/80 dark:text-orange-300/80">Please ensure all Q3 reports are submitted to your managers by Friday. The all-hands meeting is scheduled for next Monday.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Office Maintenance</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">The HVAC system on the 3rd floor will be undergoing maintenance this weekend.</p>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button onClick={() => toast('Opening task modal...')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 transition-colors text-left text-sm font-medium text-slate-700 dark:text-slate-300">
              <div className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg">
                <CheckSquare size={16} />
              </div>
              Create New Task
            </button>
            <button onClick={() => toast('Opening schedule modal...')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 transition-colors text-left text-sm font-medium text-slate-700 dark:text-slate-300">
              <div className="p-2 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg">
                <Calendar size={16} />
              </div>
              Schedule Meeting
            </button>
            <button onClick={() => toast('Opening document upload...')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 transition-colors text-left text-sm font-medium text-slate-700 dark:text-slate-300">
              <div className="p-2 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-lg">
                <FolderOpen size={16} />
              </div>
              Upload Document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficeDashboardPage;
