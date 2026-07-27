import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#020617]">
        <Loader2 className="animate-spin text-orange-500 w-12 h-12" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children || <Outlet />;
};

export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#020617]">
        <Loader2 className="animate-spin text-orange-500 w-12 h-12" />
      </div>
    );
  }

  if (!user || (user.role !== 'Admin' && user.role !== 'super_admin')) {
    return <Navigate to="/products" replace />;
  }

  return children || <Outlet />;
};

export const ManagerRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#020617]">
        <Loader2 className="animate-spin text-orange-500 w-12 h-12" />
      </div>
    );
  }

  if (!user || (user.role !== 'Admin' && user.role !== 'super_admin' && user.role !== 'Manager')) {
    return <Navigate to="/products" replace />;
  }

  return children || <Outlet />;
};

export const RoleGate = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  if (loading || !user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
};
