import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRightLeft, Plus, Search, Filter, CheckCircle2,
  XCircle, Clock, Truck, Package, Eye, X, AlertTriangle,
  ChevronDown, RefreshCw, ArrowRight, MapPin
} from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { inventoryService } from '../../services/inventoryService';

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',   icon: Clock },
  approved:   { label: 'Approved',   color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',       icon: CheckCircle2 },
  rejected:   { label: 'Rejected',   color: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',           icon: XCircle },
  in_transit: { label: 'In Transit', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400', icon: Truck },
  received:   { label: 'Received',   color: 'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400',       icon: Package },
  completed:  { label: 'Completed',  color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400', icon: CheckCircle2 },
  cancelled:  { label: 'Cancelled',  color: 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-nexus-textSecondary',   icon: XCircle }
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${cfg.color}`}>
      <Icon size={12} /> {cfg.label}
    </span>
  );
};

const CreateTransferModal = ({ onClose, onSuccess }) => {
  const [products, setProducts]     = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [form, setForm] = useState({
    product_id: '', from_warehouse_id: '', to_warehouse_id: '',
    quantity: 1, notes: '', status: 'pending'
  });

  useEffect(() => {
    Promise.all([inventoryService.getProducts(), inventoryService.getWarehouses()]).then(([p, w]) => {
      if (p.success) setProducts(p.data);
      if (w.success) setWarehouses(w.data);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.product_id || !form.from_warehouse_id || !form.to_warehouse_id) return alert('Please fill all required fields.');
    if (form.from_warehouse_id === form.to_warehouse_id) return alert('Source and destination warehouses must be different.');
    if (Number(form.quantity) < 1) return alert('Quantity must be at least 1.');
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const result = await inventoryService.createTransfer({ ...form, product_id: Number(form.product_id), from_warehouse_id: Number(form.from_warehouse_id), to_warehouse_id: Number(form.to_warehouse_id), quantity: Number(form.quantity), requested_by: user?.id });
      if (result.success) { onSuccess(); onClose(); }
    } catch (err) {
      alert('Failed to create transfer: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-nexus-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-slate-900 dark:text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-nexus-border shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-nexus-border">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><ArrowRightLeft size={20} className="text-primary" /> New Stock Transfer</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-nexus-textSecondary uppercase mb-1.5">Product *</label>
            <select value={form.product_id} onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))} className={inputCls} required>
              <option value="">Select product...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.title} {p.sku ? `(${p.sku})` : ''}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-nexus-textSecondary uppercase mb-1.5">From Warehouse *</label>
              <select value={form.from_warehouse_id} onChange={e => setForm(f => ({ ...f, from_warehouse_id: e.target.value }))} className={inputCls} required>
                <option value="">Select source...</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-nexus-textSecondary uppercase mb-1.5">To Warehouse *</label>
              <select value={form.to_warehouse_id} onChange={e => setForm(f => ({ ...f, to_warehouse_id: e.target.value }))} className={inputCls} required>
                <option value="">Select destination...</option>
                {warehouses.filter(w => String(w.id) !== form.from_warehouse_id).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-nexus-textSecondary uppercase mb-1.5">Quantity *</label>
            <input type="number" min={1} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} className={inputCls} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-nexus-textSecondary uppercase mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className={inputCls} placeholder="Transfer notes..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-nexus-border text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-orange-600 text-white text-sm font-semibold disabled:opacity-60 transition-colors">
              {loading ? 'Creating...' : 'Create Transfer'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const TransferDetailModal = ({ transfer, onClose, onAction, currentUser }) => {
  const [loading, setLoading] = useState(false);
  const [rejReason, setRejReason] = useState('');
  const [showReject, setShowReject] = useState(false);

  const handleAction = async (action) => {
    setLoading(true);
    try {
      await onAction(transfer.id, action, rejReason);
      onClose();
    } catch (err) {
      alert('Action failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const product = transfer.products || {};
  const fromWh  = transfer.from_warehouse || {};
  const toWh    = transfer.to_warehouse   || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-nexus-border shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-nexus-border">
          <h2 className="font-bold text-slate-900 dark:text-white">Transfer Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-nexus-textSecondary">{transfer.reference_number || `TRF-${transfer.id}`}</span>
            <StatusBadge status={transfer.status} />
          </div>
          <div className="bg-slate-50 dark:bg-white/[0.03] rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg"><Package size={16} className="text-primary" /></div>
              <div><p className="font-semibold text-slate-900 dark:text-white text-sm">{product.title || 'Unknown'}</p>
              <p className="text-xs text-nexus-textSecondary">{product.sku || ''}</p></div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-slate-600 dark:text-nexus-textSecondary"><MapPin size={14} /> {fromWh.name || 'N/A'}</div>
              <ArrowRight size={16} className="text-primary" />
              <div className="flex items-center gap-1 text-slate-600 dark:text-nexus-textSecondary"><MapPin size={14} /> {toWh.name || 'N/A'}</div>
            </div>
            <div className="text-center"><span className="text-2xl font-bold text-primary">{transfer.quantity}</span><span className="text-nexus-textSecondary text-sm ml-1">units</span></div>
          </div>
          {transfer.notes && <p className="text-sm text-slate-600 dark:text-nexus-textSecondary bg-slate-50 dark:bg-white/5 rounded-lg p-3">{transfer.notes}</p>}
          {transfer.rejection_reason && <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-lg p-3">Rejection: {transfer.rejection_reason}</p>}

          {showReject && (
            <div>
              <label className="block text-xs font-semibold text-nexus-textSecondary uppercase mb-1.5">Rejection Reason</label>
              <textarea value={rejReason} onChange={e => setRejReason(e.target.value)} rows={2} className="w-full bg-white dark:bg-[#0f172a] border border-red-200 dark:border-red-500/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/40 text-slate-900 dark:text-white" placeholder="Reason for rejection..." />
              <div className="flex gap-2 mt-2">
                <button onClick={() => setShowReject(false)} className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-nexus-border text-sm">Cancel</button>
                <button onClick={() => handleAction('rejected')} disabled={loading || !rejReason} className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-60">Confirm Reject</button>
              </div>
            </div>
          )}

          {!showReject && (
            <div className="flex flex-wrap gap-2">
              {transfer.status === 'pending' && <>
                <button onClick={() => handleAction('approved')} disabled={loading} className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold disabled:opacity-60">Approve</button>
                <button onClick={() => setShowReject(true)} className="flex-1 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400 text-sm font-semibold">Reject</button>
              </>}
              {transfer.status === 'approved' && <button onClick={() => handleAction('in_transit')} disabled={loading} className="flex-1 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold disabled:opacity-60">Mark In Transit</button>}
              {transfer.status === 'in_transit' && <button onClick={() => handleAction('received')} disabled={loading} className="flex-1 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold disabled:opacity-60">Mark Received</button>}
              {transfer.status === 'received' && <button onClick={() => handleAction('completed')} disabled={loading} className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold disabled:opacity-60">Complete</button>}
              {['pending','approved'].includes(transfer.status) && <button onClick={() => handleAction('cancelled')} disabled={loading} className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-nexus-textSecondary hover:bg-slate-200 dark:hover:bg-white/10 text-sm font-medium disabled:opacity-60">Cancel</button>}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const StockTransfersPage = () => {
  const [transfers, setTransfers]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showCreate, setShowCreate]     = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentUser, setCurrentUser]   = useState(null);

  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await inventoryService.getTransfers({ limit: 100, status: filterStatus });
      if (result.success) setTransfers(result.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filterStatus]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data?.user));
    fetchTransfers();
    const sub = supabase.channel('transfers_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stock_transfers' }, fetchTransfers)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, fetchTransfers)
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, [fetchTransfers]);

  const handleAction = async (id, newStatus, rejectionReason) => {
    const extra = {};
    if (newStatus === 'rejected' && rejectionReason) extra.rejection_reason = rejectionReason;
    if (newStatus === 'received') extra.received_date = new Date().toISOString();
    await inventoryService.updateTransferStatus(id, newStatus, extra);
    await fetchTransfers();
  };

  const filtered = transfers.filter(t => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (t.products?.title || '').toLowerCase().includes(q) ||
           (t.reference_number || '').toLowerCase().includes(q) ||
           (t.from_warehouse?.name || '').toLowerCase().includes(q) ||
           (t.to_warehouse?.name  || '').toLowerCase().includes(q);
  });

  const summaryStats = {
    total:      transfers.length,
    pending:    transfers.filter(t => t.status === 'pending').length,
    inTransit:  transfers.filter(t => t.status === 'in_transit').length,
    completed:  transfers.filter(t => t.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Stock Transfers</h1>
          <p className="text-nexus-textSecondary text-sm mt-1">Manage inventory movements between warehouses</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchTransfers} className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-nexus-border transition-colors">
            <RefreshCw size={16} className="text-slate-600 dark:text-nexus-textSecondary" />
          </button>
          <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-primary/25">
            <Plus size={18} /> New Transfer
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: summaryStats.total,     color: 'text-slate-600',    bg: 'bg-slate-50 dark:bg-white/5' },
          { label: 'Pending', value: summaryStats.pending,  color: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-500/10' },
          { label: 'In Transit', value: summaryStats.inTransit, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
          { label: 'Completed', value: summaryStats.completed, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-slate-200 dark:border-nexus-border`}>
            <p className="text-xs font-semibold text-nexus-textSecondary uppercase tracking-wider">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-nexus-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-nexus-border flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-textSecondary" size={18} />
            <input type="text" placeholder="Search product, warehouse, or ref..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-nexus-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-slate-900 dark:text-white" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-nexus-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-slate-900 dark:text-white">
            <option value="">All Status</option>
            {Object.entries(STATUS_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-nexus-border">
                {['Reference','Product','Route','Quantity','Status','Date','Actions'].map(h => (
                  <th key={h} className="px-5 py-4 text-xs font-semibold text-nexus-textSecondary dark:text-nexus-textSecondary uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {loading ? [...Array(4)].map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-5 py-4"><div className="h-8 bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse" /></td></tr>
              )) : filtered.length > 0 ? filtered.map(t => (
                <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                  <td className="px-5 py-4">
                    <p className="font-mono text-xs font-semibold text-primary">{t.reference_number || `TRF-${t.id}`}</p>
                    <p className="text-xs text-nexus-textSecondary mt-0.5">#{t.id}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900 dark:text-white text-sm">{t.products?.title || 'Unknown'}</p>
                    <p className="text-xs font-mono text-nexus-textSecondary">{t.products?.sku || ''}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-nexus-textSecondary">
                      <span className="truncate max-w-[80px]">{t.from_warehouse?.name || 'N/A'}</span>
                      <ArrowRight size={12} className="text-primary flex-shrink-0" />
                      <span className="truncate max-w-[80px]">{t.to_warehouse?.name || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4"><span className="font-bold text-slate-900 dark:text-white">{t.quantity}</span><span className="text-nexus-textSecondary text-xs ml-1">units</span></td>
                  <td className="px-5 py-4"><StatusBadge status={t.status} /></td>
                  <td className="px-5 py-4 text-xs text-nexus-textSecondary">{new Date(t.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => setSelectedTransfer(t)} className="p-2 hover:bg-primary/10 rounded-lg text-nexus-textSecondary hover:text-primary transition-colors">
                      <Eye size={16} />
                    </button>
                  </td>
                </motion.tr>
              )) : (
                <tr><td colSpan={7} className="px-5 py-16 text-center text-nexus-textSecondary">
                  <ArrowRightLeft size={48} className="mx-auto text-nexus-textSecondary dark:text-slate-600 mb-3" />
                  <p className="font-medium">No transfers found</p>
                  <p className="text-sm mt-1">Create your first stock transfer to get started</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showCreate && <CreateTransferModal onClose={() => setShowCreate(false)} onSuccess={fetchTransfers} />}
        {selectedTransfer && <TransferDetailModal transfer={selectedTransfer} onClose={() => setSelectedTransfer(null)} onAction={handleAction} currentUser={currentUser} />}
      </AnimatePresence>
    </div>
  );
};

export default StockTransfersPage;
