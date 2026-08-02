import React, { useState, useEffect } from 'react';
import { MapPin, Package, CheckCircle, Navigation, AlertCircle } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../auth/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { dispatchService } from '../../services/dispatchService';

const DriverDashboard = () => {
  const [driver, setDriver] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [stats, setStats] = useState({ pending: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const load = async () => {
    if (!user) return;
    try {
      const [{ data: driverData }, { data: profileData }] = await Promise.all([
        supabase.from('drivers').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).maybeSingle()
      ]);

      if (driverData) {
        setDriver({ ...driverData, full_name: profileData?.full_name || 'Driver', photo_url: profileData?.avatar_url || null });
      }

      const result = await dispatchService.getAllDriverDeliveries();
      if (result.success && Array.isArray(result.data)) {
        setDeliveries(result.data);
        const pending = result.data.filter(d => ['assigned', 'accepted', 'picked_up', 'in_transit', 'pending'].includes(d.status)).length;
        const completed = result.data.filter(d => d.status === 'delivered').length;
        setStats({ pending, completed });
      }
    } catch (err) {
      console.error("Error fetching driver data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = dispatchService.subscribeToDispatches(() => load());
    const timer = setInterval(load, 15000);
    return () => { clearInterval(timer); unsub(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading) return <div className="p-8 text-center text-nexus-textSecondary">Loading...</div>;

  if (!driver) return (
    <div className="p-12 text-center bg-nexus-card rounded-2xl border border-nexus-error/20 dark:border-nexus-error/50 text-nexus-error">
      <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
      <h2 className="text-xl font-bold mb-2">Driver Profile Not Found</h2>
      <p className="text-sm">Please ask your dispatcher to link your account to a driver profile.</p>
    </div>
  );

  const isActive = (d) => ['assigned', 'accepted', 'picked_up', 'in_transit', 'pending'].includes(d.status);
  const activeDeliveries = deliveries.filter(d => isActive(d));
  const previousDeliveries = deliveries.filter(d => d.status === 'delivered');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-nexus-success text-white p-6 rounded-2xl shadow-lg shadow-nexus-success/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
            {driver.photo_url ? (
              <img src={driver.photo_url} alt={driver.full_name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <MapPin size={32} />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{driver.full_name}</h1>
            <p className="text-white/90 text-sm flex items-center gap-1.5 mt-1">
              <span className={`w-2 h-2 rounded-full ${driver.status === 'Available' ? 'bg-white' : 'bg-nexus-gold'}`}></span>
              {driver.status === 'Available' ? 'Available for orders' : 'Currently busy'}
            </p>
          </div>
        </div>
<div className="flex gap-4">
           <div className="text-center bg-white/10 rounded-xl px-4 py-2">
             <p className="text-3xl font-black">{stats.pending}</p>
             <p className="text-[10px] uppercase tracking-wider font-bold text-white/80 mt-0.5">Left Today</p>
           </div>
           <div className="text-center bg-white/10 rounded-xl px-4 py-2">
             <p className="text-3xl font-black">{stats.completed}</p>
             <p className="text-[10px] uppercase tracking-wider font-bold text-white/80 mt-0.5">Completed</p>
           </div>
         </div>
      </div>

      {/* Fleet Deliveries */}
      {activeDeliveries.length > 0 ? (
        <div className="bg-nexus-card rounded-2xl border border-nexus-border overflow-hidden shadow-lg shadow-nexus-border/5">
          <div className="flex items-center justify-between px-6 pt-6 pb-3">
            <h2 className="text-xl font-bold text-nexus-heading flex items-center gap-2">
              <Navigation className="text-nexus-success" /> Fleet Deliveries
            </h2>
            <span className="px-3 py-1 bg-nexus-success/10 text-nexus-success font-bold text-xs rounded-full">
              {activeDeliveries.length} active
            </span>
          </div>

          <div className="divide-y divide-nexus-border">
            {activeDeliveries.map((d) => {
              const inTransit = d.status === 'in_transit' || d.status === 'picked_up' || d.status === 'accepted';
              return (
                <div key={d.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: inTransit ? 'rgba(16,185,129,.12)' : 'rgba(245,158,11,.12)' }}>
                      <MapPin className={inTransit ? 'text-nexus-success' : 'text-nexus-gold'} size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-nexus-heading truncate">
                        {d.orders?.shipping_name || d.customer_name || 'Customer'}
                      </p>
                      <p className="text-xs text-nexus-textSecondary truncate">{d.delivery_address}</p>
                      <p className="text-xs text-nexus-success font-medium">{d.driver_name}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold w-fit self-start sm:self-center ${
                    inTransit ? 'bg-nexus-success/10 text-nexus-success' : 'bg-nexus-gold/10 text-nexus-gold'
                  }`}>
                    {inTransit ? d.orders?.status || 'IN TRANSIT' : 'AWAITING START'}
                  </span>
                  <button
                    onClick={() => navigate(`/driver/deliveries/${d.id}`)}
                    className="flex items-center justify-center gap-1.5 bg-nexus-success text-white px-4 py-2 rounded-xl font-bold text-xs hover:opacity-90 transition-opacity"
                  >
                    {inTransit ? <CheckCircle size={14} /> : <Navigation size={14} />}
                    {inTransit ? 'Deliver' : 'Start'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-nexus-card p-8 rounded-2xl border border-nexus-border text-center">
          <div className="w-16 h-16 bg-nexus-surface rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="text-nexus-textSecondary" size={32} />
          </div>
          <h3 className="text-lg font-bold text-nexus-heading mb-2">No active deliveries</h3>
          <p className="text-nexus-textSecondary text-sm mb-6 max-w-sm mx-auto">No deliveries are currently in transit across the fleet.</p>
          <Link to="/driver/deliveries" className="inline-flex items-center justify-center bg-nexus-primary hover:bg-nexus-primary-hover text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-nexus-primary/30">
            View All Deliveries
          </Link>
        </div>
      )}

      {/* Previous Deliveries */}
      {previousDeliveries.length > 0 && (
        <div className="bg-nexus-card rounded-2xl border border-nexus-border overflow-hidden shadow-lg shadow-nexus-border/5">
          <div className="flex items-center justify-between px-6 pt-6 pb-3">
            <h2 className="text-xl font-bold text-nexus-heading flex items-center gap-2">
              <CheckCircle className="text-nexus-textSecondary" /> Previous Deliveries
            </h2>
            <span className="px-3 py-1 bg-nexus-textSecondary/10 text-nexus-textSecondary font-bold text-xs rounded-full">
              {previousDeliveries.length} completed
            </span>
          </div>

          <div className="divide-y divide-nexus-border">
            {previousDeliveries.map((d) => (
              <div key={d.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-nexus-success/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="text-nexus-success" size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-nexus-heading truncate">
                      {d.orders?.shipping_name || d.customer_name || 'Customer'}
                    </p>
                    <p className="text-xs text-nexus-textSecondary truncate">
                      {d.dispatch_number || d.order_id} · {d.driver_name}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-nexus-success/10 text-nexus-success rounded-full text-xs font-bold w-fit self-start sm:self-center">
                  DELIVERED
                </span>
                <button
                  onClick={() => navigate(`/driver/deliveries/${d.id}`)}
                  className="flex items-center justify-center gap-1.5 bg-nexus-heading dark:bg-white text-white dark:text-nexus-navy px-4 py-2 rounded-xl font-bold text-xs hover:opacity-90 transition-opacity"
                >
                  Detail
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;