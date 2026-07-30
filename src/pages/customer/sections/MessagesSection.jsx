import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, ChevronRight, Clock, CheckCircle, AlertCircle, XCircle, Send, Loader2 } from 'lucide-react';
import { useAuth } from '../../../auth/AuthContext';
import { supabase } from '../../../services/supabaseClient';
import toast from 'react-hot-toast';

const STATUS_ICONS = {
  open:     { icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  pending:  { icon: Clock,       color: 'text-blue-400',   bg: 'bg-blue-500/10' },
  resolved: { icon: CheckCircle, color: 'text-green-400',  bg: 'bg-green-500/10' },
  closed:   { icon: XCircle,     color: 'text-nexus-textSecondary dark:text-gray-400',   bg: 'bg-gray-500/10' },
};

const PRIORITY_COLORS = {
  low:    'bg-gray-500/10 text-nexus-textSecondary dark:text-gray-400',
  normal: 'bg-blue-500/10 text-blue-400',
  high:   'bg-orange-500/10 text-orange-400',
  urgent: 'bg-red-500/10 text-red-400',
};

const EmptyState = ({ onNew }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-20 h-20 rounded-full bg-nexus-primary/10 flex items-center justify-center mb-5">
      <MessageSquare size={36} className="text-nexus-primary/60" />
    </div>
    <h3 className="text-slate-900 dark:text-white font-semibold text-lg mb-2">No messages yet</h3>
    <p className="text-nexus-textSecondary dark:text-gray-500 text-sm max-w-xs mb-6">Open a support ticket and our team will get back to you.</p>
    <button onClick={onNew}
      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-nexus-primary hover:bg-[#ff5a2e] text-slate-900 dark:text-white text-sm font-medium transition-colors">
      <Plus size={16} /> New Ticket
    </button>
  </motion.div>
);

const NewTicketModal = ({ onClose, onCreated }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({ subject: '', message: '', priority: 'normal' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: ticket, error } = await supabase.from('support_tickets').insert({
        user_id: user.id,
        name: user.full_name,
        email: user.email,
        subject: form.subject,
        message: form.message,
        priority: form.priority,
        status: 'open',
      }).select().single();
      if (error) throw error;

      toast.success('Ticket submitted! We\'ll respond shortly.');
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to submit ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1F2937] rounded-2xl p-6 max-w-md w-full"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-5">Open Support Ticket</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-nexus-textSecondary dark:text-gray-500 uppercase tracking-wider font-semibold block mb-1.5">Subject</label>
            <input
              type="text" required
              value={form.subject}
              onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
              placeholder="What do you need help with?"
              className="w-full bg-white dark:bg-nexus-bg border border-slate-200 dark:border-[#1F2937] text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-nexus-primary transition-colors placeholder-gray-600"
            />
          </div>
          <div>
            <label className="text-xs text-nexus-textSecondary dark:text-gray-500 uppercase tracking-wider font-semibold block mb-1.5">Priority</label>
            <select
              value={form.priority}
              onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
              className="w-full bg-white dark:bg-nexus-bg border border-slate-200 dark:border-[#1F2937] text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-nexus-primary transition-colors"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-nexus-textSecondary dark:text-gray-500 uppercase tracking-wider font-semibold block mb-1.5">Message</label>
            <textarea
              required rows={4}
              value={form.message}
              onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              placeholder="Describe your issue in detail..."
              className="w-full bg-white dark:bg-nexus-bg border border-slate-200 dark:border-[#1F2937] text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-nexus-primary transition-colors placeholder-gray-600 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-[#1F2937] text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-sm font-medium">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-nexus-primary hover:bg-[#ff5a2e] text-slate-900 dark:text-white text-sm font-medium transition-colors disabled:opacity-60">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Submit
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const MessagesSection = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);

  const fetchTickets = async () => {
    if (!user) return;
    const { data } = await supabase.from('support_tickets').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setTickets(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchTickets(); }, [user]);

  const openTicket = async (ticket) => {
    setSelected(ticket);
    const msgs = [];
    msgs.push({
      id: `${ticket.id}-user`,
      user_id: ticket.user_id,
      message: ticket.message,
      created_at: ticket.created_at,
    });
    if (ticket.admin_reply) {
      msgs.push({
        id: `${ticket.id}-admin`,
        user_id: 'admin',
        message: ticket.admin_reply,
        created_at: ticket.updated_at,
      });
    }
    setMessages(msgs);
  };

  const statusConfig = (s) => STATUS_ICONS[s] || STATUS_ICONS.open;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Messages</h1>
          <p className="text-nexus-textSecondary dark:text-gray-400 text-sm mt-1">Support tickets and order updates</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-nexus-primary hover:bg-[#ff5a2e] text-slate-900 dark:text-white text-sm font-medium transition-colors">
          <Plus size={15} /> New Ticket
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-nexus-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : tickets.length === 0 ? (
        <EmptyState onNew={() => setShowNew(true)} />
      ) : (
        <div className="grid lg:grid-cols-5 gap-4">
          {/* Ticket list */}
          <div className="lg:col-span-2 space-y-2">
            {tickets.map(ticket => {
              const sc = statusConfig(ticket.status);
              const StatusIcon = sc.icon;
              return (
                <button key={ticket.id} onClick={() => openTicket(ticket)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selected?.id === ticket.id
                      ? 'bg-nexus-primary/10 border-nexus-primary/30'
                      : 'bg-white dark:bg-nexus-bg border-slate-200 dark:border-[#1F2937] hover:border-nexus-border'
                  }`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${sc.bg} flex-shrink-0 mt-0.5`}>
                      <StatusIcon size={14} className={sc.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900 dark:text-white text-sm font-semibold truncate">{ticket.subject}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[ticket.priority]}`}>{ticket.priority}</span>
                        <span className="text-nexus-textSecondary dark:text-gray-600 text-xs">{new Date(ticket.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-nexus-textSecondary dark:text-gray-600 flex-shrink-0 mt-1" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Message thread */}
          <div className="lg:col-span-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1F2937] rounded-2xl flex flex-col" style={{ minHeight: 400 }}>
            {selected ? (
              <>
                <div className="p-5 border-b border-slate-200 dark:border-[#1F2937]">
                  <p className="text-slate-900 dark:text-white font-semibold">{selected.subject}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[selected.priority]}`}>{selected.priority} priority</span>
                </div>
                <div className="flex-1 p-5 space-y-4 overflow-y-auto">
                  {messages.map(msg => {
                    const isMe = msg.user_id === user.id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                          isMe ? 'bg-nexus-primary text-slate-900 dark:text-white rounded-br-sm' : 'bg-white dark:bg-nexus-bg text-gray-200 rounded-bl-sm'
                        }`}>
                          <p>{msg.message}</p>
                          <p className={`text-xs mt-1 ${isMe ? 'text-slate-900 dark:text-white/60' : 'text-nexus-textSecondary dark:text-gray-500'}`}>
                            {new Date(msg.created_at).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Reply Form Removed as per single-message schema */}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-nexus-textSecondary dark:text-gray-600">
                <p className="text-sm">Select a ticket to view messages</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showNew && <NewTicketModal onClose={() => setShowNew(false)} onCreated={fetchTickets} />}
    </motion.div>
  );
};

export default MessagesSection;
