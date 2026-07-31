import React from 'react';
import { Play, Scan, PenLine, Banknote } from 'lucide-react';

const QuickActions = ({ onStartRoute, onScanPackage, onUpdateDelivery, onConfirmPayment }) => {
  return (
    <div className="mb-6">
      <h2 className="text-white font-bold text-lg mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button 
          onClick={onStartRoute}
          className="bg-nexus-surface hover:bg-nexus-hover border border-nexus-border rounded-2xl p-4 flex flex-col items-center justify-center gap-3 transition-colors group shadow-lg"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-nexus-primary to-nexus-warning flex items-center justify-center shadow-lg shadow-nexus-primary/20 group-hover:scale-110 transition-transform">
            <Play size={24} className="text-white fill-current" />
          </div>
          <span className="text-nexus-textSecondary font-medium text-sm text-center">Start Route</span>
        </button>
        
        <button 
          onClick={onScanPackage}
          className="bg-nexus-surface hover:bg-nexus-hover border border-nexus-border rounded-2xl p-4 flex flex-col items-center justify-center gap-3 transition-colors group shadow-lg"
        >
          <div className="w-12 h-12 rounded-full bg-nexus-success/10 flex items-center justify-center text-nexus-success group-hover:bg-nexus-success/20 group-hover:scale-110 transition-all">
            <Scan size={24} />
          </div>
          <span className="text-nexus-textSecondary font-medium text-sm text-center">Scan Package</span>
        </button>

        <button 
          onClick={onUpdateDelivery}
          className="bg-nexus-surface hover:bg-nexus-hover border border-nexus-border rounded-2xl p-4 flex flex-col items-center justify-center gap-3 transition-colors group shadow-lg"
        >
          <div className="w-12 h-12 rounded-full bg-nexus-warninglue-500/10 flex items-center justify-center text-nexus-warninglue-500 group-hover:bg-nexus-warninglue-500/20 group-hover:scale-110 transition-all">
            <PenLine size={24} />
          </div>
          <span className="text-nexus-textSecondary font-medium text-sm text-center">Update Delivery</span>
        </button>

        <button 
          onClick={onConfirmPayment}
          className="bg-nexus-surface hover:bg-nexus-hover border border-nexus-border rounded-2xl p-4 flex flex-col items-center justify-center gap-3 transition-colors group shadow-lg"
        >
          <div className="w-12 h-12 rounded-full bg-nexus-warning/10 flex items-center justify-center text-nexus-warning group-hover:bg-nexus-warning/20 group-hover:scale-110 transition-all">
            <Banknote size={24} />
          </div>
          <span className="text-nexus-textSecondary font-medium text-sm text-center">Confirm Payment</span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
