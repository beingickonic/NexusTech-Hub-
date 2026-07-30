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
      .then(({ count }) => setUnread(count || 0));

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
      className="h-14 bg-white/90 dark:bg-[#070B1A]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu size={18} />
        </button>

        {/* Back button */}
        {!isHome && (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
        )}

        {/* Page title */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-500">
            FINANCE
          </span>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">{currentPage}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden md:flex items-center relative">
          <input
            type="text"
            placeholder="Search finance..."
            className="w-44 bg-slate-100 dark:bg-slate-900 border-none rounded-lg py-1.5 pl-8 pr-3 text-sm outline-none focus:ring-2 transition-all placeholder:text-slate-400 focus:ring-emerald-500/50"
          />
          <Search size={14} className="absolute left-2.5 text-slate-400" />
        </div>

        {/* Theme */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Bell size={17} />
          {unread > 0 && (
            <span
              className="absolute top-1 right-1 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center bg-emerald-500"
            >
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {/* User */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-semibold text-slate-900 dark:text-white leading-none">{displayName}</p>
            <p className="text-[10px] text-slate-400 capitalize leading-none mt-0.5">{user?.role?.replace('_', ' ')}</p>
          </div>
          <UserAvatar src={user?.avatar_url} name={displayName} size="sm" />
        </div>
      </div>
    </header>
  );
};

export default FinanceNavbar;
