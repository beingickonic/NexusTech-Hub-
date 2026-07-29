import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Plus, Search, Eye, CheckCircle2, XCircle, Clock,
  X, RefreshCw, Package, Trash2, ClipboardList, ShieldAlert
} from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { inventoryService } from '../../services/inventoryService';

const STATUS_CONFIG = {
  reported:          { label: 'Reported',       color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',    icon: Clock },
  Reported:          { label: 'Reported',       color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',    icon: Clock },
  approved:          { label: 'Approved',       color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',        icon: CheckCircle2 },
  Approved:          { label: 'Approved',       color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',        icon: CheckCircle2 },
  disposed:          { label: 'Disposed',       color: 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400',         icon: Trash2 },
  Disposed:          { label: 'Disposed',       color: 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400',         icon: Trash2 },
  rejected:          { label: 'Rejected',       color: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',            icon: XCircle },
  Rejected:          { label: 'Rejected',       color: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',            icon: XCircle },
  pending_approval:  { label: 'Pending Review', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400', icon: Clock },
  'Pending Approval':{ label: 'Pending Review', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400', icon: Clock },
  written_off:       { label: 'Written Off',    color: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400',        icon: ShieldAlert },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.reported;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${cfg.color}`}>
      <Icon size={12} /> {cfg.label}
    </span>
  );
};

const ACTION_TYPES = ['Dispose','Repair','Return to Supplier','Write-off'];

const ReportDamageModal = ({ onClose, onSuccess }) => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    inventory_id: '', quantity: 1, reason: '', action_type: 'Dispose', notes: '', status: 'Reported'
  });

  useEffect(() => {
    supabase.from('inventory')
      .select('id, quantity_on_hand, products(title, sku)')
      .gt('quantity_on_hand', 0)
      .order('id')
      .limit(200)
      .then(({ data }) => setInventoryItems(data || []));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.inventory_id) return alert('Please select an inventory item.');
    if (Number(form.quantity) < 1) return alert('Quantity must be at least 1.');
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const result = await inventoryService.reportDamagedStock({
        inventory_id: Number(form.inventory_id),
        quantity: Number(form.quantity),
        reason: form.reason,
        action_type: form.action_type,
        notes: form.notes,
        status: 'Reported',
        reported_by: user?.id
      });
      if (result.success) { onSuccess(); onClose(); }
    } catch (err) { alert('Failed to report damage: ' + err.message); }
    finally { setLoading(false); }
  };

  const inputCls = 'w-full bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-slate-900 dark:text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10 sticky top-0 bg-white dark:bg-dark-surface z-10">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-500" /> Report Damaged Stock
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Inventory Item *</label>
            <select value={form.inventory_id} onChange={e => setForm(f => ({ ...f, inventory_id: e.target.value }))} className={inputCls} required>
              <option value="">Select inventory item...</option>
              {inventoryItems.map(inv => <option key={inv.id} value={inv.id}>{inv.products?.title || `Item #${inv.id}`} {inv.products?.sku ? `(${inv.products.sku})` : ''} — {inv.quantity_on_hand} in stock</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Damaged Quantity *</label>
              <input type="number" min={1} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} className={inputCls} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Recommended Action</label>
              <select value={form.action_type} onChange={e => setForm(f => ({ ...f, action_type: e.target.value }))} className={inputCls}>
                {ACTION_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Damage Reason *</label>
            <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} rows={2} className={inputCls} placeholder="Describe how the damage occurred..." required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Additional Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className={inputCls} placeholder="Any extra details..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold disabled:opacity-60 transition-colors">
              {loading ? 'Reporting...' : 'Report Damage'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const DamageDetailModal = ({ record, onClose, onAction }) => {
  const [loading, setLoading] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejReason, setRejReason]   = useState('');

  const product = record.inventory?.products || {};
  const warehouse = record.inventory?.warehouse_locations || {};

  const handleAction = async (action) => {
    setLoading(true);
    try {
      await onAction(record.id, action, rejReason);
      onClose();
    } catch (err) { alert('Action failed: ' + err.message); }
    finally { setLoading(false); }
  };

  const isPending = ['reported','Reported','pending_approval','Pending Approval'].includes(record.status);
  const isApproved = ['approved','Approved'].includes(record.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-white/10">
          <h2 className="font-bold text-slate-900 dark:text-white">Damage Report #{record.id}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">{new Date(record.created_at).toLocaleString()}</p>
            <StatusBadge status={record.status} />
          </div>
          <div className="bg-slate-50 dark:bg-white/[0.03] rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-lg"><AlertTriangle size={16} className="text-amber-500" /></div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{product.title || `Inventory #${record.inventory_id}`}</p>
                <p className="text-xs text-slate-500">{product.sku || ''} {warehouse.name ? `• ${warehouse.name}` : ''}</p>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Damaged Qty</span>
              <span className="font-bold text-red-600">{record.quantity} units</span>
            </div>
            {record.action_type && <div className="flex justify-between text-sm">
              <span className="text-slate-500">Action Type</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{record.action_type}</span>
            </div>}
          </div>
          {record.reason && <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-3"><p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">Reason</p><p className="text-sm text-slate-700 dark:text-slate-300">{record.reason}</p></div>}
          {record.notes  && <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3"><p className="text-xs font-semibold text-slate-500 mb-1">Notes</p><p className="text-sm text-slate-600 dark:text-slate-400">{record.notes}</p></div>}
          {record.rejection_reason && <div className="bg-red-50 dark:bg-red-500/10 rounded-xl p-3"><p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">Rejection Reason</p><p className="text-sm text-red-700 dark:text-red-300">{record.rejection_reason}</p></div>}

          {record.profiles && <p className="text-xs text-slate-400">Reported by: {record.profiles.full_name}</p>}

          {showReject && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Rejection Reason</label>
              <textarea value={rejReason} onChange={e => setRejReason(e.target.value)} rows={2} className="w-full bg-white dark:bg-[#0f172a] border border-red-200 dark:border-red-500/30 rounded-xl px-3 py-2 text-sm focus:outline-none text-slate-900 dark:text-white" placeholder="Reason for rejection..." />
              <div className="flex gap-2 mt-2">
                <button onClick={() => setShowReject(false)} className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-white/10 text-sm">Cancel</button>
                <button onClick={() => handleAction('Rejected')} disabled={loading || !rejReason} className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-60">Confirm Reject</button>
              </div>
            </div>
          )}

          {!showReject && (
            <div className="flex flex-wrap gap-2">
              {isPending && <>
                <button onClick={() => handleAction('Approved')} disabled={loading} className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold disabled:opacity-60">Approve</button>
                <button onClick={() => setShowReject(true)} className="flex-1 py-2 rounded-lg bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30 text-sm font-semibold">Reject</button>
              </>}
              {isApproved && <button onClick={() => handleAction('dispose')} disabled={loading} className="flex-1 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold disabled:opacity-60">Dispose Stock</button>}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const DamagedStockPage = () => {
  const [records, setRecords]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [selected, setSelected]     = useState(null);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const result = await inventoryService.getDamagedStock({ limit: 100 });
      if (result.success) setRecords(result.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchRecords();
    const sub = supabase.channel('damaged_stock_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'damaged_stock' }, fetchRecords)
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, [fetchRecords]);

  const handleAction = async (id, action, rejReason) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (action === 'dispose') {
      await inventoryService.disposeDamagedStock(id, user?.id);
    } else {
      const extra = {};
      if (['Rejected','rejected'].includes(action) && rejReason) extra.rejection_reason = rejReason;
      await inventoryService.updateDamagedStockStatus(id, action, extra);
    }
    await fetchRecords();
  };

  const filtered = records.filter(r => {
    if (filterStatus && r.status?.toLowerCase() !== filterStatus.toLowerCase() && r.status !== filterStatus) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (r.inventory?.products?.title || '').toLowerCase().includes(q) || (r.reason || '').toLowerCase().includes(q);
  });

  const summaryStats = {
    total:    records.length,
    reported: records.filter(r => ['reported','Reported'].includes(r.status)).length,
    approved: records.filter(r => ['approved','Approved'].includes(r.status)).length,
    disposed: records.filter(r => ['disposed','Disposed'].includes(r.status)).length,
    totalQty: records.reduce((s, r) => s + (r.quantity || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Damaged Stock</h1>
          <p className="text-slate-500 text-sm mt-1">Report and manage damaged inventory</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchRecords} className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10">
            <RefreshCw size={16} className="text-slate-600 dark:text-slate-300" />
          </button>
          <button onClick={() => setShowReport(true)} className="inline-flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-primary/25">
            <Plus size={18} /> Report Damage
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'Total Reports', value: summaryStats.total,    color: 'text-slate-600',  bg: 'bg-slate-50 dark:bg-white/5' },
          { label: 'Pending',       value: summaryStats.reported,  color: 'text-amber-600',  bg: 'bg-amber-50 dark:bg-amber-500/10' },
          { label: 'Approved',      value: summaryStats.approved,  color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-500/10' },
          { label: 'Disposed',      value: summaryStats.disposed,  color: 'text-slate-500',  bg: 'bg-slate-50 dark:bg-white/5' },
          { label: 'Total Units',   value: summaryStats.totalQty,  color: 'text-rose-600',   bg: 'bg-rose-50 dark:bg-rose-500/10' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-slate-200 dark:border-white/10`}>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search product or reason..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-slate-900 dark:text-white" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-slate-900 dark:text-white">
            <option value="">All Status</option>
            <option value="Reported">Reported</option>
            <option value="Approved">Approved</option>
            <option value="disposed">Disposed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10">
                {['Report','Product','Qty Damaged','Reason','Action Type','Status','Date','Actions'].map(h => (
                  <th key={h} className="px-5 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {loading ? [...Array(4)].map((_, i) => (
                <tr key={i}><td colSpan={8}><div className="h-12 px-5 py-4"><div className="h-8 bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse" /></div></td></tr>
              )) : filtered.length > 0 ? filtered.map(r => {
                const product = r.inventory?.products || {};
                const isPending = ['reported','Reported'].includes(r.status);
                const isApproved = ['approved','Approved'].includes(r.status);
                return (
                  <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4"><p className="font-mono text-xs font-semibold text-slate-500">#{r.id}</p></td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900 dark:text-white text-sm">{product.title || `Inventory #${r.inventory_id || r.id}`}</p>
                      <p className="text-xs font-mono text-slate-500">{product.sku || ''}</p>
                    </td>
                    <td className="px-5 py-4"><span className="font-bold text-rose-600">{r.quantity}</span><span className="text-slate-400 text-xs ml-1">units</span></td>
                    <td className="px-5 py-4 max-w-[150px]"><p className="text-sm text-slate-600 dark:text-slate-400 truncate">{r.reason || '—'}</p></td>
                    <td className="px-5 py-4"><span className="text-xs text-slate-500">{r.action_type || '—'}</span></td>
                    <td className="px-5 py-4"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-4 text-xs text-slate-500">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setSelected(r)} className="p-1.5 hover:bg-primary/10 rounded-lg text-slate-400 hover:text-primary transition-colors"><Eye size={15} /></button>
                        {isPending && <button onClick={async () => { const { data: { user } } = await supabase.auth.getUser(); await handleAction(r.id, 'Approved', ''); fetchRecords(); }} className="px-2 py-1 text-xs bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-md hover:bg-emerald-200 dark:hover:bg-emerald-500/30 font-semibold">Approve</button>}
                        {isApproved && <button onClick={async () => { const { data: { user } } = await supabase.auth.getUser(); await handleAction(r.id, 'dispose', ''); }} className="px-2 py-1 text-xs bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 rounded-md hover:bg-rose-200 dark:hover:bg-rose-500/30 font-semibold">Dispose</button>}
                      </div>
                    </td>
                  </motion.tr>
                );
              }) : (
                <tr><td colSpan={8} className="px-5 py-16 text-center text-slate-500">
                  <AlertTriangle size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="font-medium">No damage reports found</p>
                  <p className="text-sm mt-1">All stock items appear to be in good condition</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showReport && <ReportDamageModal onClose={() => setShowReport(false)} onSuccess={fetchRecords} />}
        {selected && <DamageDetailModal record={selected} onClose={() => setSelected(null)} onAction={handleAction} />}
      </AnimatePresence>
    </div>
  );
};

export default DamagedStockPage;
