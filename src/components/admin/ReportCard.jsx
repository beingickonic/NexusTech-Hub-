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
      className="bg-white/80 dark:bg-nexus-card/80 backdrop-blur-md p-6 rounded-2xl border border-nexus-border shadow-sm flex flex-col justify-between group h-full"
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl ${color.bg} ${color.text}`}>
            <Icon size={24} />
          </div>
          <span className="text-xs font-medium text-nexus-muted bg-nexus-surface/50 px-2 py-1 rounded-md">
            {dateRange}
          </span>
        </div>
        <h3 className="text-lg font-bold text-nexus-heading mb-2">{title}</h3>
        <p className="text-sm text-nexus-muted mb-6 line-clamp-2">
          {description}
        </p>
      </div>
      
      <button 
        onClick={handleExport}
        disabled={isExporting}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-nexus-border text-nexus-muted font-medium hover:bg-nexus-surface dark:hover:bg-nexus-hover/50 hover:text-nexus-primary dark:hover:text-nexus-primary transition-colors disabled:opacity-50"
      >
        {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
        {isExporting ? 'Exporting...' : 'Export CSV'}
      </button>
    </motion.div>
  );
};

export default ReportCard;
