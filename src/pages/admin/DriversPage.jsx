import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck, Star, Phone, Mail, Car, X, Plus, Search, RefreshCw,
  Wifi, WifiOff, AlertTriangle, Edit3, Trash2, Camera, ChevronRight,
  Package, CheckCircle, XCircle, Clock, BarChart3, Shield, Truck
} from 'lucide-react';
import { driverService } from '../../services/driverService';
import toast from 'react-hot-toast';

// ── Status config ──────────────────────────────────────────────
const STATUS_CONFIG = {
  available: { label: 'Available', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/15', dot: 'bg-emerald-500' },
  busy:      { label: 'On Delivery', color: 'text-blue-600 dark:text-blue-400',     bg: 'bg-blue-100 dark:bg-blue-500/15',     dot: 'bg-blue-500' },
  offline:   { label: 'Offline',    color: 'text-slate-500 dark:text-slate-400',   bg: 'bg-slate-100 dark:bg-slate-800',      dot: 'bg-slate-400' },
  suspended: { label: 'Suspended',  color: 'text-red-600 dark:text-red-400',       bg: 'bg-red-100 dark:bg-red-500/15',       dot: 'bg-red-500' }
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.offline;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color} ${cfg.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} /> {cfg.label}
    </span>
  );
};

// ── Driver Form Modal ──────────────────────────────────────────
const DriverFormModal = ({ driver, onClose, onSaved }) => {
  const isEdit = !!driver?.id;
  const [form, setForm] = useState({
    full_name: driver?.full_name || '',
    phone: driver?.phone || '',
    email: driver?.email || '',
    national_id: driver?.national_id || '',
    vehicle_number: driver?.vehicle_number || '',
    vehicle_type: driver?.vehicle_type || 'Motorcycle',
    license_number: driver?.license_number || '',
    status: driver?.status || 'available',
    notes: driver?.notes || ''
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(driver?.photo_url || null);
  const [loading, setLoading] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = photo ? (() => {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        fd.append('photo', photo);
        return fd;
      })() : form;

      if (isEdit) {
        await driverService.updateDriver(driver.id, payload);
        toast.success('Driver updated!');
      } else {
        await driverService.createDriver(payload);
        toast.success('Driver added!');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save driver');
    } finally {
      setLoading(false);
    }
  };

  const f = (field) => ({
    value: form[field],
    onChange: e => setForm(prev => ({ ...prev, [field]: e.target.value }))
  });

  const inputCls = 'w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm border-0 outline-none focus:ring-2 focus:ring-orange-500/40 text-slate-900 dark:text-white placeholder-slate-400';
  const labelCls = 'block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-bold text-slate-900 dark:text-white">{isEdit ? 'Edit Driver' : 'Add New Driver'}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Photo */}
          <div className="flex justify-center">
            <label className="relative cursor-pointer group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg">
                {photoPreview ? <img src={photoPreview} alt="" className="w-full h-full object-cover" /> : (form.full_name?.[0] || <Camera size={28} />)}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={20} className="text-white" />
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={labelCls}>Full Name *</label>
              <input {...f('full_name')} required placeholder="Full Name" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Phone *</label>
              <input {...f('phone')} required placeholder="+254..." className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" {...f('email')} placeholder="Email" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>National ID</label>
              <input {...f('national_id')} placeholder="ID Number" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>License No.</label>
              <input {...f('license_number')} placeholder="License" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Vehicle Number</label>
              <input {...f('vehicle_number')} placeholder="KBC 123A" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Vehicle Type</label>
              <select {...f('vehicle_type')} className={inputCls + ' cursor-pointer'}>
                {['Motorcycle', 'Bicycle', 'Tuk-tuk', 'Van', 'Pickup', 'Truck', 'Car'].map(v => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select {...f('status')} className={inputCls + ' cursor-pointer'}>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Notes</label>
            <textarea {...f('notes')} placeholder="Notes..." rows={2} className={inputCls + ' resize-none'} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold disabled:opacity-50">
              {loading ? 'Saving...' : isEdit ? 'Update Driver' : 'Add Driver'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ── Driver Profile Drawer ──────────────────────────────────────
const DriverProfileDrawer = ({ driver, onClose, onStatusChange }) => {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!driver) return;
    Promise.all([
      driverService.getDriverDeliveryStats(driver.id),
      driverService.getDriver(driver.id)
    ]).then(([statsRes, driverRes]) => {
      if (statsRes.success) setStats(statsRes.stats);
      setHistory(driverRes.history || []);
      setLoadingStats(false);
    });
  }, [driver]);

  if (!driver) return null;

  const handleStatusChange = async (status) => {
    try {
      await driverService.updateDriverStatus(driver.id, status);
      toast.success(`Status changed to ${STATUS_CONFIG[status].label}`);
      onStatusChange();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }}
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 w-full sm:w-96 h-full overflow-y-auto border-l border-slate-200 dark:border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 z-10 p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 dark:text-white">Driver Profile</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Avatar */}
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden border-4 border-orange-500/20 shadow-xl">
              {driver.photo_url ? <img src={driver.photo_url} alt="" className="w-full h-full object-cover" /> : driver.full_name?.[0]}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{driver.full_name}</h3>
              <StatusBadge status={driver.status} />
            </div>
            <div className="flex items-center gap-1 text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} fill={i < Math.round(driver.rating || 5) ? 'currentColor' : 'none'} />
              ))}
              <span className="text-xs text-slate-500 ml-1">{(driver.rating || 5).toFixed(1)}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {loadingStats ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
              ))
            ) : [
              { label: 'Today', value: stats?.today_deliveries || 0, icon: Package, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
              { label: 'Active', value: stats?.active_trips || 0, icon: Truck, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
              { label: 'Completed', value: stats?.total_completed || 0, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
              { label: 'Failed', value: stats?.failed || 0, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' }
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl p-3 flex items-center gap-2`}>
                <s.icon size={18} className={s.color} />
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Contact</h4>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 space-y-2">
              {[
                { icon: Phone, value: driver.phone },
                { icon: Mail, value: driver.email },
                { icon: Car, value: `${driver.vehicle_type || ''} • ${driver.vehicle_number || ''}` },
                { icon: Shield, value: driver.license_number ? `License: ${driver.license_number}` : null },
              ].filter(r => r.value).map((row, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <row.icon size={14} className="text-slate-400 flex-shrink-0" />
                  {row.value}
                </div>
              ))}
            </div>
          </div>

          {/* Status Change */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Change Status</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <button key={key} onClick={() => handleStatusChange(key)} disabled={driver.status === key}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold border transition-all disabled:opacity-40 ${
                    driver.status === key ? `${cfg.bg} ${cfg.color} border-current` : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}>
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />{cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Deliveries */}
          {history.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Recent Deliveries</h4>
              <div className="space-y-2">
                {history.slice(0, 5).map(h => (
                  <div key={h.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2.5">
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">{h.dispatch_number}</p>
                      <p className="text-xs text-slate-500">{h.customer_name}</p>
                    </div>
                    <StatusBadge status={h.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────
const DriversPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [globalStats, setGlobalStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});
  const [formModal, setFormModal] = useState(null);
  const [profileDrawer, setProfileDrawer] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [driversRes, statsRes] = await Promise.all([
        driverService.getDrivers({ page, search, status: statusFilter }),
        driverService.getDriverStats()
      ]);
      if (driversRes.success) { setDrivers(driversRes.data); setMeta(driversRes.meta); }
      if (statsRes.success) setGlobalStats(statsRes.stats);
    } catch (err) {
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (driver) => {
    if (!confirm(`Delete driver ${driver.full_name}?`)) return;
    try {
      await driverService.deleteDriver(driver.id);
      toast.success('Driver deleted');
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const statCards = [
    { label: 'Total Drivers',  value: globalStats.total || 0,     icon: UserCheck, color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800' },
    { label: 'Available',      value: globalStats.available || 0,  icon: Wifi,      color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/20' },
    { label: 'On Delivery',    value: globalStats.busy || 0,       icon: Truck,     color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-100 dark:bg-blue-500/20' },
    { label: 'Offline',        value: globalStats.offline || 0,    icon: WifiOff,   color: 'text-slate-500',                     bg: 'bg-slate-100 dark:bg-slate-800' },
    { label: 'Today\'s Trips', value: globalStats.today_deliveries || 0, icon: Package, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-500/20' },
    { label: 'Suspended',      value: globalStats.suspended || 0,  icon: AlertTriangle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-500/20' },
  ];

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">Driver Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your delivery fleet and track performance</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-orange-500 transition-colors">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => setFormModal({})}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors shadow-lg shadow-orange-500/25">
            <Plus size={16} /> Add Driver
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.bg} ${s.color}`}><s.icon size={18} /></div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{s.value}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search drivers..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-orange-500/40" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[['all','All'], ['available','Available'], ['busy','On Delivery'], ['offline','Offline'], ['suspended','Suspended']].map(([key, label]) => (
            <button key={key} onClick={() => { setStatusFilter(key); setPage(1); }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === key ? 'bg-orange-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}>{label}</button>
          ))}
        </div>
      </div>

      {/* Driver Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : drivers.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <UserCheck size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No drivers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {drivers.map((driver, i) => {
            const cfg = STATUS_CONFIG[driver.status] || STATUS_CONFIG.offline;
            return (
              <motion.div key={driver.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-lg dark:hover:shadow-slate-900/50 transition-all group">
                {/* Avatar + Status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white text-xl font-bold overflow-hidden shadow-lg">
                      {driver.photo_url ? <img src={driver.photo_url} alt="" className="w-full h-full object-cover" /> : driver.full_name?.[0]}
                    </div>
                    <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${cfg.dot}`} />
                  </div>
                  <StatusBadge status={driver.status} />
                </div>

                {/* Info */}
                <h3 className="font-bold text-slate-900 dark:text-white mb-1 truncate">{driver.full_name}</h3>
                <div className="space-y-1 mb-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Phone size={11} />{driver.phone}
                  </div>
                  {driver.vehicle_number && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Car size={11} />{driver.vehicle_type} · {driver.vehicle_number}
                    </div>
                  )}
                </div>

                {/* Rating + Deliveries */}
                <div className="flex items-center justify-between mb-4 py-3 border-y border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={11} fill={j < Math.round(driver.rating || 5) ? 'currentColor' : 'none'} />
                    ))}
                    <span className="text-xs text-slate-400 ml-0.5">{(driver.rating || 5).toFixed(1)}</span>
                  </div>
                  <span className="text-xs text-slate-500">{driver.total_deliveries || 0} trips</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button onClick={() => setProfileDrawer(driver)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-orange-500/10 hover:text-orange-600 transition-colors">
                    <BarChart3 size={13} /> Profile
                  </button>
                  <button onClick={() => setFormModal(driver)} title="Edit"
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 transition-colors">
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => handleDelete(driver)} title="Delete"
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={meta.page <= 1}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40">Prev</button>
          <span className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">Page {meta.page} / {meta.totalPages}</span>
          <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={meta.page >= meta.totalPages}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40">Next</button>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {formModal !== null && (
          <DriverFormModal driver={formModal?.id ? formModal : null} onClose={() => setFormModal(null)} onSaved={fetchData} />
        )}
        {profileDrawer && (
          <DriverProfileDrawer driver={profileDrawer} onClose={() => setProfileDrawer(null)} onStatusChange={() => { fetchData(); setProfileDrawer(null); }} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DriversPage;
