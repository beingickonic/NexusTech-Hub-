import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Headset, Search, Filter, AlertCircle, Clock, 
  CheckCircle, XCircle, ChevronLeft, ChevronRight, X, Reply, Save, Loader2
} from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import toast from 'react-hot-toast';

const STATUS_ICONS = {
  open: { icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  pending: { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  resolved: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
  closed: { icon: XCircle, color: 'text-slate-500 dark:text-gray-400', bg: 'bg-gray-500/10' },
};

const PRIORITY_COLORS = {
  low: 'bg-gray-500/10 text-slate-500 dark:text-gray-400',
  normal: 'bg-blue-500/10 text-blue-400',
  high: 'bg-orange-500/10 text-orange-400',
  urgent: 'bg-red-500/10 text-red-400',
};

const TicketModal = ({ ticket, onClose, onUpdate }) => {
  const [reply, setReply] = useState(ticket.admin_reply || '');
  const [status, setStatus] = useState(ticket.status || 'open');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ admin_reply: reply.trim() || null, status })
        .eq('id', ticket.id);
      
      if (error) throw error;
      toast.success('Ticket updated successfully');
      onUpdate();
      onClose();
    } catch (err) {
      toast.error('Failed to update ticket');
    } finally {
      setSaving(false);
    }
  };

  const sc = STATUS_ICONS[ticket.status] || STATUS_ICONS.open;
  const StatusIcon = sc.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sc.bg} ${sc.color}`}>
              <StatusIcon size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Ticket Details
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ${PRIORITY_COLORS[ticket.priority]}`}>
                  {ticket.priority}
                </span>
              </h2>
              <p className="text-sm text-slate-500 dark:text-gray-400">ID: {ticket.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors">
            <X className="text-slate-500 dark:text-gray-400" size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-2 gap-6 bg-[#F8FAFC] dark:bg-[#0C1220] p-4 rounded-xl border border-slate-200 dark:border-white/5">
            <div>
              <p className="text-xs text-slate-500 dark:text-gray-500 uppercase tracking-wider font-semibold mb-1">Customer</p>
              <p className="text-slate-900 dark:text-white font-medium">{ticket.name || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-gray-500 uppercase tracking-wider font-semibold mb-1">Email</p>
              <p className="text-slate-900 dark:text-white font-medium">{ticket.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-gray-500 uppercase tracking-wider font-semibold mb-1">Date Submitted</p>
              <p className="text-slate-900 dark:text-white font-medium">{new Date(ticket.created_at).toLocaleString('en-KE')}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{ticket.subject}</h3>
            <div className="bg-slate-50 dark:bg-black/20 p-4 rounded-xl border border-slate-200 dark:border-white/5 whitespace-pre-wrap text-slate-700 dark:text-gray-300">
              {ticket.message}
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-white/10 pt-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Reply size={20} className="text-primary" /> Admin Reply
            </h3>
            <div className="space-y-4">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={4}
                placeholder="Write a response to the customer..."
                className="w-full bg-[#F8FAFC] dark:bg-[#0C1220] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
              />
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs text-slate-500 dark:text-gray-500 uppercase tracking-wider font-semibold block mb-1.5">Ticket Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-[#F8FAFC] dark:bg-[#0C1220] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors"
                  >
                    <option value="open">Open</option>
                    <option value="pending">In Progress / Pending</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-white/10 flex justify-end gap-3 bg-slate-50 dark:bg-dark-surface/50">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/5 transition-colors font-medium">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 rounded-xl bg-primary hover:bg-orange-600 text-white transition-colors font-medium flex items-center gap-2 shadow-glow disabled:opacity-50">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save & Update
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const TicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();

    // Realtime subscription
    const channel = supabase
      .channel('public:support_tickets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, (payload) => {
        // Optimistically update list without full refetch
        if (payload.eventType === 'INSERT') {
          setTickets(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setTickets(prev => prev.map(t => t.id === payload.new.id ? payload.new : t));
        } else if (payload.eventType === 'DELETE') {
          setTickets(prev => prev.filter(t => t.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch = 
        (ticket.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (ticket.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (ticket.id.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, searchTerm, statusFilter, priorityFilter]);

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const paginatedTickets = filteredTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset pagination on filter change
  useEffect(() => setCurrentPage(1), [searchTerm, statusFilter, priorityFilter]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin text-primary w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Headset className="text-primary" /> Support Tickets
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and respond to customer inquiries</p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-dark-surface px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-center px-3 border-r border-slate-200 dark:border-slate-700">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{tickets.length}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total</p>
          </div>
          <div className="text-center px-3">
            <p className="text-2xl font-bold text-yellow-500">{tickets.filter(t => t.status === 'open' || t.status === 'pending').length}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Active</p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-dark-surface p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by ID, name, email or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white transition-colors"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="pending">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ticket Details</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Customer</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priority</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {paginatedTickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No tickets found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedTickets.map((ticket) => {
                  const sc = STATUS_ICONS[ticket.status] || STATUS_ICONS.open;
                  const StatusIcon = sc.icon;
                  
                  return (
                    <tr 
                      key={ticket.id} 
                      onClick={() => setSelectedTicket(ticket)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                    >
                      <td className="p-4">
                        <p className="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">{ticket.subject}</p>
                        <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">ID: {ticket.id.split('-')[0]}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{ticket.name || 'Anonymous'}</p>
                        <p className="text-xs text-slate-500 dark:text-gray-500">{ticket.email || 'N/A'}</p>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${PRIORITY_COLORS[ticket.priority]}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.color}`}>
                          <StatusIcon size={12} />
                          <span className="capitalize">{ticket.status}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <p className="text-sm text-slate-900 dark:text-white">{new Date(ticket.created_at).toLocaleDateString()}</p>
                        <p className="text-xs text-slate-500 dark:text-gray-500">{new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Showing <span className="font-medium text-slate-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-slate-900 dark:text-white">{Math.min(currentPage * itemsPerPage, filteredTickets.length)}</span> of <span className="font-medium text-slate-900 dark:text-white">{filteredTickets.length}</span> results
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedTicket && (
          <TicketModal 
            ticket={selectedTicket} 
            onClose={() => setSelectedTicket(null)} 
            onUpdate={fetchTickets}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TicketsPage;
