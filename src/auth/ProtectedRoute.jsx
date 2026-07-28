import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Loader2 } from 'lucide-react';
import { ROLE_PORTAL_MAP } from './authService';

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#020617]">
    <Loader2 className="animate-spin text-orange-500 w-12 h-12" />
  </div>
);

// ── Customer / General Protected ───────────────────────────────
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  
  if (user.role && user.role !== 'Customer') {
    return <Navigate to={ROLE_PORTAL_MAP[user.role] || "/403"} replace />;
  }

  return children || <Outlet />;
};

// ── Admin ──────────────────────────────────────────────────────
export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user || !['Admin', 'super_admin'].includes(user.role))
    return <Navigate to="/403" replace />;
  return children || <Outlet />;
};

// ── Manager (Admin + Manager) ──────────────────────────────────
export const ManagerRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user || !['Admin', 'super_admin', 'Manager'].includes(user.role))
    return <Navigate to="/403" replace />;
  return children || <Outlet />;
};

// ── Dispatch Officer ───────────────────────────────────────────
export const DispatchRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/dispatch/login" replace />;
  if (!['Admin', 'super_admin', 'Manager', 'Dispatch_Officer'].includes(user.role))
    return <Navigate to="/403" replace />;
  return children || <Outlet />;
};

// ── Driver ─────────────────────────────────────────────────────
export const DriverRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/driver/login" replace />;
  if (!['Admin', 'super_admin', 'Driver'].includes(user.role))
    return <Navigate to="/403" replace />;
  return children || <Outlet />;
};

// ── Inventory / Warehouse ─────────────────────────────────────
export const InventoryRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/inventory/login" replace />;
  if (!['Admin', 'super_admin', 'Manager', 'Warehouse_Staff', 'inventory'].includes(user.role))
    return <Navigate to="/403" replace />;
  return children || <Outlet />;
};

// ── Finance ────────────────────────────────────────────────────
export const FinanceRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/finance/login" replace />;
  if (!['Admin', 'super_admin', 'Finance_Officer'].includes(user.role))
    return <Navigate to="/403" replace />;
  return children || <Outlet />;
};

// ── Supplier ──────────────────────────────────────────────────
export const SupplierRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/supplier/login" replace />;
  if (!['Admin', 'super_admin', 'Supplier'].includes(user.role))
    return <Navigate to="/403" replace />;
  return children || <Outlet />;
};

// ── Role Gate (inline conditional render) ─────────────────────
export const RoleGate = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();
  if (loading || !user || !allowedRoles.includes(user.role)) return null;
  return <>{children}</>;
};
