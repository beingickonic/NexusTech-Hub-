import { useState } from 'react';
import { Mail, ArrowRight, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabaseClient';

// Simple RFC-compliant email regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Newsletter = () => {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError]     = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();

    // Reset previous feedback
    setSuccess('');
    setError('');

    // --- Client-side email validation ---
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Please enter your email address.');
      return;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setError('Please enter a valid email address (e.g. you@example.com).');
      return;
    }

    setLoading(true);

    try {
      const { error: dbError } = await supabase
        .from('newsletter_subscribers')
        .insert({ email: trimmed.toLowerCase() });

      if (dbError) {
        // Supabase unique-constraint violation code
        if (dbError.code === '23505') {
          setError('You are already subscribed.');
        } else {
          setError('Newsletter subscription is temporarily unavailable. Please try again.');
        }
      } else {
        setSuccess('✓ Thank you for subscribing!');
        setEmail('');
        // Auto-clear success after 6 s
        setTimeout(() => setSuccess(''), 6000);
      }
    } catch (err) {
      console.error('Newsletter subscribe error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-[#1E293B] to-[#0F172A] p-7 sm:p-10 lg:p-16 text-center shadow-2xl border border-nexus-border"
      >
        {/* Floating Glows */}
        <div className="absolute top-[-50%] left-[-10%] w-64 h-64 bg-primary/30 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-50%] right-[-10%] w-64 h-64 bg-accent/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white mb-6 backdrop-blur-sm border border-white/20">
            <Mail size={28} />
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
            Join the NexusTech Hub
          </h2>
          <p className="text-sm sm:text-base text-gray-300 mb-6 sm:mb-8 max-w-md mx-auto">
            Subscribe to our newsletter for exclusive deals, early access to new products, and tech insights.
          </p>

          {/* Success state — replaces the form */}
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3 bg-green-500/20 border border-green-500/40 text-green-300 px-6 py-4 rounded-2xl text-sm font-semibold"
              >
                <CheckCircle size={20} className="shrink-0 text-green-400" />
                {success}
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                id="newsletter-form"
                className="w-full max-w-md flex flex-col sm:flex-row gap-3 sm:gap-0 relative z-20"
                onSubmit={handleSubscribe}
                noValidate
              >
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter your email address"
                  disabled={loading}
                  className="w-full h-14 bg-white/5 backdrop-blur-sm border border-nexus-border text-white placeholder-slate-400 px-6 rounded-2xl sm:rounded-r-none outline-none focus:bg-white/10 focus:border-primary/50 transition-all shadow-inner text-sm disabled:opacity-60"
                  aria-label="Email address"
                  aria-required="true"
                />
                <button
                  id="newsletter-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="h-14 shrink-0 sm:w-auto w-full bg-nexus-primary hover:bg-[#ff5a2e] disabled:bg-nexus-primary/60 text-white px-8 rounded-2xl sm:rounded-l-none font-bold transition-all shadow-[0_0_20px_rgba(255,107,87,0.3)] flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(255,107,87,0.5)] disabled:hover:shadow-[0_0_20px_rgba(255,107,87,0.3)] text-sm whitespace-nowrap"
                  aria-label="Subscribe to newsletter"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    <>
                      Subscribe <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Inline error message */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 mt-3 text-red-400 text-xs font-medium"
                role="alert"
              >
                <AlertCircle size={13} className="shrink-0" />
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <p className="text-xs text-gray-500 mt-4">
            By subscribing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </motion.div>
    </section>
  );
};

export default Newsletter;
