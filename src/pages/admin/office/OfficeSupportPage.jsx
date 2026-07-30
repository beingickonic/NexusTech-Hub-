import React, { useState, useEffect } from 'react';
import { officeService } from '../../../services/officeService';
import { Search, Filter, PhoneMissed, Mail, LifeBuoy, Users, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start justify-between">
    <div>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
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
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Office Support</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage incoming requests, visitors, calls, and general office queries.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <StatCard title="New" value={stats.newReqs} icon={AlertCircle} colorClass="bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-500" />
        <StatCard title="Open" value={stats.openReqs} icon={LifeBuoy} colorClass="bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-500" />
        <StatCard title="Closed" value={stats.closedReqs} icon={LifeBuoy} colorClass="bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-500" />
        <StatCard title="Visitors" value={stats.visitors} icon={Users} colorClass="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-500" />
        <StatCard title="Missed Calls" value={stats.missedCalls} icon={PhoneMissed} colorClass="bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-500" />
        <StatCard title="Unread Emails" value={stats.unreadEmails} icon={Mail} colorClass="bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-500" />
      </div>

      <div className="flex-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col min-h-0">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="relative w-full sm:max-w-md">
            <input 
              type="text"
              placeholder="Search support requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none transition-all placeholder:text-slate-400 text-slate-900 dark:text-white"
            />
            <Search size={18} className="absolute left-3 top-3 text-slate-400" />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors border border-slate-200 dark:border-slate-600 w-full sm:w-auto">
            <Filter size={16} /> Filters
          </button>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4">Request</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Assigned To</th>
                <th className="px-6 py-4">Requested By</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">No support requests found.</td>
                </tr>
              ) : (
                filteredRequests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{req.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{req.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-xs font-medium text-slate-700 dark:text-slate-300">
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1 text-xs font-bold ${
                        req.priority === 'High' || req.priority === 'Critical' ? 'text-red-500' :
                        req.priority === 'Medium' ? 'text-orange-500' : 'text-blue-500'
                      }`}>
                        {req.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {req.assigned_to?.full_name || (
                        <button onClick={() => toast('Opening assignment modal...')} className="text-orange-500 hover:underline text-xs font-medium">Assign Staff</button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {req.requested_by?.full_name || 'Anonymous'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => toast('Opening details modal...')} className="text-orange-600 hover:text-orange-700 font-semibold text-xs">View Details</button>
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
