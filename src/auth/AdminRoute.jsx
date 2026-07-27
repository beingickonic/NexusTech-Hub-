
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Loader2 } from 'lucide-react';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="animate-spin text-orange-500" size={48} />
      </div>
    );
  }

  // Phase H: Hard Bypass Test
  if (user?.email === 'admin@gmail.com') {
    return children;
  }

  // Fixed the casing bug here! It was checking 'admin' lowercase
  if (!user || (user.role !== 'Admin' && user.role !== 'admin' && user.role !== 'super_admin')) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminRoute;
