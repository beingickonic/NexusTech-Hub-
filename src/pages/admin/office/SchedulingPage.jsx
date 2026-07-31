import React, { useState, useEffect } from 'react';
import { officeService } from '../../../services/officeService';
import { Search, Plus, Calendar as CalendarIcon, List, Clock, Video, MapPin, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const SchedulingPage = () => {
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMeetings = async () => {
    setIsLoading(true);
    try {
      const { data } = await officeService.getMeetings();
      setMeetings(data || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load meetings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Ongoing': return 'bg-nexus-info/10 text-nexus-info dark:bg-nexus-info/10 dark:text-nexus-info border-nexus-info/20';
      case 'Completed': return 'bg-nexus-success/5 text-nexus-success dark:bg-nexus-success/10 dark:text-nexus-success border-nexus-success/20 dark:border-nexus-success/20';
      case 'Cancelled': return 'bg-nexus-error/5 text-nexus-error dark:bg-nexus-error/10 dark:text-nexus-error border-nexus-error/20 dark:border-nexus-error/20';
      default: return 'bg-nexus-surface text-nexus-heading dark:bg-nexus-card dark:text-nexus-textSecondary border-nexus-border'; // Scheduled
    }
  };

  const filteredMeetings = meetings.filter(m => 
    (m.title?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const today = new Date().toISOString().split('T')[0];
  const todaysMeetings = filteredMeetings.filter(m => m.date?.startsWith(today));
  const upcomingMeetings = filteredMeetings.filter(m => m.date > today);

  const renderMeetingCard = (meeting) => (
    <div key={meeting.id} className="bg-white/80 dark:bg-nexus-card/80 backdrop-blur-md p-5 rounded-2xl border border-nexus-border shadow-sm flex flex-col hover:border-nexus-primary/30 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-nexus-heading line-clamp-1">{meeting.title}</h3>
        <span className={`px-2 py-1 text-[10px] font-bold rounded-md border uppercase tracking-wider ${getStatusColor(meeting.status)}`}>
          {meeting.status}
        </span>
      </div>
      <div className="space-y-2 mb-4 flex-1">
        <div className="flex items-center gap-2 text-sm text-nexus-muted">
          <Clock size={16} className="text-nexus-primary" />
          {new Date(meeting.date).toLocaleDateString()} at {meeting.start_time?.substring(0, 5)} - {meeting.end_time?.substring(0, 5)}
        </div>
        <div className="flex items-center gap-2 text-sm text-nexus-muted">
          {meeting.location?.toLowerCase().includes('http') || meeting.location?.toLowerCase().includes('zoom') || meeting.location?.toLowerCase().includes('meet') ? (
            <Video size={16} className="text-nexus-info" />
          ) : (
            <MapPin size={16} className="text-nexus-success" />
          )}
          <span className="truncate">{meeting.location || 'TBA'}</span>
        </div>
      </div>
      <div className="pt-4 border-t border-nexus-border flex justify-between items-center">
        <div className="flex items-center gap-1.5 text-xs font-medium text-nexus-textSecondary">
          <Users size={14} /> Participants
        </div>
        <button onClick={() => toast('Edit meeting modal')} className="text-nexus-primary hover:text-nexus-primary font-semibold text-xs">Manage</button>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in pb-10">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-nexus-heading mb-2">Scheduling & Meetings</h1>
          <p className="text-nexus-muted">Manage office schedules, book rooms, and coordinate teams.</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-nexus-surface p-1 rounded-xl flex">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg flex items-center justify-center transition-all ${viewMode === 'list' ? 'bg-white dark:bg-nexus-card shadow-sm text-nexus-primary' : 'text-nexus-textSecondary hover:text-nexus-heading dark:hover:text-nexus-textSecondary'}`}
              title="List View"
            >
              <List size={18} />
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded-lg flex items-center justify-center transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-nexus-card shadow-sm text-nexus-primary' : 'text-nexus-textSecondary hover:text-nexus-heading dark:hover:text-nexus-textSecondary'}`}
              title="Calendar View"
            >
              <CalendarIcon size={18} />
            </button>
          </div>
          <button onClick={() => toast('Create Meeting Modal')} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-nexus-primary hover:bg-nexus-primary-hover text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-primary/30">
            <Plus size={18} /> New Meeting
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="bg-white/80 dark:bg-nexus-card/80 backdrop-blur-md rounded-2xl border border-nexus-border p-8 shadow-sm text-center">
          <CalendarIcon size={48} className="mx-auto text-nexus-textSecondary dark:text-nexus-muted mb-4" />
          <h3 className="text-lg font-bold text-nexus-heading mb-2">Calendar View</h3>
          <p className="text-nexus-textSecondary mb-6 max-w-md mx-auto">The full calendar grid is currently being integrated with Google Calendar and Outlook APIs. Please use the list view in the meantime.</p>
          <button onClick={() => setViewMode('list')} className="px-4 py-2 bg-nexus-surface text-nexus-muted font-medium rounded-lg">Return to List View</button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="relative max-w-md mb-6">
            <input 
              type="text"
              placeholder="Search meetings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-nexus-card border border-nexus-border rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-nexus-primary/50 outline-none text-nexus-heading shadow-sm"
            />
            <Search size={18} className="absolute left-3 top-3 text-nexus-textSecondary" />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nexus-primary"></div>
            </div>
          ) : (
            <>
              <section>
                <h2 className="text-lg font-bold text-nexus-heading mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-nexus-primary"></span> Today's Schedule
                </h2>
                {todaysMeetings.length === 0 ? (
                  <div className="p-6 rounded-2xl border border-dashed border-nexus-border text-center text-nexus-textSecondary">No meetings scheduled for today.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {todaysMeetings.map(renderMeetingCard)}
                  </div>
                )}
              </section>

              <section>
                <h2 className="text-lg font-bold text-nexus-heading mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-nexus-info"></span> Upcoming Meetings
                </h2>
                {upcomingMeetings.length === 0 ? (
                  <div className="p-6 rounded-2xl border border-dashed border-nexus-border text-center text-nexus-textSecondary">No upcoming meetings scheduled.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {upcomingMeetings.map(renderMeetingCard)}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SchedulingPage;
