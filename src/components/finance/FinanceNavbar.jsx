import { Menu, Bell, Sun, Moon, Search, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../auth/AuthContext';
import UserAvatar from '../common/UserAvatar';
import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';

const FinanceNavbar = ({ toggleSidebar }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  const isHome = location.pathname === '/finance/dashboard' || location.pathname === '/finance';
  const displayName = user?.full_name || user?.email?.split('@')[0] || 'User';

  const routeNameMap = {
    '/finance/dashboard': 'Dashboard',
    '/finance/approvals': 'Approvals',
    '/finance/invoices': 'Invoices',
    '/finance/payments': 'Payments',
    '/finance/expenses': 'Expenses',
    '/finance/reports': 'Reports',
    '/finance/settings': 'Settings',
  };
  const currentPage = routeNameMap[location.pathname] || 'Finance';

  // Fetch unread notification count
  useEffect(() => {
    if (!user) return;
    
    // We will use the new finance_notifications table
    supabase
      .from('finance_notifications')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('read', false)
      .then(({ count, error }) => {
        if (error) {
          setUnread(0);
          return;
        }
        setUnread(count || 0);
      })
      .catch(() => setUnread(0));

    const channel = supabase
      .channel(`finance-notif-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'finance_notifications',
        filter: `user_id=eq.${user.id}`
      }, () => setUnread(n => n + 1))
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  return (
    <header
      className="h-14 bg-white/90 dark:bg-nexus-bg/90 backdrop-blur-md border-b border-nexus-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg text-nexus-textSecondary hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors"
        >
          <Menu size={18} />
        </button>

        {/* Back button */}
        {!isHome && (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm font-medium text-nexus-textSecondary hover:text-nexus-heading transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
        )}

        {/* Page title */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-nexus-primary">
            FINANCE
          </span>
          <span className="text-nexus-textSecondary dark:text-nexus-heading">/</span>
          <span className="text-sm font-semibold text-nexus-heading">{currentPage}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden md:flex items-center relative">
          <input
            type="text"
            placeholder="Search finance..."
            className="w-44 bg-nexus-surface dark:bg-nexus-surface border-none rounded-lg py-1.5 pl-8 pr-3 text-sm outline-none focus:ring-2 transition-all placeholder:text-nexus-textSecondary focus:ring-nexus-primary/50"
          />
          <Search size={14} className="absolute left-2.5 text-nexus-textSecondary" />
        </div>

        {/* Theme */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-nexus-textSecondary hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors"
        >
          {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notifications */}
        <button onClick={() => navigate('/finance/notifications')} className="relative p-2 rounded-lg text-nexus-textSecondary hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors">
          <Bell size={17} />
          {unread > 0 && (
            <span
              className="absolute top-1 right-1 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center bg-nexus-primary"
            >
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {/* User */}
        <div className="flex items-center gap-2 pl-2 border-l border-nexus-border">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-semibold text-nexus-heading leading-none">{displayName}</p>
            <p className="text-[10px] text-nexus-textSecondary capitalize leading-none mt-0.5">{user?.role?.replace('_', ' ')}</p>
          </div>
          <UserAvatar src={user?.avatar_url} name={displayName} size="sm" />
        </div>
      </div>
    </header>
  );
};

export default FinanceNavbar;
