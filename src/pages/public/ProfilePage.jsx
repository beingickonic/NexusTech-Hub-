import { useAuth } from '../../auth/AuthContext';
import { User, Mail, Shield, LogOut, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="py-20 min-h-screen bg-nexus-surface dark:bg-nexus-bg transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 lg:px-8">
        <h1 className="text-3xl font-bold text-nexus-heading mb-8">My Profile</h1>
        
        <div className="bg-nexus-card rounded-3xl p-8 border border-nexus-border shadow-sm">
          <div className="flex items-center gap-6 mb-8 border-b border-nexus-border pb-8">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary text-4xl font-bold">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-nexus-heading">{user?.full_name}</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-nexus-surface dark:bg-nexus-bg rounded-xl text-nexus-textSecondary">
                <User size={20} />
              </div>
              <div>
                <p className="text-sm text-nexus-textSecondary dark:text-nexus-muted">Full Name</p>
                <p className="font-medium text-nexus-heading">{user?.full_name}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-nexus-surface dark:bg-nexus-bg rounded-xl text-nexus-textSecondary">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-sm text-nexus-textSecondary dark:text-nexus-muted">Email Address</p>
                <p className="font-medium text-nexus-heading">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-nexus-surface dark:bg-nexus-bg rounded-xl text-nexus-textSecondary">
                <Shield size={20} />
              </div>
              <div>
                <p className="text-sm text-nexus-textSecondary dark:text-nexus-muted">Account Type</p>
                <p className="font-medium text-nexus-heading capitalize">{user?.role}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Link 
              to="/orders"
              className="flex items-center gap-2 px-6 py-3 bg-nexus-heading hover:bg-nexus-dark-navy dark:bg-white dark:hover:bg-nexus-surface text-white dark:text-nexus-navy rounded-xl font-medium transition-colors shadow-lg"
            >
              <Package size={18} /> My Orders
            </Link>
            <button 
              onClick={logout}
              className="flex items-center gap-2 px-6 py-3 bg-nexus-error/5 hover:bg-nexus-error/10 dark:bg-nexus-error/10 dark:hover:bg-nexus-error/20 text-nexus-error rounded-xl font-medium transition-colors"
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
