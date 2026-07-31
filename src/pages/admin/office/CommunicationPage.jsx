import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../auth/AuthContext';
import { officeService } from '../../../services/officeService';
import { Search, Send, Paperclip, Check, CheckCheck, Pin, Archive, MessageSquare, Megaphone, Users, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const CommunicationPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('direct'); // direct, department, announcements
  const [messages, setMessages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [newMessage, setNewMessage] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (!user?.id) return;
      const [msgRes, annRes] = await Promise.all([
        officeService.getMessages(user.id),
        officeService.getAnnouncements()
      ]);
      setMessages(msgRes.data || []);
      setAnnouncements(annRes.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load communications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    try {
      const msg = {
        sender_id: user.id,
        // Since we don't have a contact selector built yet, we mock the broadcast type for demo
        message_type: activeTab === 'announcements' ? 'broadcast' : (activeTab === 'department' ? 'group' : 'direct'),
        content: newMessage,
        is_read: false
      };
      const { data } = await officeService.createOfficeRecord('office_messages', msg);
      setMessages([data, ...messages]);
      setNewMessage('');
      toast.success('Message sent');
    } catch (error) {
      console.error(error);
      toast.error('Failed to send message');
    }
  };

  const filteredMessages = messages.filter(m => 
    (m.content?.toLowerCase() || '').includes(searchTerm.toLowerCase()) && 
    (activeTab === 'direct' ? m.message_type === 'direct' : m.message_type === 'group')
  );

  const filteredAnnouncements = announcements.filter(a => 
    (a.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (a.content?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in pb-10 flex flex-col h-[85vh]">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-nexus-heading mb-2">Internal Communication</h1>
          <p className="text-nexus-muted">Direct messages, department groups, and company announcements.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 flex flex-col gap-2 shrink-0">
          <div className="relative mb-4">
            <input 
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-nexus-card border border-nexus-border rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-nexus-primary/50 outline-none text-nexus-heading shadow-sm"
            />
            <Search size={18} className="absolute left-3 top-3 text-nexus-textSecondary" />
          </div>

          <button 
            onClick={() => setActiveTab('direct')}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'direct' ? 'bg-nexus-primary/10 dark:bg-nexus-primary/10 text-nexus-primary dark:text-nexus-primary font-semibold shadow-sm border border-nexus-primary/15 dark:border-nexus-primary/20' : 'bg-transparent text-nexus-muted hover:bg-white dark:hover:bg-nexus-hover hover:shadow-sm'}`}
          >
            <MessageSquare size={18} /> Direct Messages
          </button>
          
          <button 
            onClick={() => setActiveTab('department')}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'department' ? 'bg-nexus-primary/10 dark:bg-nexus-primary/10 text-nexus-primary dark:text-nexus-primary font-semibold shadow-sm border border-nexus-primary/15 dark:border-nexus-primary/20' : 'bg-transparent text-nexus-muted hover:bg-white dark:hover:bg-nexus-hover hover:shadow-sm'}`}
          >
            <Users size={18} /> Department Chat
          </button>

          <button 
            onClick={() => setActiveTab('announcements')}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'announcements' ? 'bg-nexus-primary/10 dark:bg-nexus-primary/10 text-nexus-primary dark:text-nexus-primary font-semibold shadow-sm border border-nexus-primary/15 dark:border-nexus-primary/20' : 'bg-transparent text-nexus-muted hover:bg-white dark:hover:bg-nexus-hover hover:shadow-sm'}`}
          >
            <Megaphone size={18} /> Announcements
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white/80 dark:bg-nexus-card/80 backdrop-blur-md rounded-2xl border border-nexus-border shadow-sm flex flex-col overflow-hidden relative">
          
          {isLoading && (
            <div className="absolute inset-0 z-10 bg-white/50 dark:bg-nexus-surface/50 backdrop-blur-sm flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nexus-primary"></div>
            </div>
          )}

          {/* Header */}
          <div className="p-4 border-b border-nexus-border flex justify-between items-center bg-nexus-surface/50 dark:bg-nexus-surface/30">
            <h2 className="font-bold text-nexus-heading flex items-center gap-2">
              {activeTab === 'direct' ? <MessageSquare size={18} /> : activeTab === 'department' ? <Users size={18} /> : <Megaphone size={18} />}
              {activeTab === 'direct' ? 'Direct Messages' : activeTab === 'department' ? 'Department Chat' : 'Company Announcements'}
            </h2>
            <div className="flex gap-2">
              <button className="p-2 text-nexus-textSecondary hover:text-nexus-primary hover:bg-nexus-primary/10 dark:hover:bg-nexus-primary/10 rounded-lg transition-colors">
                <Archive size={18} />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {activeTab === 'announcements' ? (
              filteredAnnouncements.length === 0 ? (
                <div className="text-center text-nexus-textSecondary mt-10">No announcements found.</div>
              ) : (
                filteredAnnouncements.map(ann => (
                  <div key={ann.id} className={`p-5 rounded-2xl border ${ann.is_pinned ? 'bg-nexus-primary/10 border-nexus-primary/20 dark:bg-nexus-primary/10 dark:border-nexus-primary/30' : 'bg-white border-nexus-border dark:bg-nexus-surface/50 dark:border-nexus-border'} shadow-sm`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        {ann.is_pinned && <Pin size={16} className="text-nexus-primary" />}
                        <h3 className="font-bold text-nexus-heading">{ann.title}</h3>
                      </div>
                      <span className="text-xs text-nexus-textSecondary flex items-center gap-1">
                        <Clock size={12} /> {new Date(ann.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-nexus-muted whitespace-pre-wrap">{ann.content}</p>
                    <div className="mt-4 pt-4 border-t border-nexus-border flex items-center gap-2 text-xs text-nexus-textSecondary">
                      <div className="w-6 h-6 rounded-full bg-nexus-surface dark:bg-nexus-card flex items-center justify-center text-[10px] font-bold">
                        {ann.created_by?.full_name?.charAt(0) || 'A'}
                      </div>
                      {ann.created_by?.full_name || 'Admin'}
                    </div>
                  </div>
                ))
              )
            ) : (
              filteredMessages.length === 0 ? (
                <div className="text-center text-nexus-textSecondary mt-10">No messages found.</div>
              ) : (
                filteredMessages.map(msg => {
                  const isMine = msg.sender_id === user?.id;
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                      {!isMine && <span className="text-xs text-nexus-textSecondary mb-1 ml-1">{msg.sender?.full_name || 'System'}</span>}
                      <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] md:max-w-[70%] ${
                        isMine 
                          ? 'bg-nexus-primary text-white rounded-br-sm' 
                          : 'bg-nexus-surface text-nexus-heading rounded-bl-sm border border-nexus-border dark:border-nexus-border'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <div className="flex items-center gap-1 mt-1 mr-1">
                        <span className="text-[10px] text-nexus-textSecondary">{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        {isMine && (msg.is_read ? <CheckCheck size={12} className="text-nexus-info" /> : <Check size={12} className="text-nexus-textSecondary" />)}
                      </div>
                    </div>
                  );
                })
              )
            )}
          </div>

          {/* Composer */}
          <div className="p-4 bg-nexus-surface/50 border-t border-nexus-border">
            <form onSubmit={handleSendMessage} className="flex gap-2 items-center bg-nexus-card p-2 rounded-xl border border-nexus-border focus-within:border-nexus-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <button type="button" className="p-2 text-nexus-textSecondary hover:text-nexus-primary hover:bg-nexus-surface dark:hover:bg-nexus-hover rounded-lg transition-colors">
                <Paperclip size={18} />
              </button>
              <input 
                type="text" 
                placeholder={activeTab === 'announcements' ? "Draft an announcement..." : "Type a message..."}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none text-nexus-heading placeholder:text-nexus-textSecondary"
              />
              <button 
                type="submit" 
                disabled={!newMessage.trim()}
                className="p-2 bg-nexus-primary hover:bg-nexus-primary-hover disabled:bg-nexus-primary/30 text-white rounded-lg transition-colors"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationPage;
