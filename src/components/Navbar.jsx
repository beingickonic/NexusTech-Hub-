import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, User, ShoppingCart, Menu, X, Sun, Moon, ChevronDown, FolderOpen, BarChart2, Package, MessageSquare, MessageCircle, Settings, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../auth/AuthContext';
import { useCart } from '../context/CartContext';
import CartDrawer from './cart/CartDrawer';
import UserAvatar from './common/UserAvatar';
import lightLogo from '../assets/logo/logo-light.png';
import darkLogo from '../assets/logo/logo-dark.png';

const Navbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const closeMobile = () => setIsMobileMenuOpen(false);

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 text-slate-900 dark:text-white ${
          isScrolled ? 'glass py-2 sm:py-3' : 'bg-transparent py-3 sm:py-5'
        }`}
        style={{ paddingTop: `calc(env(safe-area-inset-top, 0px) + ${isScrolled ? '0.5rem' : '0.75rem'})` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">

          {/* LEFT: Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" onClick={closeMobile}>
              <img
                src={isDarkMode ? darkLogo : lightLogo}
                alt="NexusTech Hub"
                style={{ imageRendering: 'auto' }}
                className="h-8 sm:h-9 md:h-10 lg:h-12 w-auto object-contain transition-all duration-300 hover:scale-105 dark:drop-shadow-[0_0_25px_rgba(255,114,76,0.35)]"
              />
            </Link>
          </div>

          {/* CENTER: Search (Desktop only) */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center flex-1 max-w-2xl mx-6">
            <div className="relative w-full flex items-center group">
              <button
                type="button"
                aria-label="Select category"
                className="flex items-center gap-1 pl-4 pr-3 py-2.5 bg-slate-100 dark:bg-dark-bg text-sm font-medium rounded-l-md border-r border-slate-200 dark:border-gray-700 hover:text-primary transition-colors whitespace-nowrap"
              >
                Categories <ChevronDown size={14} />
              </button>
              <input
                aria-label="Search products"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search premium tech..."
                className="w-full bg-slate-100 dark:bg-dark-bg py-2.5 px-4 outline-none text-sm focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-400"
              />
              <button
                type="submit"
                aria-label="Submit search"
                className="bg-primary hover:bg-orange-600 text-white p-2.5 rounded-r-md transition-colors"
              >
                <Search size={18} />
              </button>
            </div>
          </form>

          {/* RIGHT: Icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Theme toggle */}
            <button
              aria-label="Toggle dark mode"
              onClick={toggleTheme}
              className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Admin badge */}
            {user && (user.role === 'Admin' || user.role === 'super_admin') && (
              <Link
                to="/admin/dashboard"
                className="hidden sm:flex items-center justify-center px-3 py-1.5 rounded-full hover:bg-orange-50 dark:hover:bg-orange-500/10 text-orange-500 transition-colors font-bold text-xs"
              >
                Admin
              </Link>
            )}

            {/* Profile Dropdown */}
            {user ? (
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center justify-center p-1 rounded-full hover:ring-2 hover:ring-primary/50 transition-all focus:outline-none"
                >
                  <UserAvatar src={user.avatar_url} name={user.full_name || user.email} size="sm" />
                </button>
                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsProfileDropdownOpen(false)}></div>
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-surface border border-slate-200 dark:border-[#1F2937] rounded-xl shadow-xl z-50 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-slate-200 dark:border-[#1F2937]">
                          <p className="text-sm font-semibold truncate">{user.full_name || 'Customer'}</p>
                          <p className="text-xs text-slate-500 dark:text-gray-400 truncate">{user.email}</p>
                        </div>
                        <div className="py-1">
                          <Link to={ROLE_PORTAL_MAP[user?.role] || "/profile/account"} onClick={() => setIsProfileDropdownOpen(false)} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                            My Profile
                          </Link>
                          <Link to={ROLE_PORTAL_MAP[user?.role] ? `${ROLE_PORTAL_MAP[user?.role].replace('/dashboard', '')}/settings` : "/profile/settings"} onClick={() => setIsProfileDropdownOpen(false)} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                            Settings
                          </Link>
                          <button
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              logout();
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-medium"
                          >
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                aria-label="User profile"
                className="hidden sm:flex items-center justify-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
              >
                <User size={18} />
              </Link>
            )}

            {/* Wishlist */}
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="hidden sm:flex items-center justify-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
            >
              <Heart size={18} />
            </Link>

            {/* Cart */}
            <button
              aria-label="Open cart"
              onClick={() => setIsCartOpen(true)}
              className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors relative"
            >
              <ShoppingCart size={18} className="hover:text-primary transition-colors" />
              {cartItems?.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white dark:border-[#1E293B]">
                  {cartItems.length > 9 ? '9+' : cartItems.length}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              aria-label="Open mobile menu"
              className="lg:hidden flex items-center justify-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors ml-1"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[60] lg:hidden backdrop-blur-sm"
              onClick={closeMobile}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-[85%] max-w-[360px] bg-white dark:bg-dark-surface z-[70] shadow-2xl flex flex-col text-slate-900 dark:text-white overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/10">
                <img
                  src={isDarkMode ? darkLogo : lightLogo}
                  alt="NexusTech Hub"
                  className="h-8 w-auto object-contain"
                  style={{ imageRendering: 'auto' }}
                />
                <button
                  aria-label="Close mobile menu"
                  onClick={closeMobile}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="flex-1 px-5 py-6 flex flex-col gap-6">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full bg-slate-100 dark:bg-dark-bg py-3 px-4 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-slate-400 text-sm"
                  />
                  <Search size={16} className="absolute left-3 top-3.5 text-gray-400" />
                </form>

                {/* Nav Links */}
                <nav className="flex flex-col gap-1">
                  {user ? (
                    <>
                      {[
                        { to: ROLE_PORTAL_MAP[user?.role] || '/profile/account', label: 'My Account', icon: <User size={18} /> },
                        { to: '/profile/assets', label: 'My Assets', icon: <FolderOpen size={18} />, customerOnly: true },
                        { to: '/profile/business', label: 'Business', icon: <BarChart2 size={18} />, customerOnly: true },
                        { to: '/profile/orders', label: 'My Orders', icon: <Package size={18} />, customerOnly: true },
                        { to: '/wishlist', label: 'Wish List', icon: <Heart size={18} />, customerOnly: true },
                        { to: '/profile/messages', label: 'Messages', icon: <MessageSquare size={18} />, customerOnly: true },
                        { to: '/profile/chats', label: 'Chats with Sellers', icon: <MessageCircle size={18} />, customerOnly: true },
                        { to: ROLE_PORTAL_MAP[user?.role] ? `${ROLE_PORTAL_MAP[user?.role].replace('/dashboard', '')}/settings` : '/profile/settings', label: 'Settings', icon: <Settings size={18} /> },
                      ].filter(item => !item.customerOnly || !user?.role || user?.role === 'Customer').map(({ to, label, icon }) => (
                        <Link
                          key={to}
                          to={to}
                          onClick={closeMobile}
                          className="flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-bg transition-colors font-medium text-base"
                        >
                          <span className="text-slate-500 dark:text-gray-400">{icon}</span>
                          <span>{label}</span>
                        </Link>
                      ))}

                      {user && (user.role === 'Admin' || user.role === 'super_admin') && (
                        <Link
                          to="/admin/dashboard"
                          onClick={closeMobile}
                          className="flex items-center gap-3 py-3 px-3 rounded-xl text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors font-semibold text-base mt-2"
                        >
                          <span className="text-orange-400"><User size={18} /></span>
                          Admin Dashboard
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          closeMobile();
                          logout();
                        }}
                        className="flex items-center gap-3 w-full py-3 px-3 mt-4 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-medium text-base text-left"
                      >
                        <span className="text-red-400"><LogOut size={18} /></span>
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      {[
                        { to: '/products', label: 'Shop All' },
                        { to: '/about', label: 'About Us' },
                        { to: '/contact', label: 'Contact Us' },
                        { to: '/wishlist', label: 'Wishlist', icon: <Heart size={18} /> },
                        { to: '/login', label: 'Sign In', icon: <User size={18} /> },
                      ].map(({ to, label, icon }) => (
                        <Link
                          key={to}
                          to={to}
                          onClick={closeMobile}
                          className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-bg transition-colors font-medium text-base"
                        >
                          <span>{label}</span>
                          {icon && <span className="text-slate-400">{icon}</span>}
                        </Link>
                      ))}
                    </>
                  )}
                </nav>
              </div>

              {/* Drawer Footer */}
              <div className="px-5 py-4 border-t border-slate-100 dark:border-white/10">
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between py-3 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-bg transition-colors font-medium text-sm"
                >
                  <span>{isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;
