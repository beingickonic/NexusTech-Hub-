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
    { label: 'Available',   value: stats.available  || 0, color: 'text-nexus-success', bg: 'bg-nexus-success/10 dark:bg-nexus-success/10', icon: Wifi },
    { label: 'On Delivery', value: stats.busy        || 0, color: 'text-nexus-info',    bg: 'bg-nexus-info/10 dark:bg-nexus-info/10',   icon: Truck },
    { label: 'Offline',     value: stats.offline     || 0, color: 'text-nexus-textSecondary',   bg: 'bg-nexus-surface',    icon: WifiOff },
    { label: 'Suspended',   value: stats.suspended   || 0, color: 'text-nexus-error',     bg: 'bg-nexus-error/5 dark:bg-nexus-error/10',     icon: AlertTriangle },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-nexus-card rounded-2xl border border-nexus-border p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-nexus-heading text-sm">Driver Status</h3>
          <p className="text-xs text-nexus-textSecondary mt-0.5">{stats.total || 0} drivers total</p>
        </div>
        <Link to="/admin/drivers"
          className="text-xs text-nexus-primary hover:text-nexus-primary font-semibold transition-colors">
          Manage →
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-nexus-surface rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {items.map(item => (
            <div key={item.label} className={`${item.bg} rounded-xl p-3 flex items-center gap-2`}>
              <item.icon size={16} className={item.color} />
              <div>
                <p className="text-lg font-extrabold text-nexus-heading leading-none">{item.value}</p>
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
