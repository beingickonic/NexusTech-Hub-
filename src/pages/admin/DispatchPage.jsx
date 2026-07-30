import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck, Clock, CheckCircle, XCircle, AlertTriangle, Package,
  Search, Filter, Plus, RefreshCw, User, MapPin, Phone,
  Calendar, ChevronDown, Printer, Eye, Edit3, X, Check,
  ArrowRightLeft, TrendingUp
} from 'lucide-react';
import { dispatchService } from '../../services/dispatchService';
import { driverService } from '../../services/driverService';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

// ── Status config ──────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:    { label: 'Pending',    color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-100 dark:bg-amber-500/15',   icon: Clock },
  assigned:   { label: 'Assigned',   color: 'text-blue-600 dark:text-blue-400',     bg: 'bg-blue-100 dark:bg-blue-500/15',     icon: User },
  picked_up:  { label: 'Picked Up',  color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-100 dark:bg-violet-500/15', icon: Package },
  in_transit: { label: 'In Transit', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-500/15', icon: Truck },
  delivered:  { label: 'Delivered',  color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/15', icon: CheckCircle },
  failed:     { label: 'Failed',     color: 'text-red-600 dark:text-red-400',       bg: 'bg-red-100 dark:bg-red-500/15',       icon: XCircle },
  returned:   { label: 'Returned',   color: 'text-slate-600 dark:text-nexus-textSecondary',   bg: 'bg-slate-100 dark:bg-slate-500/15',   icon: ArrowRightLeft }
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color} ${cfg.bg}`}>
      <Icon size={11} /> {cfg.label}
    </span>
  );
};

// ── Stat Card ──────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color, bg, onClick, active }) => (
  <motion.button
    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`text-left p-4 rounded-2xl border transition-all ${
      active
        ? `${bg} border-current ${color} shadow-md`
        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-nexus-border/50 hover:border-slate-300 dark:hover:border-slate-600'
    }`}
  >
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${bg} ${color}`}>
      <Icon size={18} />
    </div>
    <p className={`text-2xl font-extrabold ${active ? color : 'text-slate-900 dark:text-white'}`}>{value}</p>
    <p className={`text-xs font-medium mt-0.5 ${active ? color : 'text-nexus-textSecondary dark:text-nexus-textSecondary'}`}>{label}</p>
  </motion.button>
);

// ── Assign Driver Modal ────────────────────────────────────────
const AssignDriverModal = ({ dispatch, onClose, onAssigned }) => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    driverService.getAvailableDrivers().then(res => {
      setDrivers(res.data || []);
      setLoading(false);
    });
  }, []);

  const filtered = drivers.filter(d =>
    !search || d.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.vehicle_number?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAssign = async () => {
    if (!selectedDriver) return;
    setAssigning(true);
    try {
      await dispatchService.assignDriver(dispatch.id, selectedDriver.id);
      toast.success(`Driver ${selectedDriver.full_name} assigned!`);
      onAssigned();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to assign driver');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-nexus-surface rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-nexus-border">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-nexus-border">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">Assign Driver</h2>
            <p className="text-xs text-nexus-textSecondary dark:text-nexus-textSecondary mt-0.5">Dispatch #{dispatch.dispatch_number}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-nexus-textSecondary">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-textSecondary" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search drivers..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm border-0 outline-none focus:ring-2 focus:ring-orange-500/40" />
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8 text-nexus-textSecondary text-sm">Loading drivers...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 text-nexus-textSecondary text-sm">No available drivers</div>
            ) : filtered.map(driver => (
              <button key={driver.id} onClick={() => setSelectedDriver(driver)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  selectedDriver?.id === driver.id
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10'
                    : 'border-slate-200 dark:border-nexus-border hover:border-slate-300 dark:hover:border-slate-600'
                }`}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
                  {driver.photo_url ? <img src={driver.photo_url} alt="" className="w-full h-full object-cover" /> : driver.full_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{driver.full_name}</p>
                  <p className="text-xs text-nexus-textSecondary truncate">{driver.vehicle_type} · {driver.vehicle_number}</p>
                </div>
                {selectedDriver?.id === driver.id && <Check size={16} className="text-orange-500 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 border-t border-slate-200 dark:border-nexus-border flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-nexus-border text-sm font-medium text-slate-600 dark:text-nexus-textSecondary hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <button onClick={handleAssign} disabled={!selectedDriver || assigning}
            className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors disabled:opacity-50">
            {assigning ? 'Assigning...' : 'Assign Driver'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ── Update Status Modal ────────────────────────────────────────
const UpdateStatusModal = ({ dispatch, onClose, onUpdated }) => {
  const [status, setStatus] = useState(dispatch.status);
  const [notes, setNotes] = useState('');
  const [failedReason, setFailedReason] = useState('');
  const [loading, setLoading] = useState(false);

  const statuses = ['pending','assigned','picked_up','in_transit','delivered','failed','returned'];

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await dispatchService.updateStatus(dispatch.id, status, {
        notes: notes || null,
        failed_reason: status === 'failed' ? failedReason : null
      });
      toast.success('Dispatch status updated!');
      onUpdated();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-nexus-surface rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-nexus-border">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-nexus-border">
          <h2 className="font-bold text-slate-900 dark:text-white">Update Status</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-nexus-textSecondary"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {statuses.map(s => {
              const cfg = STATUS_CONFIG[s];
              return (
                <button key={s} onClick={() => setStatus(s)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    status === s ? `${cfg.bg} ${cfg.color} border-current` : 'border-slate-200 dark:border-nexus-border text-slate-600 dark:text-nexus-textSecondary hover:border-slate-300'
                  }`}>
                  <cfg.icon size={13} />{cfg.label}
                </button>
              );
            })}
          </div>
          {status === 'failed' && (
            <input value={failedReason} onChange={e => setFailedReason(e.target.value)}
              placeholder="Reason for failure..."
              className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm border-0 outline-none" />
          )}
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Notes (optional)..."
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm border-0 outline-none resize-none" />
        </div>
        <div className="p-5 border-t border-slate-200 dark:border-nexus-border flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-nexus-border text-sm font-medium text-slate-600 dark:text-nexus-textSecondary hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
          <button onClick={handleUpdate} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold disabled:opacity-50">
            {loading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ── Create Dispatch Modal ──────────────────────────────────────
const CreateDispatchModal = ({ onClose, onCreated }) => {
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ order_id: '', customer_name: '', customer_phone: '', delivery_address: '', dispatch_date: new Date().toISOString().split('T')[0], estimated_delivery: '', notes: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    adminService.getOrders({ limit: 50, status: 'processing' }).then(res => setOrders(res.data || []));
  }, []);

  const handleOrderSelect = (orderId) => {
    const order = orders.find(o => String(o.id) === String(orderId));
    if (order) {
      setForm(f => ({
        ...f,
        order_id: orderId,
        customer_name: order.customer || '',
        customer_phone: order.phone || '',
        delivery_address: order.shippingAddress || ''
      }));
    } else {
      setForm(f => ({ ...f, order_id: orderId }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.order_id) return toast.error('Select an order');
    setLoading(true);
    try {
      await dispatchService.createDispatch(form);
      toast.success('Dispatch created!');
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to create dispatch');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm border-0 outline-none focus:ring-2 focus:ring-orange-500/40 text-slate-900 dark:text-white placeholder-slate-400';
  const labelCls = 'block text-xs font-semibold text-nexus-textSecondary dark:text-nexus-textSecondary mb-1.5 uppercase tracking-wide';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-nexus-surface rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-nexus-border max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-nexus-border">
          <h2 className="font-bold text-slate-900 dark:text-white">New Dispatch</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-nexus-textSecondary"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className={labelCls}>Order</label>
            <select value={form.order_id} onChange={e => handleOrderSelect(e.target.value)}
              className={inputCls + ' cursor-pointer'}>
              <option value="">-- Select Order --</option>
              {orders.map(o => (
                <option key={o.id} value={o.id}>#{o.id} · {o.customer} · KES {Number(o.total).toLocaleString()}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Customer Name</label>
              <input value={form.customer_name} onChange={e => setForm(f => ({...f, customer_name: e.target.value}))} placeholder="Customer Name" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input value={form.customer_phone} onChange={e => setForm(f => ({...f, customer_phone: e.target.value}))} placeholder="Phone" className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Delivery Address</label>
            <textarea value={form.delivery_address} onChange={e => setForm(f => ({...f, delivery_address: e.target.value}))}
              placeholder="Delivery address..." rows={2} className={inputCls + ' resize-none'} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Dispatch Date</label>
              <input type="date" value={form.dispatch_date} onChange={e => setForm(f => ({...f, dispatch_date: e.target.value}))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Est. Delivery</label>
              <input type="date" value={form.estimated_delivery} onChange={e => setForm(f => ({...f, estimated_delivery: e.target.value}))} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))}
              placeholder="Optional notes..." rows={2} className={inputCls + ' resize-none'} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-nexus-border text-sm font-medium text-slate-600 dark:text-nexus-textSecondary">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Dispatch'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ── Print delivery note ────────────────────────────────────────
const printDeliveryNote = async (dispatch) => {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('DELIVERY NOTE', 105, 20, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('NexusTech Hub', 105, 28, { align: 'center' });
  doc.line(20, 32, 190, 32);

  const addRow = (label, value, y) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label + ':', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value || 'N/A'), 70, y);
  };

  addRow('Dispatch No.', dispatch.dispatch_number, 45);
  addRow('Order ID', `#${dispatch.order_id}`, 55);
  addRow('Customer', dispatch.customer_name, 65);
  addRow('Phone', dispatch.customer_phone, 75);
  addRow('Delivery Address', dispatch.delivery_address, 85);
  addRow('Driver', dispatch.drivers?.full_name, 95);
  addRow('Vehicle', dispatch.vehicle, 105);
  addRow('Dispatch Date', dispatch.dispatch_date, 115);
  addRow('Est. Delivery', dispatch.estimated_delivery, 125);
  addRow('Status', STATUS_CONFIG[dispatch.status]?.label || dispatch.status, 135);

  doc.line(20, 145, 190, 145);
  doc.setFontSize(8);
  doc.text('Recipient Signature: ____________________', 20, 160);
  doc.text('Date Received: ____________________', 120, 160);
  doc.text('Generated by NexusTech Hub ERP', 105, 280, { align: 'center' });

  doc.save(`delivery-note-${dispatch.dispatch_number}.pdf`);
};

// ── Main Page ──────────────────────────────────────────────────
const DispatchPage = () => {
  const [dispatches, setDispatches] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});
  const [assignModal, setAssignModal] = useState(null);
  const [statusModal, setStatusModal] = useState(null);
  const [createModal, setCreateModal] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [dispRes, statsRes] = await Promise.all([
        dispatchService.getDispatches({ page, status: activeFilter, search }),
        dispatchService.getDispatchStats()
      ]);
      if (dispRes.success) { setDispatches(dispRes.data); setMeta(dispRes.meta); }
      if (statsRes.success) setStats(statsRes.stats);
    } catch (err) {
      toast.error('Failed to load dispatches');
    } finally {
      setLoading(false);
    }
  }, [page, activeFilter, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Realtime
  useEffect(() => {
    const unsub = dispatchService.subscribeToDispatches(() => fetchData());
    return unsub;
  }, [fetchData]);

  const statCards = [
    { key: 'all',       label: 'Total',      value: Object.values(stats).reduce((a,b) => a + (typeof b === 'number' ? b : 0), 0), icon: Truck,        color: 'text-slate-600 dark:text-nexus-textSecondary', bg: 'bg-slate-100 dark:bg-slate-800' },
    { key: 'pending',   label: 'Pending',    value: stats.pending || 0,    icon: Clock,        color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-100 dark:bg-amber-500/20' },
    { key: 'assigned',  label: 'Assigned',   value: stats.assigned || 0,   icon: User,         color: 'text-blue-600 dark:text-blue-400',     bg: 'bg-blue-100 dark:bg-blue-500/20' },
    { key: 'in_transit',label: 'In Transit', value: stats.in_transit || 0, icon: TrendingUp,   color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-500/20' },
    { key: 'delivered', label: 'Delivered',  value: stats.delivered || 0,  icon: CheckCircle,  color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/20' },
    { key: 'failed',    label: 'Failed',     value: stats.failed || 0,     icon: XCircle,      color: 'text-red-600 dark:text-red-400',       bg: 'bg-red-100 dark:bg-red-500/20' },
  ];

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">Dispatch Management</h1>
          <p className="text-nexus-textSecondary dark:text-nexus-textSecondary text-sm mt-1">Track and manage all delivery dispatches</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-nexus-border text-slate-600 dark:text-nexus-textSecondary hover:text-orange-500 transition-colors">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => setCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors shadow-lg shadow-orange-500/25">
            <Plus size={16} /> New Dispatch
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map(card => (
          <StatCard key={card.key} {...card} active={activeFilter === card.key}
            onClick={() => { setActiveFilter(card.key); setPage(1); }} />
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-nexus-surface rounded-2xl border border-slate-200 dark:border-nexus-border shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-slate-200 dark:border-nexus-border">
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-textSecondary" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search dispatches..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm border-0 outline-none focus:ring-2 focus:ring-orange-500/40" />
          </div>
          <p className="text-xs text-nexus-textSecondary dark:text-nexus-textSecondary">
            {meta.total || 0} dispatches
          </p>
        </div>

        {/* Table body */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-nexus-border">
                {['Dispatch #', 'Customer', 'Address', 'Driver', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-nexus-textSecondary dark:text-nexus-textSecondary whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-nexus-border">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-4"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : dispatches.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16 text-nexus-textSecondary">
                  <Truck size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No dispatches found</p>
                </td></tr>
              ) : dispatches.map((d, i) => (
                <motion.tr key={d.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-slate-100 dark:border-nexus-border hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-bold text-orange-600 dark:text-orange-400">{d.dispatch_number}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{d.customer_name || 'N/A'}</p>
                      {d.customer_phone && <p className="text-xs text-nexus-textSecondary">{d.customer_phone}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-[160px]">
                    <p className="text-xs text-slate-600 dark:text-nexus-textSecondary truncate">{d.delivery_address || 'N/A'}</p>
                  </td>
                  <td className="px-4 py-3">
                    {d.drivers ? (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0">
                          {d.drivers.photo_url ? <img src={d.drivers.photo_url} alt="" className="w-full h-full object-cover" /> : d.drivers.full_name?.[0]}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">{d.drivers.full_name}</p>
                          <p className="text-xs text-nexus-textSecondary">{d.drivers.vehicle_number}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-nexus-textSecondary italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-slate-600 dark:text-nexus-textSecondary">{d.dispatch_date || '—'}</p>
                    {d.estimated_delivery && <p className="text-xs text-nexus-textSecondary">Est: {d.estimated_delivery}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {!d.drivers && (
                        <button onClick={() => setAssignModal(d)} title="Assign Driver"
                          className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">
                          <User size={14} />
                        </button>
                      )}
                      <button onClick={() => setStatusModal(d)} title="Update Status"
                        className="p-1.5 rounded-lg text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => printDeliveryNote(d)} title="Print Delivery Note"
                        className="p-1.5 rounded-lg text-nexus-textSecondary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <Printer size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-nexus-border">
            <p className="text-xs text-nexus-textSecondary">Page {meta.page} of {meta.totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={meta.page <= 1}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                Prev
              </button>
              <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={meta.page >= meta.totalPages}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {assignModal && <AssignDriverModal dispatch={assignModal} onClose={() => setAssignModal(null)} onAssigned={fetchData} />}
        {statusModal && <UpdateStatusModal dispatch={statusModal} onClose={() => setStatusModal(null)} onUpdated={fetchData} />}
        {createModal && <CreateDispatchModal onClose={() => setCreateModal(false)} onCreated={fetchData} />}
      </AnimatePresence>
    </div>
  );
};

export default DispatchPage;
