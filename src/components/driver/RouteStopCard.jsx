import React from 'react';
import { MapPin, Navigation, CheckCircle2, Clock } from 'lucide-react';

const RouteStopCard = ({ stop, onNavigate, onMarkArrived, onComplete }) => {
  return (
    <div className={`relative pl-8 pb-8 ${stop.isLast ? '' : 'border-l-2 border-nexus-border/50 ml-4'}`}>
      {/* Timeline Node */}
      <div className={`absolute top-0 -left-1.5 w-4 h-4 rounded-full border-4 border-[#0a0e1a] ${
        stop.status === 'completed' ? 'bg-nexus-success' :
        stop.status === 'arrived' ? 'bg-nexus-warning' :
        'bg-slate-500'
      } ${!stop.isLast && 'ml-4'}`} style={stop.isLast ? { left: '10px' } : {}} />
      
      {/* If it's the last item, we need a custom marker positioning since there's no border-l-2 */}
      {stop.isLast && (
        <div className={`absolute top-0 left-3 w-4 h-4 rounded-full border-4 border-[#0a0e1a] ${
          stop.status === 'completed' ? 'bg-nexus-success' :
          stop.status === 'arrived' ? 'bg-nexus-warning' :
          'bg-slate-500'
        }`} />
      )}

      <div className="bg-nexus-surface border border-nexus-border rounded-2xl p-5 shadow-sm">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-nexus-bg flex items-center justify-center text-white font-bold border border-nexus-border">
              {stop.stopNumber}
            </div>
            <div>
              <h3 className="text-white font-bold text-nexus-warningase">{stop.customerName}</h3>
              <p className="text-nexus-textSecondary text-xs text-wrap break-all">{stop.address}</p>
            </div>
          </div>
          <div className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
            stop.status === 'completed' ? 'bg-nexus-success/20 text-nexus-success' :
            stop.status === 'arrived' ? 'bg-nexus-warning/20 text-nexus-warning' :
            'bg-slate-700 text-nexus-textSecondary'
          }`}>
            {stop.status.charAt(0).toUpperCase() + stop.status.slice(1)}
          </div>
        </div>

        <div className="flex items-center gap-4 mb-5 text-sm">
          <div className="flex items-center gap-1.5 text-nexus-textSecondary">
            <MapPin size={16} className="text-nexus-textSecondary" />
            <span>{stop.distance}</span>
          </div>
          <div className="flex items-center gap-1.5 text-nexus-textSecondary">
            <Clock size={16} className="text-nexus-textSecondary" />
            <span>ETA: {stop.eta}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => onNavigate(stop)}
            className="flex items-center justify-center gap-2 bg-nexus-bg hover:bg-slate-800 border border-nexus-border/50 rounded-xl py-2.5 transition-colors text-nexus-textSecondary text-sm font-medium"
          >
            <Navigation size={16} className="text-nexus-primary" />
            Maps
          </button>
          
          {stop.status === 'pending' && (
            <button 
              onClick={() => onMarkArrived(stop)}
              className="flex items-center justify-center gap-2 bg-gradient-to-br from-nexus-primary to-nexus-warning hover:opacity-90 rounded-xl py-2.5 transition-opacity text-white text-sm font-bold shadow-lg shadow-nexus-primary/20"
            >
              <MapPin size={16} />
              Arrived
            </button>
          )}

          {stop.status === 'arrived' && (
            <button 
              onClick={() => onComplete(stop)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-nexus-success to-[#047857] hover:opacity-90 rounded-xl py-2.5 transition-opacity text-white text-sm font-bold shadow-lg shadow-[#10b981]/20"
            >
              <CheckCircle2 size={16} />
              Complete Stop
            </button>
          )}

          {stop.status === 'completed' && (
             <button disabled className="flex items-center justify-center gap-2 bg-slate-800/50 rounded-xl py-2.5 text-nexus-textSecondary text-sm font-medium cursor-not-allowed border border-nexus-border/50">
               Done
             </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RouteStopCard;
