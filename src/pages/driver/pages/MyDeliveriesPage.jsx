import React, { useState, useEffect } from 'react';
import { Package, Clock, MapPin, CheckCircle, Navigation } from 'lucide-react';
import { supabase } from '../../../services/supabaseClient';
import { useAuth } from '../../../auth/AuthContext';
import toast from 'react-hot-toast';

const MyDeliveriesPage = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDeliveries = async () => {
      if (!user) return;
      try {
        const { data: driver } = await supabase.from('drivers').select('id').eq('user_id', user.id).single();
        if (!driver) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('dispatches')
          .select('*')
          .eq('driver_id', driver.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setDeliveries(data || []);
      } catch (err) {
        toast.error('Failed to load deliveries');
      } finally {
        setLoading(false);
      }
    };
    fetchDeliveries();
  }, [user]);

  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase.from('dispatches').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      toast.success(`Delivery marked as ${newStatus.replace('_', ' ')}`);
      setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div className="p-8 text-center text-nexus-textSecondary">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Deliveries</h1>
        <p className="text-sm text-nexus-textSecondary mt-1">Manage your assigned deliveries</p>
      </div>

      <div className="space-y-4">
        {deliveries.length === 0 ? (
          <div className="bg-white dark:bg-dark-surface p-12 rounded-2xl border border-slate-200 dark:border-nexus-border text-center">
            <Package size={48} className="mx-auto text-nexus-textSecondary mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No deliveries yet</h3>
            <p className="text-nexus-textSecondary">You don't have any deliveries assigned to you.</p>
          </div>
        ) : (
          deliveries.map(d => (
            <div key={d.id} className="bg-white dark:bg-dark-surface p-5 rounded-2xl border border-slate-200 dark:border-nexus-border shadow-sm flex flex-col md:flex-row gap-4 justify-between md:items-center">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 uppercase tracking-wider">
                    {d.status.replace('_', ' ')}
                  </span>
                  <span className="text-sm font-medium text-nexus-textSecondary">#{d.dispatch_number}</span>
                </div>
                <div className="flex items-start gap-2 mb-1">
                  <MapPin size={16} className="text-nexus-textSecondary mt-1" />
                  <p className="font-semibold text-slate-900 dark:text-white">{d.delivery_address}</p>
                </div>
                {d.notes && <p className="text-sm text-nexus-textSecondary ml-6">Note: {d.notes}</p>}
              </div>

              <div className="flex items-center gap-2">
                {d.status === 'assigned' && (
                  <button onClick={() => updateStatus(d.id, 'picked_up')} className="px-4 py-2 bg-nexus-surface dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-xl hover:opacity-90 transition-opacity">
                    Pick Up Package
                  </button>
                )}
                {d.status === 'picked_up' && (
                  <button onClick={() => updateStatus(d.id, 'in_transit')} className="px-4 py-2 bg-emerald-500 text-white text-sm font-bold rounded-xl hover:bg-emerald-600 transition-colors flex items-center gap-2">
                    <Navigation size={16} /> Start Trip
                  </button>
                )}
                {d.status === 'in_transit' && (
                  <button onClick={() => updateStatus(d.id, 'delivered')} className="px-4 py-2 bg-emerald-500 text-white text-sm font-bold rounded-xl hover:bg-emerald-600 transition-colors flex items-center gap-2">
                    <CheckCircle size={16} /> Mark Delivered
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyDeliveriesPage;
