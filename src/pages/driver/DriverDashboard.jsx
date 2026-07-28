import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Package, CheckCircle, Navigation, Camera, AlertCircle } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../auth/AuthContext';
import { Link } from 'react-router-dom';

const DriverDashboard = () => {
  const [driver, setDriver] = useState(null);
  const [activeDelivery, setActiveDelivery] = useState(null);
  const [stats, setStats] = useState({ pending: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDriverData = async () => {
      if (!user) return;
      try {
        // 1. Get driver profile
        const { data: driverData } = await supabase
          .from('drivers')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (driverData) {
          setDriver(driverData);
          
          // 2. Get today's deliveries
          const today = new Date().toISOString().split('T')[0];
          const { data: dispatches } = await supabase
            .from('dispatches')
            .select('*')
            .eq('driver_id', driverData.id)
            .gte('created_at', today)
            .order('created_at', { ascending: false });

          if (dispatches) {
             const pending = dispatches.filter(d => ['assigned', 'picked_up', 'in_transit'].includes(d.status));
             const completed = dispatches.filter(d => d.status === 'delivered');
             setStats({ pending: pending.length, completed: completed.length });
             
             // Active delivery
             const active = pending.find(d => d.status === 'in_transit' || d.status === 'picked_up');
             if (active) setActiveDelivery(active);
          }
        }
      } catch (err) {
        console.error("Error fetching driver data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDriverData();
  }, [user]);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;

  if (!driver) return (
    <div className="p-12 text-center bg-white dark:bg-dark-surface rounded-2xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400">
      <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
      <h2 className="text-xl font-bold mb-2">Driver Profile Not Found</h2>
      <p className="text-sm">Please ask your dispatcher to link your account to a driver profile.</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-500 text-white p-6 rounded-2xl shadow-lg shadow-emerald-500/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            {driver.photo_url ? (
              <img src={driver.photo_url} alt={driver.full_name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <MapPin size={32} />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{driver.full_name}</h1>
            <p className="text-emerald-100 text-sm flex items-center gap-1.5 mt-1">
              <span className={`w-2 h-2 rounded-full ${driver.status === 'available' ? 'bg-emerald-300' : 'bg-amber-300'}`}></span>
              {driver.status === 'available' ? 'Available for orders' : 'Currently busy'}
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-center bg-black/10 rounded-xl px-4 py-2">
             <p className="text-3xl font-black">{stats.pending}</p>
             <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-100 mt-0.5">Left Today</p>
          </div>
          <div className="text-center bg-black/10 rounded-xl px-4 py-2">
             <p className="text-3xl font-black">{stats.completed}</p>
             <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-100 mt-0.5">Completed</p>
          </div>
        </div>
      </div>

      {/* Active Delivery */}
      {activeDelivery ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-dark-surface p-6 rounded-2xl border-2 border-emerald-500 shadow-xl shadow-emerald-500/10"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Navigation className="text-emerald-500" /> Current Delivery
            </h2>
            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs rounded-full">
              IN TRANSIT
            </span>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-xl">
              <MapPin className="text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Destination</p>
                <p className="font-semibold text-slate-900 dark:text-white">{activeDelivery.delivery_address}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <button className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
               <Navigation size={18} /> Navigate
             </button>
             <button className="flex items-center justify-center gap-2 bg-emerald-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/30">
               <CheckCircle size={18} /> Mark Delivered
             </button>
          </div>
        </motion.div>
      ) : (
        <div className="bg-white dark:bg-dark-surface p-8 rounded-2xl border border-slate-200 dark:border-white/10 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
             <Package className="text-slate-400" size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No active deliveries</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">You don't have any deliveries in transit right now. Check your pending deliveries list.</p>
          <Link to="/driver/deliveries" className="inline-flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-emerald-500/30">
            View All Deliveries
          </Link>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;
