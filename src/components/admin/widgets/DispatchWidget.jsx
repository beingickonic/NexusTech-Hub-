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
    { label: 'Pending',    value: stats.pending    || 0, color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-500/10',   icon: Clock },
    { label: 'In Transit', value: stats.in_transit || 0, color: 'text-orange-500',  bg: 'bg-orange-50 dark:bg-orange-500/10', icon: Truck },
    { label: 'Delivered',  value: stats.delivered  || 0, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: CheckCircle },
    { label: 'Failed',     value: stats.failed     || 0, color: 'text-red-500',     bg: 'bg-red-50 dark:bg-red-500/10',       icon: XCircle },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Today's Dispatches</h3>
          <p className="text-xs text-slate-500 mt-0.5">{stats.today_delivered || 0} delivered today</p>
        </div>
        <Link to="/admin/dispatch"
          className="text-xs text-orange-500 hover:text-orange-600 font-semibold transition-colors">
          View All →
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
                <p className="text-xs text-slate-500 mt-0.5">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default DispatchWidget;
