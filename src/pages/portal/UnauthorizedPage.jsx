import { motion } from 'framer-motion';
import { ShieldOff, ArrowLeft, Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { ROLE_PORTAL_MAP } from '../../auth/authService';

const UnauthorizedPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const goToMyPortal = () => {
    if (user) {
      navigate(ROLE_PORTAL_MAP[user.role] || '/profile');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      {/* Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 rounded-full bg-red-500/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 text-center max-w-md"
      >
        {/* Icon */}
        <motion.div
          initial={{ rotate: -10 }}
          animate={{ rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-24 h-24 bg-red-500/15 border border-red-500/30 rounded-3xl flex items-center justify-center mx-auto mb-6"
        >
          <ShieldOff size={44} className="text-red-400" />
        </motion.div>

        <h1 className="text-5xl font-extrabold text-white mb-2">403</h1>
        <h2 className="text-xl font-bold text-white mb-3">Access Denied</h2>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          You don't have permission to access this portal.
          {user && (
            <span className="block mt-1">
              Your role <span className="text-white font-semibold">({user.role?.replace('_', ' ')})</span> does not have access to this section.
            </span>
          )}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={goToMyPortal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-colors shadow-lg shadow-orange-500/25"
          >
            <Home size={16} />
            Go to My Portal
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 font-semibold text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>

        <Link
          to="/login"
          className="block mt-6 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          Sign in with a different account
        </Link>
      </motion.div>
    </div>
  );
};

export default UnauthorizedPage;
