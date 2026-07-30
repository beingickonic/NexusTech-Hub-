import React from 'react';
import { MapPin, Phone, Play, Package } from 'lucide-react';

const DeliveryCard = ({ delivery, onNavigate, onCall, onStart }) => {
  return (
    <div className="bg-nexus-surface border border-nexus-border rounded-2xl p-5 shadow-lg relative overflow-hidden">
      {/* Accent edge */}
      <div className={`absolute top-0 left-0 w-1.5 h-full ${
        delivery.status === 'delivered' ? 'bg-nexus-success' : 
        delivery.status === 'in_transit' ? 'bg-nexus-warning' : 
        'bg-nexus-primary'
      }`} />
      
      <div className="flex justify-between items-start mb-4 pl-2">
        <div>
          <h3 className="text-white font-bold text-lg">{delivery.customerName}</h3>
          <p className="text-nexus-textSecondary text-sm">Order #{delivery.orderNumber}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          delivery.paymentType === 'COD' ? 'bg-nexus-warning/20 text-nexus-warning' : 'bg-nexus-success/20 text-nexus-success'
        }`}>
          {delivery.paymentType === 'COD' ? 'COD' : 'Paid'}
        </div>
      </div>

      <div className="space-y-3 mb-5 pl-2">
        <div className="flex items-start gap-3 text-nexus-textSecondary">
          <MapPin size={18} className="text-nexus-primary shrink-0 mt-0.5" />
          <span className="text-sm">{delivery.address}</span>
        </div>
        <div className="flex items-center gap-3 text-nexus-textSecondary">
          <Phone size={18} className="text-nexus-textSecondary shrink-0" />
          <span className="text-sm">{delivery.phone}</span>
        </div>
        <div className="flex items-center gap-3 text-nexus-textSecondary">
          <Package size={18} className="text-nexus-textSecondary shrink-0" />
          <span className="text-sm">{delivery.packageCount} Package{delivery.packageCount > 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <button 
          onClick={() => onNavigate(delivery)}
          className="flex flex-col items-center justify-center gap-1.5 bg-nexus-bg hover:bg-slate-800 border border-nexus-border/50 rounded-xl py-2.5 transition-colors text-nexus-textSecondary"
        >
          <MapPin size={20} />
          <span className="text-xs font-medium">Navigate</span>
        </button>
        <button 
          onClick={() => onCall(delivery)}
          className="flex flex-col items-center justify-center gap-1.5 bg-nexus-bg hover:bg-slate-800 border border-nexus-border/50 rounded-xl py-2.5 transition-colors text-nexus-textSecondary"
        >
          <Phone size={20} />
          <span className="text-xs font-medium">Call</span>
        </button>
        <button 
          onClick={() => onStart(delivery)}
          className="flex flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-nexus-primary to-nexus-warning hover:opacity-90 rounded-xl py-2.5 transition-opacity text-white shadow-lg shadow-nexus-primary/20"
        >
          <Play size={20} className="fill-current" />
          <span className="text-xs font-bold">Start</span>
        </button>
      </div>
    </div>
  );
};

export default DeliveryCard;
