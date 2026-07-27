import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, FolderOpen, BarChart2, Package, Heart,
  MessageSquare, MessageCircle, Settings, LogOut,
  Menu, X, Bell, ChevronRight, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { supabase } from '../../services/supabaseClient';
import UserAvatar from '../../components/common/UserAvatar';

const NAV_ITEMS = [
  { label: 'My Account',       path: 'account',   icon: User },
  { label: 'My Assets',        path: 'assets',    icon: FolderOpen },
  { label: 'Business',         path: 'business',  icon: BarChart2 },
  { label: 'My Orders',        path: 'orders',    icon: Package },
  { label: 'Wish List',        path: 'wishlist',  icon: Heart },
  { label: 'Messages',         path: 'messages',  icon: MessageSquare },
  { label: 'Chats with Sellers', path: 'chats',  icon: MessageCircle },
  { label: 'Settings',         path: 'settings',  icon: Settings },
];

// ─── Logout confirmation modal ───────────────────────────────────────────────
const LogoutModal = ({ onConfirm, onCancel }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1F2937] rounded-2xl p-8 max-w-sm w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mx-auto mb-5">
          <LogOut className="text-red-400" size={28} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-2">Sign Out?</h3>
        <p className="text-slate-500 dark:text-gray-400 text-center text-sm mb-8">
          You'll be redirected to the homepage and will need to sign in again.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-[#1F2937] text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-slate-900 dark:text-white transition-colors font-medium"
          >
            Sign Out
          </button>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

// ─── Sidebar NavItem ──────────────────────────────────────────────────────────
const SideNavItem = ({ item, onClick }) => (
  <NavLink
    to={item.path}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
        isActive
          ? 'bg-[#FF6B57]/10 text-[#FF6B57] border border-[#FF6B57]/20'
          : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5'
      }`
    }
  >
    {({ isActive }) => (
      <>
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#FF6B57] rounded-full"
          />
        )}
        <item.icon size={18} className={`flex-shrink-0 transition-colors ${isActive ? 'text-[#FF6B57]' : 'text-slate-500 dark:text-gray-500 group-hover:text-slate-600 dark:text-gray-300'}`} />
        <span>{item.label}</span>
        {isActive && <ChevronRight size={14} className="ml-auto text-[#FF6B57]/60" />}
      </>
    )}
  </NavLink>
);

// ─── Main Dashboard Shell ─────────────────────────────────────────────────────
const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    
    // Unread order count
    supabase
      .from('orders')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)
      .then(({ count }) => setOrderCount(count || 0));
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const Sidebar = ({ mobile = false }) => (
    <aside className={`${mobile ? 'w-full' : 'w-64 hidden lg:flex'} flex-col h-full bg-white dark:bg-[#0C1220] border-r border-slate-200 dark:border-[#1F2937]`}>
      {/* Logo area */}
      <div className="p-6 border-b border-slate-200 dark:border-[#1F2937]">
        <p className="text-xs text-slate-500 dark:text-gray-500 uppercase tracking-widest font-semibold mb-4">Customer Portal</p>

        {/* Avatar + name */}
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <UserAvatar src={user?.avatar_url} name={user?.full_name || user?.email} size="lg" />
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-white dark:border-[#0C1220]" />
          </div>
          <div className="min-w-0">
            <p className="text-slate-900 dark:text-white font-semibold text-sm truncate">{user?.full_name || 'Customer'}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <ShieldCheck size={11} className="text-[#FF6B57]" />
              <p className="text-[#FF6B57] text-xs font-medium">{user?.role || 'Customer'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <SideNavItem key={item.path} item={item} onClick={() => mobile && setSidebarOpen(false)} />
        ))}
      </nav>

      {/* Bottom: order badge + logout */}
      <div className="p-4 border-t border-slate-200 dark:border-[#1F2937] space-y-2">
        {orderCount > 0 && (
          <NavLink
            to="orders"
            onClick={() => mobile && setSidebarOpen(false)}
            className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#FF6B57]/10 border border-[#FF6B57]/20 text-sm"
          >
            <span className="text-slate-600 dark:text-gray-300">Active Orders</span>
            <span className="bg-[#FF6B57] text-slate-900 dark:text-white text-xs font-bold px-2 py-0.5 rounded-full">{orderCount}</span>
          </NavLink>
        )}
        <button
          onClick={() => setShowLogout(true)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 dark:text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut size={18} className="flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070B1A] flex flex-col">
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-[#0C1220] border-b border-slate-200 dark:border-[#1F2937] sticky top-0 z-30">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-xl text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <span className="text-slate-900 dark:text-white font-semibold text-sm">My Account</span>
        <button
          className="p-2 rounded-xl text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={20} />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Mobile Sidebar Drawer */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed left-0 top-0 bottom-0 z-50 w-72 flex flex-col lg:hidden"
              >
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-xl text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <Sidebar mobile />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Logout Modal */}
      {showLogout && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogout(false)}
        />
      )}
    </div>
  );
};

export default CustomerDashboard;
