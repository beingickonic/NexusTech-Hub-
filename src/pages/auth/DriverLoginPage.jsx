import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowLeft, MapPin } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { supabase } from '../../services/supabaseClient';

const DriverLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { success, data, error: loginError } = await login(email, password);
      
      if (!success) {
        throw new Error(loginError || 'Invalid login credentials');
      }

      // Check role
      if (data.user.role !== 'Driver') {
        await supabase.auth.signOut();
        throw new Error('Access denied. This account is not registered as a Driver.');
      }

      // Explicitly redirect to driver dashboard
      navigate('/driver/dashboard', { replace: true });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-nexus-bg flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-nexus-success rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-nexus-primary rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      <div className="w-full max-w-5xl bg-nexus-bg/80 backdrop-blur-xl rounded-3xl border border-nexus-border shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10">
        
        {/* Left Side - Branding */}
        <div className="md:w-5/12 bg-gradient-to-br from-nexus-success to-[#047857] p-10 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-nexus-warninglack/10"></div>
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-12 text-sm font-medium">
              <ArrowLeft size={16} />
              Back to Home
            </Link>
            
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-6 border border-white/30">
              <MapPin size={32} className="text-white" />
            </div>
            
            <h1 className="text-nexus-errorxl font-bold mb-4 leading-tight">
              Driver<br />Portal
            </h1>
            <p className="text-white/80 text-lg leading-relaxed max-w-sm">
              Deliver efficiently. Update customers in real time.
            </p>
          </div>
          
          <div className="relative z-10 mt-12">
            <div className="space-y-4 text-sm text-white/80">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">✓</div>
                View assigned deliveries
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">✓</div>
                Scan & update packages
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">✓</div>
                Confirm payments & COD
              </div>
            </div>
            
            <div className="mt-12 text-xs text-white/60">
              NexusTech Hub Enterprise ERP &copy; {new Date().getFullYear()}
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="md:w-7/12 p-8 md:p-12 flex flex-col justify-center bg-nexus-bg">
          <div className="max-w-md w-full mx-auto">
            <h2 className="text-2xl font-bold text-white mb-2">Sign in to <span className="text-nexus-success">Driver Portal</span></h2>
            <p className="text-nexus-textSecondary mb-8 text-sm">Enter your credentials to access your routes</p>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-red-400 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-nexus-textSecondary ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-nexus-textSecondary" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-nexus-surface border border-nexus-border/50 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-nexus-success focus:ring-1 focus:ring-[#10b981] transition-all"
                    placeholder="driver@nexustech.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-medium text-nexus-textSecondary">Password</label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-nexus-textSecondary" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-nexus-surface border border-nexus-border/50 rounded-xl py-3.5 pl-11 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-nexus-success focus:ring-1 focus:ring-[#10b981] transition-all"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-nexus-textSecondary hover:text-nexus-textSecondary transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-nexus-border bg-nexus-surface text-nexus-success focus:ring-[#10b981] focus:ring-offset-[#0a0e1a]" />
                  <span className="text-nexus-textSecondary group-hover:text-nexus-textSecondary transition-colors">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-nexus-success hover:text-[#059669] font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-nexus-success to-[#047857] hover:from-[#34d399] hover:to-nexus-success text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#10b981]/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center mt-4 text-lg"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Login'
                )}
              </button>
            </form>
            
            <div className="mt-8 text-center text-sm text-nexus-textSecondary">
              Not a driver? <Link to="/login" className="text-nexus-success hover:text-[#059669] font-medium transition-colors">Go to main login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverLoginPage;
