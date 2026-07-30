import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Wifi, WifiOff, Truck, AlertTriangle } from 'lucide-react';
import { driverService } from '../../../services/driverService';
import { Link } from 'react-router-dom';

const DriverStatusWidget = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    driverService.getDriverStats().then(res => {
      if (res.success) setStats(res.stats);
      setLoading(false);
    });
  }, []);

  const items = [
    { label: 'Available',   value: stats.available  || 0, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: Wifi },
    { label: 'On Delivery', value: stats.busy        || 0, color: 'text-blue-500',    bg: 'bg-blue-50 dark:bg-blue-500/10',   icon: Truck },
    { label: 'Offline',     value: stats.offline     || 0, color: 'text-nexus-textSecondary',   bg: 'bg-slate-50 dark:bg-slate-800',    icon: WifiOff },
    { label: 'Suspended',   value: stats.suspended   || 0, color: 'text-red-500',     bg: 'bg-red-50 dark:bg-red-500/10',     icon: AlertTriangle },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-nexus-border p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Driver Status</h3>
          <p className="text-xs text-nexus-textSecondary mt-0.5">{stats.total || 0} drivers total</p>
        </div>
        <Link to="/admin/drivers"
          className="text-xs text-orange-500 hover:text-orange-600 font-semibold transition-colors">
          Manage →
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {items.map(item => (
            <div key={item.label} className={`${item.bg} rounded-xl p-3 flex items-center gap-2`}>
              <item.icon size={16} className={item.color} />
              <div>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white leading-none">{item.value}</p>
                <p className="text-xs text-nexus-textSecondary mt-0.5">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default DriverStatusWidget;
