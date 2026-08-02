import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UserRound,
  BarChart3,
  Settings,
  LogOut,
  PieChart,
  FileText,
  CreditCard,
  Receipt,
  Activity,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import Tooltip from '../ui/Tooltip';
import darkLogo from '../../assets/logo/logo-dark.png';
import lightLogo from '../../assets/logo/logo-light.png';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard }
    ]
  },
  {
    label: 'People',
    items: [
      { name: 'Customers', path: '/admin/customers', icon: UserRound }
    ]
  },
  {
    label: 'Finance',
    items: [
      {
        name: 'Finance ERP',
        icon: PieChart,
        subItems: [
          { name: 'Dashboard', path: '/admin/finance/dashboard', icon: PieChart },
          { name: 'Invoices',  path: '/admin/finance/invoices',  icon: FileText },
          { name: 'Payments',  path: '/admin/finance/payments',  icon: CreditCard },
          { name: 'Expenses',  path: '/admin/finance/expenses',  icon: Receipt }
        ]
      }
    ]
  },
  {
    label: 'System',
    items: [
      { name: 'System Monitor', path: '/admin/monitor', icon: Activity },
      { name: 'Reports',  path: '/admin/reports',  icon: BarChart3 },
      { name: 'Settings', path: '/admin/settings', icon: Settings }
    ]
  }
];

const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });
  const [expandedMenus, setExpandedMenus] = useState({});

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', isCollapsed);
  }, [isCollapsed]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  const toggleSubMenu = (menuName) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const renderNavLink = (item) => {
    const hasSubItems = !!item.subItems;
    const isExpanded = !!expandedMenus[item.name];

    if (hasSubItems) {
      return (
        <div key={item.name} className="space-y-1">
          <button
            onClick={() => toggleSubMenu(item.name)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm text-nexus-muted hover:bg-nexus-primary/5 hover:text-nexus-heading dark:hover:text-nexus-primary`}
          >
            <div className="flex items-center gap-3">
              <item.icon size={17} className="flex-shrink-0" />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </div>
            {!isCollapsed && (
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              />
            )}
          </button>
          {!isCollapsed && isExpanded && (
            <div className="pl-6 space-y-1 border-l border-nexus-border ml-5 mt-1">
              {item.subItems.map((sub) => (
                <NavLink
                  key={sub.name}
                  to={sub.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 font-medium text-xs border-l-2 ${
                      isActive
                        ? 'bg-nexus-primary/10 border-nexus-primary text-nexus-primary font-semibold'
                        : 'border-transparent text-nexus-muted hover:text-nexus-heading hover:bg-nexus-primary/5'
                    }`
                  }
                >
                  <sub.icon size={14} className="flex-shrink-0" />
                  <span className="truncate">{sub.name}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      );
    }

    const content = (
      <NavLink
        key={item.name}
        to={item.path}
        onClick={() => setIsOpen(false)}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm border-l-4 ${
            isActive
              ? 'bg-nexus-primary/10 border-nexus-primary text-nexus-primary shadow-glow font-semibold'
              : 'border-transparent text-nexus-muted hover:bg-nexus-primary/5 dark:hover:bg-nexus-hover/10 hover:text-nexus-heading dark:hover:text-nexus-primary'
          }`
        }
      >
        <item.icon size={17} className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
        {!isCollapsed && <span className="truncate">{item.name}</span>}
      </NavLink>
    );

    return isCollapsed ? (
      <Tooltip key={item.name} content={item.name} position="right">
        {content}
      </Tooltip>
    ) : content;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-nexus-surface/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-[#111827] border-r border-nexus-border transform transition-all duration-300 ease-in-out lg:translate-x-0 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'w-20' : 'w-60'}`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-nexus-border flex-shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <img src={darkLogo} alt="NexusTech Admin" className="h-7 object-contain block dark:hidden" />
            <img src={lightLogo} alt="NexusTech Admin" className="h-7 object-contain hidden dark:block" />
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-nexus-muted hover:bg-nexus-surface transition-colors"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="space-y-1">
              {!isCollapsed && (
                <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-nexus-muted">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map(item => renderNavLink(item))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-nexus-border flex-shrink-0">
          {isCollapsed ? (
            <Tooltip content="Sign Out" position="right">
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center w-12 h-12 rounded-xl text-nexus-muted hover:bg-nexus-error/10 hover:text-nexus-error transition-all duration-200"
              >
                <LogOut size={17} />
              </button>
            </Tooltip>
          ) : (
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-nexus-muted hover:bg-nexus-error/5 dark:hover:bg-nexus-error/10 hover:text-nexus-error dark:hover:text-nexus-error transition-all duration-200 font-medium text-sm"
            >
              <LogOut size={17} />
              Sign Out
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
