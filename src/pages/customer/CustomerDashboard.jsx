import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, FolderOpen, BarChart2, Package, Heart,
  MessageSquare, MessageCircle, Settings, LogOut,
  ChevronRight, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { supabase } from '../../services/supabaseClient';
import UserAvatar from '../../components/common/UserAvatar';
import { ROLE_PORTAL_MAP } from '../../auth/authService';

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
        className="bg-white dark:bg-nexus-card border border-nexus-border dark:border-nexus-card rounded-2xl p-8 max-w-sm w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-nexus-error/10 mx-auto mb-5">
          <LogOut className="text-nexus-error" size={28} />
        </div>
        <h3 className="text-xl font-bold text-nexus-heading text-center mb-2">Sign Out?</h3>
        <p className="text-nexus-textSecondary dark:text-nexus-muted text-center text-sm mb-8">
          You'll be redirected to the homepage and will need to sign in again.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-nexus-border dark:border-nexus-card text-nexus-muted hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-nexus-error hover:bg-nexus-error text-nexus-heading transition-colors font-medium"
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
          ? 'bg-nexus-primary/10 text-nexus-primary border border-nexus-primary/20'
          : 'text-nexus-textSecondary dark:text-nexus-muted hover:text-nexus-heading hover:bg-nexus-surface dark:hover:bg-nexus-hover'
      }`
    }
  >
    {({ isActive }) => (
      <>
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-nexus-primary rounded-full"
          />
        )}
        <item.icon size={18} className={`flex-shrink-0 transition-colors ${isActive ? 'text-nexus-primary' : 'text-nexus-textSecondary dark:text-nexus-muted group-hover:text-nexus-muted'}`} />
        <span>{item.label}</span>
        {isActive && <ChevronRight size={14} className="ml-auto text-nexus-primary/60" />}
      </>
    )}
  </NavLink>
);

// ─── Main Dashboard Shell ─────────────────────────────────────────────────────
const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const [orderCount, setOrderCount] = useState(0);

  // Role Guard
  if (user && user.role && user.role !== 'Customer') {
    const dest = ROLE_PORTAL_MAP[user.role] || '/403';
    console.log("[DEBUG CUSTOMER DASHBOARD] Role:", user.role);
    console.log("[DEBUG CUSTOMER DASHBOARD] Redirecting to:", dest);
    return <Navigate to={dest} replace />;
  }

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
    <aside className={`${mobile ? 'w-full' : 'w-64 hidden lg:flex'} flex-col h-full bg-white dark:bg-nexus-bg border-r border-nexus-border dark:border-nexus-card`}>
      {/* Logo area */}
      <div className="p-6 border-b border-nexus-border dark:border-nexus-card">
        <p className="text-xs text-nexus-textSecondary dark:text-nexus-muted uppercase tracking-widest font-semibold mb-4">Customer Portal</p>

        {/* Avatar + name */}
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <UserAvatar src={user?.avatar_url} name={user?.full_name || user?.email} size="lg" />
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-nexus-success border-2 border-white dark:border-nexus-bg" />
          </div>
          <div className="min-w-0">
            <p className="text-nexus-heading font-semibold text-sm truncate">{user?.full_name || 'Customer'}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <ShieldCheck size={11} className="text-nexus-primary" />
              <p className="text-nexus-primary text-xs font-medium">{user?.role || 'Customer'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <SideNavItem key={item.path} item={item} />
        ))}
      </nav>

      {/* Bottom: order badge + logout */}
      <div className="p-4 border-t border-nexus-border dark:border-nexus-card space-y-2">
        {orderCount > 0 && (
          <NavLink
            to="orders"
            className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-nexus-primary/10 border border-nexus-primary/20 text-sm"
          >
            <span className="text-nexus-muted">Active Orders</span>
            <span className="bg-nexus-primary text-nexus-heading text-xs font-bold px-2 py-0.5 rounded-full">{orderCount}</span>
          </NavLink>
        )}
        <button
          onClick={() => setShowLogout(true)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-nexus-textSecondary dark:text-nexus-muted hover:text-nexus-error hover:bg-nexus-error/10 transition-all duration-200"
        >
          <LogOut size={18} className="flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-nexus-surface dark:bg-nexus-bg flex flex-col">      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar />

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
