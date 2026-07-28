import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Plus, Package, Users } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { inventoryService } from '../../services/inventoryService';

const WarehouseLocationsPage = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWarehouses = async () => {
      setLoading(true);
      try {
        const { success, data } = await inventoryService.getWarehouses();
        if (success) {
          const mapped = data.map((wh) => ({
            id: wh.id,
            name: wh.name,
            location: wh.location || 'Unknown Location',
            capacity: wh.capacity || 50000,
            current: wh.current_utilization || 0, // Fallback if missing
            manager: wh.manager_name || 'System Admin',
            status: wh.status?.toLowerCase() || 'active'
          }));
          
          if (mapped.length === 0) {
             // Let's at least show the one we create by default or an empty state
          }
          setLocations(mapped);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchWarehouses();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Warehouse Locations</h1>
          <p className="text-slate-500 text-sm mt-1">Manage multiple warehouses and capacity</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-violet-600/20">
          <Plus size={18} /> Add Warehouse
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm animate-pulse">
              <div className="h-6 w-32 bg-slate-100 dark:bg-white/5 rounded mb-4"></div>
              <div className="h-4 w-48 bg-slate-100 dark:bg-white/5 rounded mb-6"></div>
              <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full mb-2"></div>
              <div className="h-4 w-24 bg-slate-100 dark:bg-white/5 rounded"></div>
            </div>
          ))
        ) : locations.length > 0 ? (
          locations.map((loc) => (
            <motion.div 
              key={loc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col group hover:border-violet-300 dark:hover:border-violet-500/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{loc.name}</h3>
                  <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-1">
                    <MapPin size={14} /> {loc.location}
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize ${
                  loc.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {loc.status}
                </span>
              </div>
              
              <div className="mt-4 flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500 font-medium">Capacity Utilization</span>
                  <span className="text-slate-900 dark:text-white font-bold">{Math.round((loc.current / loc.capacity) * 100)}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      (loc.current / loc.capacity) > 0.85 ? 'bg-red-500' : 
                      (loc.current / loc.capacity) > 0.6 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} 
                    style={{ width: `${(loc.current / loc.capacity) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                  <span>{loc.current.toLocaleString()} used</span>
                  <span>{loc.capacity.toLocaleString()} total</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Users size={16} /> {loc.manager}
                </div>
                <button className="text-sm font-semibold text-violet-600 hover:text-violet-700">Manage</button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 p-12 text-center bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col items-center justify-center">
            <Package size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Warehouses Found</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">You haven't added any warehouse locations yet. Click "Add Warehouse" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WarehouseLocationsPage;
