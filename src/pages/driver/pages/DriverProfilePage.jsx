import React from 'react';
import { User, Phone, MapPin, Truck } from 'lucide-react';
import { useAuth } from '../../../auth/AuthContext';

const DriverProfilePage = () => {
  const { user } = useAuth();
  
  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto pb-24">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-info/100/20 flex items-center justify-center">
          <User className="text-info" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <p className="text-sm text-nexus-textSecondary">Your driver information.</p>
        </div>
      </div>

      <div className="bg-nexus-surface border border-nexus-border rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-nexus-primary to-nexus-warning p-1 mb-4">
            <div className="w-full h-full bg-nexus-bg rounded-full flex items-center justify-center overflow-hidden">
              <User size={40} className="text-nexus-textSecondary" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white">{user?.full_name || 'Derrick Driver'}</h2>
          <p className="text-nexus-warning font-medium text-sm">Emp #DRV-8409</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 bg-nexus-bg p-4 rounded-xl border border-nexus-border">
            <div className="w-10 h-10 rounded-full bg-nexus-card flex items-center justify-center shrink-0">
              <Phone size={18} className="text-nexus-textSecondary" />
            </div>
            <div>
              <p className="text-xs text-nexus-textSecondary mb-0.5">Phone Number</p>
              <p className="text-sm font-medium text-white">{user?.phone || '+1 (555) 000-0000'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-nexus-bg p-4 rounded-xl border border-nexus-border">
            <div className="w-10 h-10 rounded-full bg-nexus-card flex items-center justify-center shrink-0">
              <Truck size={18} className="text-nexus-textSecondary" />
            </div>
            <div>
              <p className="text-xs text-nexus-textSecondary mb-0.5">Assigned Vehicle</p>
              <p className="text-sm font-medium text-white">Ford Transit Van (ABC-1234)</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-nexus-bg p-4 rounded-xl border border-nexus-border">
            <div className="w-10 h-10 rounded-full bg-nexus-card flex items-center justify-center shrink-0">
              <MapPin size={18} className="text-nexus-textSecondary" />
            </div>
            <div>
              <p className="text-xs text-nexus-textSecondary mb-0.5">Assigned Dispatch Office</p>
              <p className="text-sm font-medium text-white">Main Warehouse - North</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-nexus-bg p-4 rounded-xl border border-nexus-border">
            <div className="w-10 h-10 rounded-full bg-nexus-error/10 flex items-center justify-center shrink-0">
              <Phone size={18} className="text-nexus-error" />
            </div>
            <div>
              <p className="text-xs text-nexus-error/80 mb-0.5">Emergency Contact</p>
              <p className="text-sm font-medium text-nexus-error">Dispatch HQ: +1 (800) 999-9999</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverProfilePage;
