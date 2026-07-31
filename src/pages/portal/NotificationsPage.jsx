import { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCheck, Filter, ChevronDown } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { notificationService } from '../../services/notificationService';

const TYPE_STYLES = {
  info: 'bg-nexus-info/10 dark:bg-nexus-info/30 text-nexus-info border-nexus-info/20 dark:border-nexus-info/80',
  success: 'bg-nexus-success/10 dark:bg-nexus-success/30 text-nexus-success dark:text-nexus-success border-nexus-success/20 dark:border-nexus-success/80',
  warning: 'bg-nexus-gold/10 dark:bg-nexus-gold/30 text-nexus-gold border-nexus-gold/20 dark:border-nexus-gold/80',
  error: 'bg-nexus-error/10 dark:bg-nexus-error/30 text-nexus-error border-nexus-error/20 dark:border-nexus-error/80',
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showFilter, setShowFilter] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications({ limit: 100 });
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnread = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch {}
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchUnread();
  }, [fetchNotifications, fetchUnread]);

  useEffect(() => {
    const unsub = user ? notificationService.subscribeToNotifications(user.id, (n) => {
      setNotifications(prev => [n, ...prev]);
      setUnreadCount(c => c + 1);
    }) : null;
    return unsub;
  }, [user?.id]);

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;
    try {
      await notificationService.markLogAsRead(unreadIds);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleMarkOneRead = async (id) => {
    try {
      await notificationService.markLogAsRead([id]);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch {}
  };

  const filtered = filter === 'all'
    ? notifications
    : filter === 'unread'
      ? notifications.filter(n => !n.read)
      : notifications.filter(n => n.type === filter);

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell size={24} className="text-nexus-textSecondary" />
          <h1 className="text-xl font-bold text-nexus-heading">Notifications</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-nexus-info/10 dark:bg-nexus-info/40 text-nexus-info">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-sm text-nexus-info hover:underline"
          >
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="relative mb-4">
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border border-nexus-border text-nexus-muted hover:bg-nexus-surface dark:hover:bg-nexus-surface"
        >
          <Filter size={14} />
          {filter === 'all' ? 'All' : filter === 'unread' ? 'Unread' : filter.charAt(0).toUpperCase() + filter.slice(1)}
          <ChevronDown size={14} />
        </button>
        {showFilter && (
          <div className="absolute top-full left-0 mt-1 w-36 bg-nexus-card border border-nexus-border rounded-lg shadow-lg z-10 py-1">
            {['all', 'unread', 'info', 'success', 'warning', 'error'].map(f => (
              <button
                key={f}
                onClick={() => { setFilter(f); setShowFilter(false); }}
                className={`block w-full text-left px-3 py-1.5 text-sm hover:bg-nexus-surface dark:hover:bg-nexus-hover ${filter === f ? 'text-nexus-info font-medium' : 'text-nexus-muted'}`}
              >
                {f === 'all' ? 'All' : f === 'unread' ? 'Unread' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="animate-pulse flex gap-3 p-4 rounded-xl bg-nexus-surface dark:bg-nexus-surface">
              <div className="w-2 self-stretch rounded-full bg-nexus-surface dark:bg-nexus-card" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-nexus-surface dark:bg-nexus-card rounded w-3/4" />
                <div className="h-3 bg-nexus-surface dark:bg-nexus-card rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-nexus-textSecondary">
          <Bell size={48} className="mb-3 opacity-40" />
          <p className="text-lg font-medium">No notifications yet</p>
          <p className="text-sm mt-1">Notifications will appear here as they come in.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(n => (
            <div
              key={n.id}
              onClick={() => !n.read && handleMarkOneRead(n.id)}
              className={`relative flex gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                n.read
                  ? 'bg-nexus-card border-nexus-border'
                  : 'bg-nexus-info/10/60 dark:bg-nexus-info/10 border-nexus-info/20 dark:border-nexus-info/80/40'
              }`}
            >
              {/* Type indicator */}
              <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${n.read ? 'bg-nexus-surface dark:bg-nexus-card' : TYPE_STYLES[n.type]?.split(' ')[0] || 'bg-nexus-info'}`} />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className={`text-sm ${n.read ? 'font-medium' : 'font-semibold'} text-nexus-heading truncate`}>
                    {n.title}
                  </h3>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium flex-shrink-0 ${TYPE_STYLES[n.type] || TYPE_STYLES.info}`}>
                    {n.type}
                  </span>
                </div>
                {n.message && (
                  <p className="text-xs text-nexus-muted mt-1 line-clamp-2">{n.message}</p>
                )}
                <p className="text-[10px] text-nexus-textSecondary mt-1.5">
                  {new Date(n.sent_at || n.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
