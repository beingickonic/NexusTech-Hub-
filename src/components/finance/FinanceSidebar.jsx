import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, X, PieChart, FileText, CreditCard, Receipt, BarChart3, Settings, Landmark, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import UserAvatar from '../common/UserAvatar';

const navItems = [
  { name: 'Dashboard', path: '/finance/dashboard', icon: PieChart },
  { name: 'Approvals', path: '/finance/approvals', icon: ShieldCheck },
  { name: 'Invoices', path: '/finance/invoices', icon: FileText },
  { name: 'Payments', path: '/finance/payments', icon: CreditCard },
  { name: 'Expenses', path: '/finance/expenses', icon: Receipt },
  { name: 'Reports', path: '/finance/reports', icon: BarChart3 },
  { name: 'Settings', path: '/finance/settings', icon: Settings },
];

const FinanceSidebar = ({ isOpen, setIsOpen }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  const displayName = user?.full_name || user?.email?.split('@')[0] || 'User';

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
        className={`fixed inset-y-0 left-0 z-50 w-60 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-white dark:bg-[#111827] border-r border-nexus-border`}
      >
        {/* Logo / Portal Header */}
        <div className="h-16 flex items-center justify-between px-4 flex-shrink-0 border-b border-nexus-border">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg bg-nexus-primary"
            >
              <Landmark size={16} className="text-white" />
            </div>
            <div>
              <p className="text-nexus-heading font-bold text-sm leading-none">Finance ERP</p>
              <p className="text-nexus-muted text-[10px] leading-none mt-0.5">Nexus Tech Hub</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1.5 text-nexus-muted hover:text-nexus-heading transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium border-l-4 ${
                  isActive
                    ? 'bg-nexus-primary/10 border-nexus-primary text-nexus-primary shadow-glow font-semibold'
                    : 'border-transparent text-nexus-muted hover:bg-nexus-primary/5 dark:hover:bg-nexus-hover/10 hover:text-nexus-heading dark:hover:text-nexus-primary'
                }`
              }
            >
              <item.icon size={17} className="flex-shrink-0" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t border-nexus-border flex-shrink-0 space-y-2">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <UserAvatar src={user?.avatar_url} name={displayName} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-nexus-heading text-xs font-semibold truncate">{displayName}</p>
              <p className="text-nexus-muted text-[10px] truncate capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2.5 px-3 py-2 w-full rounded-xl text-nexus-muted hover:bg-nexus-error/10 hover:text-nexus-error transition-all text-sm font-medium"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default FinanceSidebar;
