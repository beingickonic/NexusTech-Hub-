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
    { label: 'Pending Dispatches', value: stats.pending || 0, color: 'text-nexus-gold', bg: 'bg-nexus-gold/10 dark:bg-nexus-gold/10', icon: Clock },
    { label: 'In Transit', value: stats.in_transit || 0, color: 'text-nexus-primary', bg: 'bg-nexus-primary/10 dark:bg-nexus-primary/10', icon: Truck },
    { label: 'Delivered Today', value: stats.today_delivered || 0, color: 'text-nexus-success', bg: 'bg-nexus-success/10 dark:bg-nexus-success/10', icon: CheckCircle },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-nexus-heading">Dispatch Command Center</h1>
          <p className="text-nexus-textSecondary text-sm mt-1">Real-time overview of all delivery operations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-nexus-card p-5 rounded-2xl border border-nexus-border shadow-sm flex items-center gap-4"
          >
            <div className={`p-4 rounded-xl ${kpi.bg}`}>
              <kpi.icon size={24} className={kpi.color} />
            </div>
            <div>
              <p className="text-sm font-medium text-nexus-muted">{kpi.label}</p>
              <h3 className="text-2xl font-bold text-nexus-heading mt-1">
                {loading ? '-' : kpi.value}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Map Widget placeholder */}
        <div className="bg-nexus-card p-6 rounded-2xl border border-nexus-border shadow-sm">
           <div className="flex items-center gap-2 mb-4 text-nexus-heading font-bold">
              <MapPin className="text-nexus-gold" /> Live Operations Map
           </div>
           <div className="aspect-video bg-nexus-surface rounded-xl flex flex-col items-center justify-center text-nexus-textSecondary">
             <MapPin size={48} className="opacity-20 mb-2" />
             <p className="text-sm font-medium">Map View (API required)</p>
           </div>
        </div>

        {/* Shortcuts */}
        <div className="bg-nexus-card p-6 rounded-2xl border border-nexus-border shadow-sm">
           <h3 className="font-bold text-nexus-heading mb-4">Quick Links</h3>
           <div className="grid grid-cols-2 gap-3">
             <Link to="/dispatch/pending" className="p-4 bg-nexus-surface dark:bg-nexus-hover rounded-xl text-center hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors">
               <Clock className="mx-auto text-nexus-gold mb-2" />
               <p className="text-sm font-medium text-nexus-heading">Pending Dispatches</p>
             </Link>
             <Link to="/dispatch/drivers" className="p-4 bg-nexus-surface dark:bg-nexus-hover rounded-xl text-center hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors">
               <Search className="mx-auto text-nexus-info mb-2" />
               <p className="text-sm font-medium text-nexus-heading">Driver Roster</p>
             </Link>
             <Link to="/dispatch/completed" className="p-4 bg-nexus-surface dark:bg-nexus-hover rounded-xl text-center hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors col-span-2">
               <CheckCircle className="mx-auto text-nexus-success mb-2" />
               <p className="text-sm font-medium text-nexus-heading">Completed Deliveries</p>
             </Link>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DispatchDashboard;
