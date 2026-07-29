import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Boxes,
  ReceiptText,
  MessageSquare,
  Headset,
  Truck,
  UserCheck,
  Building2,
  TrendingUp,
  Warehouse,
  Tag,
  Star,
  Bell,
  FileText,
  Ticket
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { RoleGate } from '../../auth/ProtectedRoute';
import darkLogo from '../../assets/logo/logo-dark.png';
import lightLogo from '../../assets/logo/logo-light.png';

const ADMIN_ONLY  = ['Admin', 'super_admin'];
const STAFF       = ['Admin', 'super_admin', 'Manager'];
const DISPATCH    = ['Admin', 'super_admin', 'Manager', 'Dispatch_Officer'];
const WAREHOUSE   = ['Admin', 'super_admin', 'Manager', 'Warehouse_Staff'];
const FINANCE     = ['Admin', 'super_admin', 'Finance_Officer'];

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, roles: null }
    ]
  },
  {
    label: 'Sales',
    items: [
      { name: 'Orders',     path: '/admin/orders',    icon: ShoppingCart, roles: null },
      { name: 'Customers',  path: '/admin/customers', icon: Users,        roles: ADMIN_ONLY },
      { name: 'Products',   path: '/admin/products',  icon: Package,      roles: null },
      { name: 'Inventory',  path: '/admin/inventory', icon: Warehouse,    roles: WAREHOUSE },
    ]
  },
  {
    label: 'Operations',
    items: [
      { name: 'Dispatch',  path: '/admin/dispatch', icon: Truck,     roles: DISPATCH },
      { name: 'Drivers',   path: '/admin/drivers',  icon: UserCheck, roles: DISPATCH },
      { name: 'Suppliers', path: '/admin/suppliers',icon: Building2, roles: STAFF },
    ]
  },
  {
    label: 'Finance',
    items: [
      { name: 'Finance',  path: '/admin/finance',   icon: TrendingUp,  roles: FINANCE },
      { name: 'Payments', path: '/admin/payments',  icon: ReceiptText, roles: ADMIN_ONLY },
      { name: 'Manual Pymts', path: '/admin/payments/manual', icon: ReceiptText, roles: ADMIN_ONLY },
      { name: 'Invoices', path: '/admin/invoices',  icon: FileText,    roles: ADMIN_ONLY },
    ]
  },
  {
    label: 'Reports & Tools',
    items: [
      { name: 'Reviews',   path: '/admin/reviews',   icon: Star,        roles: null },
      { name: 'Reports',   path: '/admin/reports',   icon: BarChart3,   roles: ADMIN_ONLY },
      { name: 'Refunds',   path: '/admin/refunds',   icon: ReceiptText, roles: STAFF },
      { name: 'Support',   path: '/admin/tickets',   icon: Headset,     roles: ADMIN_ONLY },
      { name: 'User Mgmt', path: '/admin/users',     icon: Users,       roles: ADMIN_ONLY },
      { name: 'Settings',  path: '/admin/settings',  icon: Settings,    roles: ADMIN_ONLY },
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
            ? 'bg-orange-500/10 text-orange-600 dark:text-orange-500 font-semibold'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
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
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <img src={darkLogo}  alt="NexusTech Admin" className="h-7 object-contain dark:block hidden" />
          <img src={lightLogo} alt="NexusTech Admin" className="h-7 object-contain block dark:hidden" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {NAV_SECTIONS.map((section) => {
            const visibleItems = section.items.filter(item => {
              if (!item.roles) return true;
              return item.roles.includes(user?.role);
            });
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.label}>
                <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">
                  {section.label}
                </p>
                <div className="space-y-0.5">
                  {visibleItems.map(item => renderNavLink(item))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-500 transition-all duration-200 font-medium text-sm"
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
