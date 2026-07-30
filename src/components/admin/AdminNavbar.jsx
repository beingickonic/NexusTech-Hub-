import { Menu, Bell, Search, Sun, Moon, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../auth/AuthContext';
import UserAvatar from '../common/UserAvatar';

const AdminNavbar = ({ toggleSidebar }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const canGoBack = location.pathname !== '/admin/dashboard' && location.pathname !== '/admin';
  const displayName = user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email || 'Admin';

  return (
    <header
      className="h-auto min-h-16 bg-white/80 dark:bg-nexus-bg/80 backdrop-blur-md border-b border-slate-200 dark:border-nexus-border flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-nexus-textSecondary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>

        {canGoBack && (
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-nexus-textSecondary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
            Back
          </button>
        )}

        {/* Search */}
        <div className="hidden md:flex items-center relative w-64">
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full bg-slate-100 dark:bg-nexus-surface border-none rounded-lg py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-all placeholder:text-nexus-textSecondary"
          />
          <Search size={16} className="absolute left-3 text-nexus-textSecondary" />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        <button 
          onClick={toggleTheme}
          className="p-2 text-nexus-textSecondary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button className="relative p-2 text-nexus-textSecondary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#070B1A]"></span>
        </button>

        <button className="relative p-2 text-nexus-textSecondary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ticket"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>
        </button>

        <div className="flex items-center gap-3 pl-2 md:pl-4 border-l border-slate-200 dark:border-nexus-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{displayName}</p>
            <p className="text-xs text-nexus-textSecondary dark:text-nexus-textSecondary capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
          <UserAvatar src={user?.avatar_url} name={displayName} size="md" />
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
