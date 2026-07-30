import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../auth/AuthContext';
import { ROLE_PORTAL_MAP } from '../../auth/authService';

/**
 * Beautiful generic branded portal login page.
 * @param {Object} portalConfig
 * @param {string}   portalConfig.name        - "Dispatch" | "Driver" | etc.
 * @param {string}   portalConfig.subtitle     - Sub-headline
 * @param {React.Component} portalConfig.icon  - Lucide icon
 * @param {string}   portalConfig.accentHex    - Primary hex color
 * @param {string}   portalConfig.accentLight  - Lighter hex (for hover / ring)
 * @param {string}   portalConfig.bgFrom       - Tailwind gradient from class
 * @param {string}   portalConfig.bgVia        - Tailwind gradient via class
 * @param {string}   portalConfig.bgTo         - Tailwind gradient to class
 * @param {string[]} portalConfig.features     - 3-4 bullet points
 */
const PortalLoginPage = ({ portalConfig }) => {
  const {
    name, subtitle, icon: PortalIcon,
    accentHex, bgFrom, bgVia, bgTo, features = []
  } = portalConfig;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  // If already logged in → redirect to correct portal
  useEffect(() => {
    if (user) {
      const dest = ROLE_PORTAL_MAP[user.role] || '/profile';
      console.log("[DEBUG PORTAL LOGIN - Effect] Role:", user.role);
      console.log("[DEBUG PORTAL LOGIN - Effect] Redirecting to:", dest);
      navigate(dest, { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        const dest = ROLE_PORTAL_MAP[res.data.user.role] || '/profile';
        console.log("[DEBUG PORTAL LOGIN - Submit] Role:", res.data.user.role);
        console.log("[DEBUG PORTAL LOGIN - Submit] Redirecting to:", dest);
        navigate(dest, { replace: true });
      } else {
        setError(res.message || 'Invalid credentials');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400 dark:placeholder:text-white/30';

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#070B1A] overflow-hidden">

      {/* ── Left panel: branding ── */}
      <motion.div
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`hidden lg:flex flex-col justify-between w-[45%] xl:w-[42%] min-h-screen relative overflow-hidden bg-gradient-to-br ${bgFrom} ${bgVia} ${bgTo} p-12`}
      >
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Glow orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: accentHex }} />
        <div className="absolute bottom-24 -left-12 w-64 h-64 rounded-full blur-3xl opacity-10"
          style={{ background: accentHex }} />

        {/* NexusTech logo */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2.5 text-white/80 hover:text-white transition-colors w-fit">
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">Back to NexusTech Hub</span>
          </Link>
        </div>

        {/* Portal hero */}
        <div className="relative z-10 space-y-8">
          {/* Large icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl"
            style={{ background: `linear-gradient(135deg, ${accentHex}cc, ${accentHex}66)`, boxShadow: `0 24px 64px ${accentHex}40` }}
          >
            {PortalIcon && <PortalIcon size={44} className="text-white" />}
          </motion.div>

          <div>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl xl:text-5xl font-extrabold text-white leading-tight"
            >
              {name} <span className="block opacity-70">Portal</span>
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/60 text-lg mt-3 max-w-xs"
            >
              {subtitle}
            </motion.p>
          </div>

          {/* Feature bullets */}
          <motion.ul
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-white/70 text-sm">
                <CheckCircle2 size={16} style={{ color: accentHex }} className="flex-shrink-0" />
                {f}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Footer brand */}
        <div className="relative z-10">
          <p className="text-white/30 text-xs">
            NexusTech Hub Enterprise ERP · {new Date().getFullYear()}
          </p>
        </div>
      </motion.div>

      {/* ── Right panel: login form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative">
        {/* Mobile back link */}
        <Link to="/" className="lg:hidden absolute top-6 left-6 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
          <ArrowLeft size={14} /> Home
        </Link>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md"
        >
          {/* Mobile icon */}
          <div className="lg:hidden flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl"
              style={{ background: `linear-gradient(135deg, ${accentHex}, ${accentHex}aa)` }}>
              {PortalIcon && <PortalIcon size={30} className="text-white" />}
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Sign in to <span style={{ color: accentHex }}>{name}</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5">
              Enter your credentials to access the {name} portal
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Work Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                className={inputCls}
                style={{ '--tw-ring-color': `${accentHex}40` }}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputCls + ' pr-12'}
                  style={{ '--tw-ring-color': `${accentHex}40` }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs hover:underline" style={{ color: accentHex }}>
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg mt-2"
              style={{ background: `linear-gradient(135deg, ${accentHex}, ${accentHex}cc)`, boxShadow: `0 8px 24px ${accentHex}40` }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : `Sign In to ${name} Portal`}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 text-center">
            <p className="text-xs text-slate-400">
              Not your portal?{' '}
              <Link to="/login" className="font-semibold hover:underline" style={{ color: accentHex }}>
                Go to main login
              </Link>
            </p>
            <p className="text-[11px] text-slate-300 dark:text-slate-600 mt-3">
              NexusTech Hub Enterprise ERP · Secure Portal Access
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PortalLoginPage;
