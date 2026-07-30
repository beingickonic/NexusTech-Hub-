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
      case 'Ongoing': return 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-500 border-blue-200 dark:border-blue-500/20';
      case 'Completed': return 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-500 border-green-200 dark:border-green-500/20';
      case 'Cancelled': return 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-500 border-red-200 dark:border-red-500/20';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'; // Scheduled
    }
  };

  const filteredMeetings = meetings.filter(m => 
    (m.title?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const today = new Date().toISOString().split('T')[0];
  const todaysMeetings = filteredMeetings.filter(m => m.date?.startsWith(today));
  const upcomingMeetings = filteredMeetings.filter(m => m.date > today);

  const renderMeetingCard = (meeting) => (
    <div key={meeting.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col hover:border-orange-500/30 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{meeting.title}</h3>
        <span className={`px-2 py-1 text-[10px] font-bold rounded-md border uppercase tracking-wider ${getStatusColor(meeting.status)}`}>
          {meeting.status}
        </span>
      </div>
      <div className="space-y-2 mb-4 flex-1">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Clock size={16} className="text-orange-500" />
          {new Date(meeting.date).toLocaleDateString()} at {meeting.start_time?.substring(0, 5)} - {meeting.end_time?.substring(0, 5)}
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          {meeting.location?.toLowerCase().includes('http') || meeting.location?.toLowerCase().includes('zoom') || meeting.location?.toLowerCase().includes('meet') ? (
            <Video size={16} className="text-blue-500" />
          ) : (
            <MapPin size={16} className="text-green-500" />
          )}
          <span className="truncate">{meeting.location || 'TBA'}</span>
        </div>
      </div>
      <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <Users size={14} /> Participants
        </div>
        <button onClick={() => toast('Edit meeting modal')} className="text-orange-600 hover:text-orange-700 font-semibold text-xs">Manage</button>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in pb-10">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Scheduling & Meetings</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage office schedules, book rooms, and coordinate teams.</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg flex items-center justify-center transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-orange-500' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              title="List View"
            >
              <List size={18} />
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded-lg flex items-center justify-center transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-slate-700 shadow-sm text-orange-500' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              title="Calendar View"
            >
              <CalendarIcon size={18} />
            </button>
          </div>
          <button onClick={() => toast('Create Meeting Modal')} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-orange-500/30">
            <Plus size={18} /> New Meeting
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm text-center">
          <CalendarIcon size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Calendar View</h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">The full calendar grid is currently being integrated with Google Calendar and Outlook APIs. Please use the list view in the meantime.</p>
          <button onClick={() => setViewMode('list')} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg">Return to List View</button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="relative max-w-md mb-6">
            <input 
              type="text"
              placeholder="Search meetings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none text-slate-900 dark:text-white shadow-sm"
            />
            <Search size={18} className="absolute left-3 top-3 text-slate-400" />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <>
              <section>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span> Today's Schedule
                </h2>
                {todaysMeetings.length === 0 ? (
                  <div className="p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-slate-500">No meetings scheduled for today.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {todaysMeetings.map(renderMeetingCard)}
                  </div>
                )}
              </section>

              <section>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span> Upcoming Meetings
                </h2>
                {upcomingMeetings.length === 0 ? (
                  <div className="p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-slate-500">No upcoming meetings scheduled.</div>
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
