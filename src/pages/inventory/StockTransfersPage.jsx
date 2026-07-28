import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, Sparkles } from 'lucide-react';

const StockTransfersPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Stock Transfers</h1>
          <p className="text-slate-500 text-sm mt-1">Manage inventory transfers between warehouses</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-12 flex flex-col items-center justify-center text-center min-h-[400px]"
      >
        <div className="w-20 h-20 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mb-6 relative">
          <ArrowRightLeft size={36} className="text-primary dark:text-primary" />
          <Sparkles size={20} className="text-amber-500 absolute -top-1 -right-1" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Coming Soon</h2>
        <p className="text-slate-500 max-w-md mx-auto mb-8">
          The Stock Transfers module is currently under development. Soon you'll be able to track, authorize, and manage multi-warehouse stock movements with ease.
        </p>
        <button disabled className="bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 px-6 py-3 rounded-xl font-medium cursor-not-allowed">
          Stay Tuned
        </button>
      </motion.div>
    </div>
  );
};

export default StockTransfersPage;
