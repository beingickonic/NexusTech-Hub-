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
        // 1. Get driver profile (drivers row + profiles for name/photo)
        const [{ data: driverData }, { data: profileData }] = await Promise.all([
          supabase.from('drivers').select('*').eq('user_id', user.id).maybeSingle(),
          supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).maybeSingle()
        ]);
        
        if (driverData) {
          setDriver({ ...driverData, full_name: profileData?.full_name || 'Driver', photo_url: profileData?.avatar_url || null });
          
          // 2. Get today's deliveries (orders carry driver_id = profile id)
          const today = new Date().toISOString().split('T')[0];
          const { data: dispatches } = await supabase
            .from('orders')
            .select('*')
            .eq('driver_id', user.id)
            .gte('created_at', today)
            .order('created_at', { ascending: false });

          if (dispatches) {
             const pending = dispatches.filter(d => ['Assigned', 'Reserved', 'Picking', 'Pending', 'Waiting for Stock', 'Out for Delivery'].includes(d.status));
             const completed = dispatches.filter(d => ['Delivered', 'Completed'].includes(d.status));
             setStats({ pending: pending.length, completed: completed.length });
             
             // Active delivery
             const active = pending.find(d => d.status === 'Out for Delivery' || d.status === 'Picking');
             if (active) setActiveDelivery({ ...active, delivery_address: `${active.shipping_address || ''}${active.shipping_city ? ', ' + active.shipping_city : ''}` });
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

  if (loading) return <div className="p-8 text-center text-nexus-textSecondary">Loading...</div>;

  if (!driver) return (
    <div className="p-12 text-center bg-nexus-card rounded-2xl border border-nexus-error/20 dark:border-nexus-error/50 text-nexus-error">
      <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
      <h2 className="text-xl font-bold mb-2">Driver Profile Not Found</h2>
      <p className="text-sm">Please ask your dispatcher to link your account to a driver profile.</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-nexus-success text-white p-6 rounded-2xl shadow-lg shadow-success/20">
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
            <p className="text-nexus-success text-sm flex items-center gap-1.5 mt-1">
              <span className={`w-2 h-2 rounded-full ${driver.status === 'Available' ? 'bg-nexus-success' : 'bg-nexus-gold'}`}></span>
              {driver.status === 'Available' ? 'Available for orders' : 'Currently busy'}
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-center bg-black/10 rounded-xl px-4 py-2">
             <p className="text-3xl font-black">{stats.pending}</p>
             <p className="text-[10px] uppercase tracking-wider font-bold text-nexus-success mt-0.5">Left Today</p>
          </div>
          <div className="text-center bg-black/10 rounded-xl px-4 py-2">
             <p className="text-3xl font-black">{stats.completed}</p>
             <p className="text-[10px] uppercase tracking-wider font-bold text-nexus-success mt-0.5">Completed</p>
          </div>
        </div>
      </div>

      {/* Active Delivery */}
      {activeDelivery ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-nexus-card p-6 rounded-2xl border-2 border-nexus-success shadow-xl shadow-success/10"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-nexus-heading flex items-center gap-2">
              <Navigation className="text-nexus-success" /> Current Delivery
            </h2>
            <span className="px-3 py-1 bg-nexus-success/10 dark:bg-nexus-success/20 text-nexus-success dark:text-nexus-success font-bold text-xs rounded-full">
              IN TRANSIT
            </span>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3 p-4 bg-nexus-surface dark:bg-nexus-hover rounded-xl">
              <MapPin className="text-nexus-textSecondary mt-0.5" />
              <div>
                <p className="text-xs text-nexus-textSecondary uppercase font-bold tracking-wider mb-1">Destination</p>
                <p className="font-semibold text-nexus-heading">{activeDelivery.delivery_address}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <button className="flex items-center justify-center gap-2 bg-nexus-heading dark:bg-white text-white dark:text-nexus-navy py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
               <Navigation size={18} /> Navigate
             </button>
             <button className="flex items-center justify-center gap-2 bg-nexus-success text-white py-3 rounded-xl font-bold text-sm hover:bg-nexus-success transition-colors shadow-lg shadow-nexus-success/30">
               <CheckCircle size={18} /> Mark Delivered
             </button>
          </div>
        </motion.div>
      ) : (
        <div className="bg-nexus-card p-8 rounded-2xl border border-nexus-border text-center">
          <div className="w-16 h-16 bg-nexus-surface rounded-full flex items-center justify-center mx-auto mb-4">
             <Package className="text-nexus-textSecondary" size={32} />
          </div>
          <h3 className="text-lg font-bold text-nexus-heading mb-2">No active deliveries</h3>
          <p className="text-nexus-textSecondary text-sm mb-6 max-w-sm mx-auto">You don't have any deliveries in transit right now. Check your pending deliveries list.</p>
          <Link to="/driver/deliveries" className="inline-flex items-center justify-center bg-nexus-success hover:bg-nexus-success text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-nexus-success/30">
            View All Deliveries
          </Link>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;
