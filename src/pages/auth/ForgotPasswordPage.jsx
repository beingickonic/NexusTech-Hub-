import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import { Mail, CheckCircle } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <AuthLayout 
      title="Reset Password" 
      subtitle="Enter your email to receive a reset link."
    >
      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-nexus-textSecondary" size={18} />
              <input 
                type="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F8FAFC] dark:bg-nexus-bg border border-slate-200 dark:border-nexus-border rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl shadow-glow transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </button>
          
          <p className="text-center text-sm text-slate-600 dark:text-gray-400 mt-6">
            Remembered your password? <Link to="/login" className="text-primary font-bold hover:underline">Back to Login</Link>
          </p>
        </form>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Check your email</h3>
          <p className="text-nexus-textSecondary dark:text-gray-400 mb-8">
            We've sent a password reset link to <span className="font-medium text-slate-700 dark:text-gray-300">{email}</span>
          </p>
          <button 
            onClick={() => setIsSubmitted(false)}
            className="w-full py-3.5 border border-slate-200 dark:border-nexus-border rounded-xl font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          >
            Try another email
          </button>
        </div>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
