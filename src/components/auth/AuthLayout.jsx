import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle, illustration }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-nexus-surface dark:bg-nexus-bg transition-colors duration-300">
      
      {/* Form Section */}
      <div className="w-full md:w-1/2 lg:w-5/12 flex flex-col p-6 sm:p-12 justify-center relative z-10">
        <div className="absolute top-8 left-8">
          <Link to="/" className="flex items-center gap-2 text-nexus-textSecondary hover:text-primary transition-colors">
            <ArrowLeft size={18} /> Back to Home
          </Link>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full mx-auto"
        >
          <div className="mb-10 text-center md:text-left mt-16 md:mt-0">
            <h1 className="text-3xl md:text-4xl font-bold text-nexus-heading mb-3 tracking-tight">{title}</h1>
            <p className="text-nexus-textSecondary dark:text-nexus-muted">{subtitle}</p>
          </div>
          
          <div className="bg-white/80 dark:bg-nexus-bg/80 backdrop-blur-xl rounded-3xl border border-nexus-border p-8 shadow-xl">
            {children}
          </div>
        </motion.div>
      </div>

      {/* Illustration Section */}
      <div className="hidden md:flex md:w-1/2 lg:w-7/12 relative overflow-hidden bg-nexus-bg">
        <div className="absolute inset-0 z-0">
          <img 
            src={illustration || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop"} 
            alt="Authentication" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-nexus-dark-navy to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-nexus-dark-navy via-transparent to-transparent opacity-80" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-end p-16 w-full text-white">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-2xl shadow-glow mb-6">
              N
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              Premium Tech.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-nexus-primary-hover">Elevated Experience.</span>
            </h2>
            <p className="text-lg text-white/80 max-w-lg">
              Join NexusTech Hub to access exclusive deals, track your orders, and manage your premium gear all in one place.
            </p>
          </motion.div>
        </div>
      </div>

    </div>
  );
};

export default AuthLayout;
