import { motion } from 'framer-motion';
import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';

const ReportCard = ({ title, description, icon: Icon, dateRange, color, onExport }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (onExport) {
      setIsExporting(true);
      try {
        await onExport();
      } catch (err) {
        console.error(err);
      } finally {
        setIsExporting(false);
      }
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-nexus-border shadow-sm flex flex-col justify-between group h-full"
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl ${color.bg} ${color.text}`}>
            <Icon size={24} />
          </div>
          <span className="text-xs font-medium text-nexus-textSecondary dark:text-nexus-textSecondary bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded-md">
            {dateRange}
          </span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-nexus-textSecondary dark:text-nexus-textSecondary mb-6 line-clamp-2">
          {description}
        </p>
      </div>
      
      <button 
        onClick={handleExport}
        disabled={isExporting}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 dark:border-nexus-border text-slate-600 dark:text-nexus-textSecondary font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-orange-500 dark:hover:text-orange-400 transition-colors disabled:opacity-50"
      >
        {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
        {isExporting ? 'Exporting...' : 'Export CSV'}
      </button>
    </motion.div>
  );
};

export default ReportCard;
