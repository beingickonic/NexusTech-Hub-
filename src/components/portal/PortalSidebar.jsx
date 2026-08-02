import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, X, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import UserAvatar from '../common/UserAvatar';
import Tooltip from '../ui/Tooltip';

const PortalSidebar = ({ config, isOpen, setIsOpen }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem(`${config.name.toLowerCase()}-sidebar-collapsed`) === 'true';
  });
  const [expandedMenus, setExpandedMenus] = useState({});

  useEffect(() => {
    localStorage.setItem(`${config.name.toLowerCase()}-sidebar-collapsed`, isCollapsed);
  }, [isCollapsed, config.name]);

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

  const { name, nav, icon: PortalIcon } = config;

  const handleSignOut = async () => {
    await logout();
    navigate(`/${name.toLowerCase()}/login`);
  };

  const toggleSubMenu = (menuName) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const displayName = user?.full_name || user?.email?.split('@')[0] || name;

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
        end={item.exact}
        onClick={() => setIsOpen(false)}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium border-l-4 ${
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-[#111827] border-r border-nexus-border flex flex-col transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'w-20' : 'w-60'}`}
      >
        {/* Logo / Portal Header */}
        <div className="h-16 flex items-center justify-between px-4 flex-shrink-0 border-b border-nexus-border">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg bg-nexus-primary flex-shrink-0">
              {PortalIcon && <PortalIcon size={16} className="text-white" />}
            </div>
            {!isCollapsed && (
              <div>
                <p className="text-nexus-heading font-bold text-sm leading-none">{name}</p>
                <p className="text-nexus-muted text-[10px] leading-none mt-0.5">Portal</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-nexus-muted hover:bg-nexus-surface transition-colors"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1.5 text-nexus-muted hover:text-nexus-heading transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {nav.map((item) => renderNavLink(item))}
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t border-nexus-border flex-shrink-0 space-y-2">
          {isCollapsed ? (
            <Tooltip content={displayName} position="right">
              <div className="flex justify-center py-1.5">
                <UserAvatar src={user?.avatar_url} name={displayName} size="sm" />
              </div>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-2.5 px-2 py-1.5">
              <UserAvatar src={user?.avatar_url} name={displayName} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-nexus-heading text-xs font-semibold truncate">{displayName}</p>
                <p className="text-nexus-muted text-[10px] truncate capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
          )}

          {isCollapsed ? (
            <Tooltip content="Sign Out" position="right">
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center w-12 h-12 rounded-xl text-nexus-muted hover:bg-nexus-error/10 hover:text-nexus-error transition-all duration-200"
              >
                <LogOut size={15} />
              </button>
            </Tooltip>
          ) : (
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2.5 px-3 py-2 w-full rounded-xl text-nexus-muted hover:bg-nexus-error/10 hover:text-nexus-error transition-all text-sm font-medium"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default PortalSidebar;
