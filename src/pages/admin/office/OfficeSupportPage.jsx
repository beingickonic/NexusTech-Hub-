import React, { useState, useEffect } from 'react';
import { officeService } from '../../../services/officeService';
import { Search, Filter, PhoneMissed, Mail, LifeBuoy, Users, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white/80 dark:bg-nexus-card/80 backdrop-blur-md p-5 rounded-2xl border border-nexus-border shadow-sm flex items-start justify-between">
    <div>
      <p className="text-xs font-semibold text-nexus-muted mb-1 uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-bold text-nexus-heading">{value}</h3>
    </div>
    <div className={`p-2.5 rounded-xl ${colorClass}`}>
      <Icon size={20} />
    </div>
  </div>
);

const OfficeSupportPage = () => {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    newReqs: 0, openReqs: 0, closedReqs: 0, visitors: 0, missedCalls: 0, unreadEmails: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [reqRes, dashRes] = await Promise.all([
        officeService.getSupportRequests(),
        officeService.getDashboardStats()
      ]);
      const reqs = reqRes.data || [];
      setRequests(reqs);
      
      setStats({
        newReqs: reqs.filter(r => r.status === 'Open' && !r.assigned_to_id).length,
        openReqs: reqs.filter(r => r.status === 'Open' || r.status === 'In Progress').length,
        closedReqs: reqs.filter(r => r.status === 'Resolved' || r.status === 'Closed').length,
        visitors: dashRes.visitorsToday || 0,
        missedCalls: 2, // Mocked for UI, typically would come from getCalls()
        unreadEmails: 5 // Mocked for UI, typically from getEmails()
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to load support dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredRequests = requests.filter(r => 
    (r.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (r.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in pb-10 flex flex-col h-[85vh]">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-nexus-heading mb-2">Office Support</h1>
          <p className="text-nexus-muted">Manage incoming requests, visitors, calls, and general office queries.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <StatCard title="New" value={stats.newReqs} icon={AlertCircle} colorClass="bg-nexus-error/5 text-nexus-error dark:bg-nexus-error/10 dark:text-nexus-error" />
        <StatCard title="Open" value={stats.openReqs} icon={LifeBuoy} colorClass="bg-nexus-primary/10 text-nexus-primary dark:bg-nexus-primary/10 dark:text-nexus-primary" />
        <StatCard title="Closed" value={stats.closedReqs} icon={LifeBuoy} colorClass="bg-nexus-success/5 text-nexus-success dark:bg-nexus-success/10 dark:text-nexus-success" />
        <StatCard title="Visitors" value={stats.visitors} icon={Users} colorClass="bg-nexus-info/10 text-nexus-info dark:bg-nexus-info/10 dark:text-nexus-info" />
        <StatCard title="Missed Calls" value={stats.missedCalls} icon={PhoneMissed} colorClass="bg-error/10 text-error dark:bg-error/100/10 dark:text-error" />
        <StatCard title="Unread Emails" value={stats.unreadEmails} icon={Mail} colorClass="bg-info/10 text-info dark:bg-info/100/10 dark:text-info" />
      </div>

      <div className="flex-1 bg-white/80 dark:bg-nexus-card/80 backdrop-blur-md rounded-2xl border border-nexus-border shadow-sm flex flex-col min-h-0">
        <div className="p-4 border-b border-nexus-border flex flex-col sm:flex-row justify-between items-center gap-4 bg-nexus-surface/50 dark:bg-nexus-surface/30">
          <div className="relative w-full sm:max-w-md">
            <input 
              type="text"
              placeholder="Search support requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-nexus-card border border-nexus-border rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-nexus-primary/50 outline-none transition-all placeholder:text-nexus-textSecondary text-nexus-heading"
            />
            <Search size={18} className="absolute left-3 top-3 text-nexus-textSecondary" />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-nexus-surface hover:bg-nexus-surface dark:hover:bg-nexus-hover text-nexus-text rounded-lg text-sm font-medium transition-colors border border-nexus-border dark:border-nexus-border w-full sm:w-auto">
            <Filter size={16} /> Filters
          </button>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-nexus-surface/50 text-nexus-muted text-xs uppercase tracking-wider font-semibold border-b border-nexus-border">
                <th className="px-6 py-4">Request</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Assigned To</th>
                <th className="px-6 py-4">Requested By</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nexus-border dark:divide-nexus-card/50 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nexus-primary"></div></div>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-nexus-textSecondary">No support requests found.</td>
                </tr>
              ) : (
                filteredRequests.map(req => (
                  <tr key={req.id} className="hover:bg-nexus-surface/50 dark:hover:bg-nexus-hover/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-nexus-heading">{req.title}</div>
                      <div className="text-xs text-nexus-textSecondary mt-0.5 line-clamp-1">{req.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-nexus-surface px-2.5 py-1 rounded-md text-xs font-medium text-nexus-muted">
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1 text-xs font-bold ${
                        req.priority === 'High' || req.priority === 'Critical' ? 'text-nexus-error' :
                        req.priority === 'Medium' ? 'text-nexus-primary' : 'text-nexus-info'
                      }`}>
                        {req.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-nexus-muted">
                      {req.assigned_to?.full_name || (
                        <button onClick={() => toast('Opening assignment modal...')} className="text-nexus-primary hover:underline text-xs font-medium">Assign Staff</button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-nexus-muted">
                      {req.requested_by?.full_name || 'Anonymous'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => toast('Opening details modal...')} className="text-nexus-primary hover:text-nexus-primary font-semibold text-xs">View Details</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OfficeSupportPage;
