import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, BellOff, AlertTriangle, AlertCircle, Info,
  CheckCircle2, RefreshCw, Filter, X, Package
} from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { inventoryService } from '../../services/inventoryService';

const SEVERITY_CONFIG = {
  critical: { label: 'Critical', color: 'bg-nexus-error/10 text-nexus-error dark:bg-nexus-error/20 dark:text-nexus-error', border: 'border-l-red-500', icon: AlertCircle, dot: 'bg-nexus-error' },
  urgent:   { label: 'Urgent',   color: 'bg-nexus-error/10 text-nexus-error dark:bg-nexus-error/20 dark:text-nexus-error', border: 'border-l-nexus-error', icon: AlertTriangle, dot: 'bg-nexus-error' },
  warning:  { label: 'Warning',  color: 'bg-nexus-gold/10 text-nexus-gold dark:bg-nexus-gold/20 dark:text-nexus-gold', border: 'border-l-amber-500', icon: AlertTriangle, dot: 'bg-nexus-gold' },
  info:     { label: 'Info',     color: 'bg-nexus-info/10 text-nexus-info dark:bg-nexus-info/20 dark:text-nexus-info', border: 'border-l-blue-500', icon: Info, dot: 'bg-nexus-info' },
};

const STATUS_CONFIG = {
  active:        { label: 'Active',        color: 'bg-nexus-gold/10 text-nexus-gold dark:bg-nexus-gold/20 dark:text-nexus-gold' },
  acknowledged:  { label: 'Acknowledged',  color: 'bg-nexus-info/10 text-nexus-info dark:bg-nexus-info/20 dark:text-nexus-info' },
  resolved:      { label: 'Resolved',      color: 'bg-nexus-success/10 text-nexus-success dark:bg-nexus-success/20 dark:text-nexus-success' },
};

const AlertCard = ({ alert, onAcknowledge, onResolve }) => {
  const sev = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.warning;
  const sts = STATUS_CONFIG[alert.status]     || STATUS_CONFIG.active;
  const Icon = sev.icon;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -10 }}
      className={`bg-nexus-card rounded-xl border border-nexus-border border-l-4 ${sev.border} shadow-sm overflow-hidden ${alert.is_read ? 'opacity-70' : ''}`}>
      <div className="p-4 flex gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${sev.color}`}>
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-nexus-heading text-sm">{alert.title}</p>
                {!alert.is_read && <span className={`w-2 h-2 rounded-full ${sev.dot} flex-shrink-0`} />}
              </div>
              <p className="text-sm text-nexus-textSecondary mt-0.5">{alert.message}</p>
              {alert.suggested_action && (
                <p className="text-xs text-nexus-textSecondary mt-1.5 flex items-center gap-1"><CheckCircle2 size={11} /> {alert.suggested_action}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${sts.color}`}>{sts.label}</span>
              <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${sev.color}`}>{sev.label}</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-nexus-textSecondary">{new Date(alert.created_at).toLocaleString()}</p>
            <div className="flex gap-2">
              {alert.status === 'active' && (
                <button onClick={() => onAcknowledge(alert.id)} className="px-2.5 py-1 text-xs bg-nexus-info/10 dark:bg-nexus-info/20 text-nexus-info rounded-lg hover:bg-nexus-info/20 dark:hover:bg-nexus-info/30 font-medium transition-colors">
                  Acknowledge
                </button>
              )}
              {['active','acknowledged'].includes(alert.status) && (
                <button onClick={() => onResolve(alert.id)} className="px-2.5 py-1 text-xs bg-nexus-success/10 dark:bg-nexus-success/20 text-nexus-success dark:text-nexus-success rounded-lg hover:bg-nexus-success/20 dark:hover:bg-nexus-success/30 font-medium transition-colors">
                  Resolve
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const InventoryNotificationsPage = () => {
  const [alerts, setAlerts]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filterStatus, setFilterStatus] = useState('active');
  const [filterSeverity, setFilterSeverity] = useState('');

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await inventoryService.getStockAlerts({ status: filterStatus === 'all' ? 'all' : filterStatus, limit: 200 });
      if (result.success) setAlerts(result.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filterStatus]);

  useEffect(() => {
    fetchAlerts();
    const sub = supabase.channel('alerts_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stock_alerts' }, fetchAlerts)
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, [fetchAlerts]);

  const handleAcknowledge = async (id) => {
    try { await inventoryService.acknowledgeAlert(id); await fetchAlerts(); }
    catch (e) { console.error(e); }
  };

  const handleResolve = async (id) => {
    try { await inventoryService.resolveAlert(id); await fetchAlerts(); }
    catch (e) { console.error(e); }
  };

  const handleMarkAllRead = async () => {
    try { await inventoryService.markAlertsRead(); await fetchAlerts(); }
    catch (e) { console.error(e); }
  };

  const filtered = alerts.filter(a => {
    if (filterSeverity && a.severity !== filterSeverity) return false;
    return true;
  });

  const stats = {
    total:    alerts.length,
    active:   alerts.filter(a => a.status === 'active').length,
    unread:   alerts.filter(a => !a.is_read).length,
    critical: alerts.filter(a => a.severity === 'critical' && a.status === 'active').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-nexus-heading">Stock Alerts</h1>
          <p className="text-nexus-textSecondary text-sm mt-1">Monitor inventory health issues in real-time</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchAlerts} className="p-2.5 rounded-xl bg-nexus-surface dark:bg-nexus-hover hover:bg-nexus-surface dark:hover:bg-nexus-hover border border-nexus-border">
            <RefreshCw size={16} className="text-nexus-muted" />
          </button>
          {stats.unread > 0 && (
            <button onClick={handleMarkAllRead} className="inline-flex items-center gap-2 bg-nexus-surface dark:bg-nexus-hover hover:bg-nexus-surface dark:hover:bg-nexus-hover border border-nexus-border text-nexus-muted px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
              <BellOff size={16} /> Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Alerts', value: stats.total,    color: 'text-nexus-muted', bg: 'bg-nexus-surface dark:bg-nexus-hover' },
          { label: 'Active',       value: stats.active,   color: 'text-nexus-gold', bg: 'bg-nexus-gold/10 dark:bg-nexus-gold/10' },
          { label: 'Critical',     value: stats.critical, color: 'text-nexus-error',   bg: 'bg-nexus-error/5 dark:bg-nexus-error/10' },
          { label: 'Unread',       value: stats.unread,   color: 'text-primary',   bg: 'bg-nexus-primary/10 dark:bg-primary/10' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-nexus-border`}>
            <p className="text-xs font-semibold text-nexus-textSecondary uppercase tracking-wider">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {['active', 'acknowledged', 'resolved', 'all'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors border ${filterStatus === s ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25' : 'bg-nexus-card border-nexus-border text-nexus-muted hover:bg-nexus-surface dark:hover:bg-nexus-hover'}`}>
            {s}
          </button>
        ))}
        <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}
          className="ml-auto bg-nexus-card border border-nexus-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-nexus-heading">
          <option value="">All Severities</option>
          {Object.entries(SEVERITY_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
        </select>
      </div>

      {/* Alert List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-nexus-card rounded-xl border border-nexus-border animate-pulse" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <AnimatePresence>
          <div className="space-y-3">
            {filtered.map(alert => (
              <AlertCard key={alert.id} alert={alert} onAcknowledge={handleAcknowledge} onResolve={handleResolve} />
            ))}
          </div>
        </AnimatePresence>
      ) : (
        <div className="text-center py-24">
          <Bell size={64} className="mx-auto text-nexus-textSecondary dark:text-nexus-muted mb-4" />
          <h3 className="text-lg font-semibold text-nexus-muted">No alerts found</h3>
          <p className="text-nexus-textSecondary text-sm mt-1">
            {filterStatus === 'active' ? 'All inventory is in good health!' : 'No alerts match the current filters.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default InventoryNotificationsPage;
