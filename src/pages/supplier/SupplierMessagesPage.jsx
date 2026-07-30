import React, { useState } from 'react';
import { Search, Send, User, Building2, Package, Truck, MessageSquare } from 'lucide-react';

const SupplierMessagesPage = () => {
  const [activeChannel, setActiveChannel] = useState('Admin HQ');
  
  const channels = [
    { name: 'Admin HQ', icon: Building2, unread: 0 },
    { name: 'Inventory', icon: Package, unread: 2 },
    { name: 'Finance', icon: User, unread: 0 },
    { name: 'Dispatch', icon: Truck, unread: 1 }
  ];

  const messages = [
    { id: 1, sender: 'Inventory Team', role: 'Inventory', content: 'Please ensure you dispatch the 50 units of MacBook Air M3 to Warehouse B by tomorrow.', time: '10:30 AM', isMine: false },
    { id: 2, sender: 'You', role: 'Supplier', content: 'Understood. They are packed and ready for pickup.', time: '10:45 AM', isMine: true },
    { id: 3, sender: 'Inventory Team', role: 'Inventory', content: 'Great, dispatch will collect them at 08:00 AM.', time: '11:00 AM', isMine: false },
  ];

  return (
    <div className="animate-fade-in space-y-6 pb-10 h-[calc(100vh-120px)] flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Messages</h1>
          <p className="text-sm text-nexus-textSecondary">Communicate with Nexus Tech Hub departments.</p>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-nexus-bg border border-slate-200 dark:border-nexus-border rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row min-h-0">
        
        {/* Sidebar Channels */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 dark:border-nexus-border bg-slate-50 dark:bg-white/5 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-200 dark:border-nexus-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-textSecondary" size={16} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-nexus-bg border border-slate-200 dark:border-nexus-border rounded-xl text-sm focus:outline-none focus:border-nexus-primary"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {channels.map(channel => (
              <button 
                key={channel.name}
                onClick={() => setActiveChannel(channel.name)}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-colors ${
                  activeChannel === channel.name 
                    ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-500' 
                    : 'text-slate-600 dark:text-nexus-textSecondary hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <channel.icon size={18} />
                  {channel.name}
                </div>
                {channel.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-nexus-primary text-white text-xs flex items-center justify-center">
                    {channel.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="p-4 border-b border-slate-200 dark:border-nexus-border flex items-center gap-3 bg-white dark:bg-nexus-bg shrink-0">
            <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">{activeChannel}</h3>
              <p className="text-xs text-nexus-textSecondary">Usually replies within 1 hour</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-nexus-bg/50">
            {messages.map(msg => (
              <div key={msg.id} className={`flex flex-col ${msg.isMine ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-slate-700 dark:text-nexus-textSecondary">{msg.sender}</span>
                  <span className="text-xs text-nexus-textSecondary">{msg.time}</span>
                </div>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.isMine 
                    ? 'bg-nexus-primary text-white rounded-tr-sm' 
                    : 'bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-nexus-border rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-nexus-border bg-white dark:bg-nexus-bg shrink-0">
            <div className="flex items-center gap-3">
              <input 
                type="text" 
                placeholder={`Message ${activeChannel}...`}
                className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-nexus-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-nexus-primary dark:text-white"
              />
              <button className="w-12 h-12 rounded-xl bg-nexus-primary hover:bg-orange-600 text-white flex items-center justify-center transition-colors shrink-0">
                <Send size={18} className="ml-1" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SupplierMessagesPage;
