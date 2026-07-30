import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { ROLE_PORTAL_MAP } from '../../auth/authService';
import AuthLayout from '../../components/auth/AuthLayout';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirm_password) {
      return setError('Passwords do not match');
    }
    
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setIsSubmitting(true);
    
    try {
      const res = await register(formData);
      if (res.success) {
        const dest = ROLE_PORTAL_MAP[res.data.user.role] || '/profile';
        console.log("[DEBUG REGISTER] Role:", res.data.user.role);
        console.log("[DEBUG REGISTER] Redirecting to:", dest);
        navigate(dest);
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch {
      setError('An error occurred during registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Join NexusTech Hub for exclusive benefits."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium border border-red-200 dark:border-red-800/30">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Full Name</label>
          <input 
            type="text" name="full_name" required
            value={formData.full_name} onChange={handleChange}
            className="w-full bg-[#F8FAFC] dark:bg-nexus-bg border border-slate-200 dark:border-nexus-border rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            placeholder="Mary Ivy"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Email Address</label>
          <input 
            type="email" name="email" required
            value={formData.email} onChange={handleChange}
            className="w-full bg-[#F8FAFC] dark:bg-nexus-bg border border-slate-200 dark:border-nexus-border rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-1">
          <div className="relative">
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Password</label>
            <input 
              type={showPassword ? "text" : "password"} name="password" required
              value={formData.password} onChange={handleChange}
              className="w-full bg-[#F8FAFC] dark:bg-nexus-bg border border-slate-200 dark:border-nexus-border rounded-xl pl-4 pr-12 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="••••••••"
            />
            <button 
              type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[30px] text-nexus-textSecondary hover:text-slate-600 dark:hover:text-gray-200 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Confirm Password</label>
          <input 
            type={showPassword ? "text" : "password"} name="confirm_password" required
            value={formData.confirm_password} onChange={handleChange}
            className="w-full bg-[#F8FAFC] dark:bg-nexus-bg border border-slate-200 dark:border-nexus-border rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            placeholder="••••••••"
          />
        </div>

        <div className="flex items-start gap-2 pt-2">
          <input type="checkbox" id="terms" required className="mt-1 rounded border-slate-300 text-primary focus:ring-primary accent-primary w-4 h-4 cursor-pointer" />
          <label htmlFor="terms" className="text-sm text-slate-600 dark:text-gray-400">
            I agree to the <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
          </label>
        </div>

        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 bg-primary hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl shadow-glow transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
        >
          {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : 'Create Account'}
        </button>

        <p className="text-center text-sm text-slate-600 dark:text-gray-400 mt-6">
          Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Sign in</Link>
        </p>

      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
