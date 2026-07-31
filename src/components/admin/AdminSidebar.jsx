import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Headset,
  FolderOpen,
  Paperclip,
  Calendar,
  Network,
  MessageSquare,
  Users,
  BarChart3,
  Settings,
  LogOut,
  PieChart,
  FileText,
  CreditCard,
  Receipt,
  Activity,
  UserRound
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import darkLogo from '../../assets/logo/logo-dark.png';
import lightLogo from '../../assets/logo/logo-light.png';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard',   path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Daily Tasks', path: '/admin/tasks',     icon: CheckSquare }
    ]
  },
  {
    label: 'Office Management',
    items: [
      { name: 'Office Support', path: '/admin/support',  icon: Headset },
      { name: 'Record Keeping', path: '/admin/records',  icon: FolderOpen },
      { name: 'Supplies',       path: '/admin/supplies', icon: Paperclip }
    ]
  },
  {
    label: 'Organization',
    items: [
      { name: 'Scheduling',         path: '/admin/scheduling',   icon: Calendar },
      { name: 'Team Coordination',  path: '/admin/coordination', icon: Network }
    ]
  },
  {
    label: 'People',
    items: [
      { name: 'Communication', path: '/admin/communication', icon: MessageSquare },
      { name: 'Employees',     path: '/admin/employees',     icon: Users },
      { name: 'Customers',     path: '/admin/customers',     icon: UserRound }
    ]
  },
  {
    label: 'Finance',
    items: [
      { name: 'Dashboard', path: '/admin/finance/dashboard', icon: PieChart },
      { name: 'Invoices',  path: '/admin/finance/invoices',  icon: FileText },
      { name: 'Payments',  path: '/admin/finance/payments',  icon: CreditCard },
      { name: 'Expenses',  path: '/admin/finance/expenses',  icon: Receipt }
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

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  const renderNavLink = (item) => (
    <NavLink
      key={item.name}
      to={item.path}
      onClick={() => setIsOpen(false)}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm ${
          isActive
            ? 'bg-nexus-primary/10 text-nexus-primary dark:text-nexus-primary font-semibold'
            : 'text-nexus-muted hover:bg-nexus-surface dark:hover:bg-nexus-hover/50 hover:text-nexus-heading'
        }`
      }
    >
      <item.icon size={17} className="flex-shrink-0" />
      <span className="truncate">{item.name}</span>
    </NavLink>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-nexus-surface/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-white dark:bg-nexus-bg border-r border-nexus-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-nexus-border flex-shrink-0">
          <img src={darkLogo}  alt="NexusTech Admin" className="h-7 object-contain dark:block hidden" />
          <img src={lightLogo} alt="NexusTech Admin" className="h-7 object-contain block dark:hidden" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-nexus-textSecondary dark:text-nexus-muted">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map(item => renderNavLink(item))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-nexus-border flex-shrink-0">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-nexus-muted hover:bg-nexus-error/5 dark:hover:bg-nexus-error/10 hover:text-nexus-error dark:hover:text-nexus-error transition-all duration-200 font-medium text-sm"
          >
            <LogOut size={17} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
