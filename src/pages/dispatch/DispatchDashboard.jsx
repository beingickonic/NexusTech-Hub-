import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, Clock, CheckCircle, MapPin, Search } from 'lucide-react';
import { dispatchService } from '../../services/dispatchService';
import { Link } from 'react-router-dom';

const DispatchDashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatchService.getDispatchStats().then(res => {
      if (res.success) setStats(res.stats);
      setLoading(false);
    });
  }, []);

  const kpis = [
    { label: 'Pending Dispatches', value: stats.pending || 0, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', icon: Clock },
    { label: 'In Transit', value: stats.in_transit || 0, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10', icon: Truck },
    { label: 'Delivered Today', value: stats.today_delivered || 0, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: CheckCircle },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dispatch Command Center</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time overview of all delivery operations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-dark-surface p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex items-center gap-4"
          >
            <div className={`p-4 rounded-xl ${kpi.bg}`}>
              <kpi.icon size={24} className={kpi.color} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{kpi.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {loading ? '-' : kpi.value}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Map Widget placeholder */}
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
           <div className="flex items-center gap-2 mb-4 text-slate-900 dark:text-white font-bold">
              <MapPin className="text-amber-500" /> Live Operations Map
           </div>
           <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-400">
             <MapPin size={48} className="opacity-20 mb-2" />
             <p className="text-sm font-medium">Map View (API required)</p>
           </div>
        </div>

        {/* Shortcuts */}
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
           <h3 className="font-bold text-slate-900 dark:text-white mb-4">Quick Links</h3>
           <div className="grid grid-cols-2 gap-3">
             <Link to="/dispatch/pending" className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl text-center hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
               <Clock className="mx-auto text-amber-500 mb-2" />
               <p className="text-sm font-medium text-slate-900 dark:text-white">Pending Dispatches</p>
             </Link>
             <Link to="/dispatch/drivers" className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl text-center hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
               <Search className="mx-auto text-blue-500 mb-2" />
               <p className="text-sm font-medium text-slate-900 dark:text-white">Driver Roster</p>
             </Link>
             <Link to="/dispatch/completed" className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl text-center hover:bg-slate-100 dark:hover:bg-white/10 transition-colors col-span-2">
               <CheckCircle className="mx-auto text-emerald-500 mb-2" />
               <p className="text-sm font-medium text-slate-900 dark:text-white">Completed Deliveries</p>
             </Link>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DispatchDashboard;
