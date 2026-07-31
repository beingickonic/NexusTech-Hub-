import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../auth/AuthContext';
import { officeService } from '../../../services/officeService';
import { supabase } from '../../../services/supabaseClient';
import { CheckSquare, MessageSquare, Calendar, AlertCircle, TrendingUp, Users, FolderOpen, LifeBuoy } from 'lucide-react';
import { getGreeting } from '../../../utils/helpers';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon, trend, colorClass }) => (
  <div className="bg-white/80 dark:bg-nexus-card/80 backdrop-blur-md p-6 rounded-2xl border border-nexus-border shadow-sm flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-nexus-muted mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-nexus-heading">{value}</h3>
      {trend && (
        <p className="text-xs font-medium text-nexus-success dark:text-nexus-success mt-2 flex items-center gap-1">
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
          <h1 className="text-2xl md:text-3xl font-extrabold text-nexus-heading mb-1">
            {getGreeting(user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Admin')}
          </h1>
          <p className="text-sm md:text-base text-nexus-muted font-medium">
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
          colorClass="bg-nexus-info/10 text-nexus-info dark:bg-nexus-info/10 dark:text-nexus-info" 
        />
        <StatCard 
          title="Meetings Today" 
          value={stats.meetingsToday} 
          icon={Calendar} 
          colorClass="bg-info/10 text-info dark:bg-info/100/10 dark:text-info" 
        />
        <StatCard 
          title="Unread Messages" 
          value={stats.unreadMessages} 
          icon={MessageSquare} 
          trend="3 new"
          colorClass="bg-nexus-success/5 text-nexus-success dark:bg-nexus-success/10 dark:text-nexus-success" 
        />
        <StatCard 
          title="Low Supplies" 
          value={stats.lowSupplies} 
          icon={AlertCircle} 
          colorClass="bg-nexus-error/5 text-nexus-error dark:bg-nexus-error/10 dark:text-nexus-error" 
        />
        <StatCard 
          title="Visitors Today" 
          value={stats.visitorsToday} 
          icon={Users} 
          colorClass="bg-info/10 text-info dark:bg-info/100/10 dark:text-info" 
        />
        <StatCard 
          title="Open Requests" 
          value={stats.openRequests} 
          icon={LifeBuoy} 
          colorClass="bg-error/10 text-error dark:bg-error/100/10 dark:text-error" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Main Panel */}
        <div className="lg:col-span-2 bg-white/80 dark:bg-nexus-card/80 backdrop-blur-md rounded-2xl border border-nexus-border p-6 shadow-sm">
          <h3 className="text-lg font-bold text-nexus-heading mb-4">Recent Announcements</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-nexus-primary/10 dark:bg-nexus-primary/10 border border-nexus-primary/15 dark:border-nexus-primary/20">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-nexus-primary">Quarterly Review Meeting</h4>
                <span className="text-xs font-medium text-nexus-primary dark:text-nexus-primary">High Priority</span>
              </div>
              <p className="text-sm text-nexus-primary/80">Please ensure all Q3 reports are submitted to your managers by Friday. The all-hands meeting is scheduled for next Monday.</p>
            </div>
            <div className="p-4 rounded-xl bg-nexus-surface/50 border border-nexus-border">
              <h4 className="font-semibold text-nexus-heading mb-1">Office Maintenance</h4>
              <p className="text-sm text-nexus-muted">The HVAC system on the 3rd floor will be undergoing maintenance this weekend.</p>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="bg-white/80 dark:bg-nexus-card/80 backdrop-blur-md rounded-2xl border border-nexus-border p-6 shadow-sm">
          <h3 className="text-lg font-bold text-nexus-heading mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button onClick={() => toast('Opening task modal...')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-nexus-surface/50 hover:bg-nexus-surface dark:hover:bg-nexus-hover border border-nexus-border transition-colors text-left text-sm font-medium text-nexus-muted">
              <div className="p-2 bg-nexus-info/10 dark:bg-nexus-info/20 text-nexus-info rounded-lg">
                <CheckSquare size={16} />
              </div>
              Create New Task
            </button>
            <button onClick={() => toast('Opening schedule modal...')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-nexus-surface/50 hover:bg-nexus-surface dark:hover:bg-nexus-hover border border-nexus-border transition-colors text-left text-sm font-medium text-nexus-muted">
              <div className="p-2 bg-info/10 dark:bg-info/100/20 text-info dark:text-info rounded-lg">
                <Calendar size={16} />
              </div>
              Schedule Meeting
            </button>
            <button onClick={() => toast('Opening document upload...')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-nexus-surface/50 hover:bg-nexus-surface dark:hover:bg-nexus-hover border border-nexus-border transition-colors text-left text-sm font-medium text-nexus-muted">
              <div className="p-2 bg-nexus-primary/15 dark:bg-nexus-primary/20 text-nexus-primary rounded-lg">
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
