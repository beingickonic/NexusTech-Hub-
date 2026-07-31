import React from 'react';
import { Calendar, CheckSquare, Clock } from 'lucide-react';

const TasksMeetings = () => {
  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-nexus-heading">Tasks & Meetings</h1>
        <p className="text-sm text-nexus-textSecondary">Coordinate company-wide tasks, schedules, and announcements.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-nexus-bg border border-nexus-border rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-nexus-heading flex items-center gap-2">
              <Calendar className="text-nexus-primary" size={20} />
              Upcoming Meetings
            </h2>
            <button className="text-sm text-nexus-primary dark:text-nexus-primary font-medium hover:underline">Schedule</button>
          </div>
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-nexus-border bg-nexus-surface dark:bg-nexus-hover">
              <p className="font-medium text-nexus-heading">Department Heads Weekly Sync</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-nexus-textSecondary">
                <span className="flex items-center gap-1"><Clock size={14} /> Today, 2:00 PM</span>
                <span>Room A</span>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-nexus-border bg-nexus-surface dark:bg-nexus-hover">
              <p className="font-medium text-nexus-heading">Financial Review (Q3)</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-nexus-textSecondary">
                <span className="flex items-center gap-1"><Clock size={14} /> Tomorrow, 10:00 AM</span>
                <span>Boardroom</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-nexus-bg border border-nexus-border rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-nexus-heading flex items-center gap-2">
              <CheckSquare className="text-info" size={20} />
              HQ Task Assignments
            </h2>
            <button className="text-sm text-info dark:text-info font-medium hover:underline">Assign</button>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 hover:bg-nexus-surface dark:hover:bg-nexus-hover rounded-lg transition-colors">
              <input type="checkbox" className="mt-1 rounded border-nexus-border text-info focus:ring-nexus-info" />
              <div>
                <p className="text-sm font-medium text-nexus-heading">Review updated HR policies</p>
                <p className="text-xs text-nexus-textSecondary">Assigned to: All Managers</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 hover:bg-nexus-surface dark:hover:bg-nexus-hover rounded-lg transition-colors">
              <input type="checkbox" className="mt-1 rounded border-nexus-border text-info focus:ring-nexus-info" />
              <div>
                <p className="text-sm font-medium text-nexus-heading">Approve pending supplier contracts</p>
                <p className="text-xs text-nexus-textSecondary">Assigned to: Admin Team</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksMeetings;
