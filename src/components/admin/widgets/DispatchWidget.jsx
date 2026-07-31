import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, Clock, CheckCircle, XCircle, User, TrendingUp } from 'lucide-react';
import { dispatchService } from '../../../services/dispatchService';
import { Link } from 'react-router-dom';

const DispatchWidget = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatchService.getDispatchStats().then(res => {
      if (res.success) setStats(res.stats);
      setLoading(false);
    });
  }, []);

  const items = [
    { label: 'Pending',    value: stats.pending    || 0, color: 'text-nexus-gold',   bg: 'bg-nexus-gold/10 dark:bg-nexus-gold/10',   icon: Clock },
    { label: 'In Transit', value: stats.in_transit || 0, color: 'text-nexus-primary',  bg: 'bg-nexus-primary/10 dark:bg-nexus-primary/10', icon: Truck },
    { label: 'Delivered',  value: stats.delivered  || 0, color: 'text-nexus-success', bg: 'bg-nexus-success/10 dark:bg-nexus-success/10', icon: CheckCircle },
    { label: 'Failed',     value: stats.failed     || 0, color: 'text-nexus-error',     bg: 'bg-nexus-error/5 dark:bg-nexus-error/10',       icon: XCircle },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-nexus-card rounded-2xl border border-nexus-border p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-nexus-heading text-sm">Today's Dispatches</h3>
          <p className="text-xs text-nexus-textSecondary mt-0.5">{stats.today_delivered || 0} delivered today</p>
        </div>
        <Link to="/admin/dispatch"
          className="text-xs text-nexus-primary hover:text-nexus-primary font-semibold transition-colors">
          View All →
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

export default DispatchWidget;
