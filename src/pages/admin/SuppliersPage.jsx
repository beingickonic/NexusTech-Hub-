import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Star, Phone, Mail, Globe, MapPin, X, Plus, Search,
  RefreshCw, Edit3, Trash2, ShieldOff, ShieldCheck, Package,
  DollarSign, TrendingUp, ChevronRight, Users, Layers, Link
} from 'lucide-react';
import { supplierService } from '../../services/supplierService';
import toast from 'react-hot-toast';

// ── Status Badge ───────────────────────────────────────────────
const SupplierStatusBadge = ({ status }) => {
  const cfg = {
    active:    { label: 'Active',    color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/15', dot: 'bg-emerald-500' },
    suspended: { label: 'Suspended', color: 'text-red-600 dark:text-red-400',         bg: 'bg-red-100 dark:bg-red-500/15',         dot: 'bg-red-500' },
    inactive:  { label: 'Inactive',  color: 'text-nexus-textSecondary',                         bg: 'bg-slate-100 dark:bg-slate-800',         dot: 'bg-slate-400' }
  }[status] || { label: status, color: 'text-nexus-textSecondary', bg: 'bg-slate-100', dot: 'bg-slate-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.color} ${cfg.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
    </span>
  );
};

// ── Supplier Form Modal ────────────────────────────────────────
const SupplierFormModal = ({ supplier, onClose, onSaved }) => {
  const isEdit = !!supplier?.id;
  const [form, setForm] = useState({
    name: supplier?.name || '',
    contact_person: supplier?.contact_person || '',
    phone: supplier?.phone || '',
    email: supplier?.email || '',
    company: supplier?.company || '',
    address: supplier?.address || '',
    city: supplier?.city || '',
    country: supplier?.country || 'Kenya',
    tax_number: supplier?.tax_number || '',
    website: supplier?.website || '',
    notes: supplier?.notes || '',
    status: supplier?.status || 'active'
  });
  const [loading, setLoading] = useState(false);

  const f = (field) => ({ value: form[field], onChange: e => setForm(p => ({ ...p, [field]: e.target.value })) });
  const inputCls = 'w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm border-0 outline-none focus:ring-2 focus:ring-orange-500/40 text-slate-900 dark:text-white placeholder-slate-400';
  const labelCls = 'block text-xs font-semibold text-nexus-textSecondary dark:text-nexus-textSecondary mb-1.5 uppercase tracking-wide';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error('Supplier name required');
    setLoading(true);
    try {
      if (isEdit) {
        await supplierService.updateSupplier(supplier.id, form);
        toast.success('Supplier updated!');
      } else {
        await supplierService.createSupplier(form);
        toast.success('Supplier added!');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-nexus-surface rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-nexus-border max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-nexus-border">
          <h2 className="font-bold text-slate-900 dark:text-white">{isEdit ? 'Edit Supplier' : 'Add Supplier'}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-nexus-textSecondary"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={labelCls}>Supplier Name *</label>
              <input {...f('name')} required placeholder="Supplier / Business Name" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Contact Person</label>
              <input {...f('contact_person')} placeholder="Full Name" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Company</label>
              <input {...f('company')} placeholder="Company Name" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input {...f('phone')} placeholder="+254..." className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" {...f('email')} placeholder="email@example.com" className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Address</label>
              <input {...f('address')} placeholder="Street address" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>City</label>
              <input {...f('city')} placeholder="City" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Country</label>
              <input {...f('country')} placeholder="Country" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Tax Number</label>
              <input {...f('tax_number')} placeholder="VAT/TIN" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Website</label>
              <input {...f('website')} placeholder="https://..." className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select {...f('status')} className={inputCls + ' cursor-pointer'}>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Notes</label>
            <textarea {...f('notes')} rows={2} placeholder="Internal notes..." className={inputCls + ' resize-none'} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-nexus-border text-sm font-medium text-slate-600 dark:text-nexus-textSecondary">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold disabled:opacity-50">
              {loading ? 'Saving...' : isEdit ? 'Update Supplier' : 'Add Supplier'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ── Supplier Profile Drawer ────────────────────────────────────
const SupplierProfileDrawer = ({ supplier, onClose, onUpdated }) => {
  const [products, setProducts] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supplier) return;
    Promise.all([
      supplierService.getSupplierProducts(supplier.id),
      supplierService.getSupplierPerformance(supplier.id)
    ]).then(([prodRes, perfRes]) => {
      setProducts(prodRes.data || []);
      if (perfRes.success) setPerformance(perfRes.data);
      setLoading(false);
    });
  }, [supplier]);

  const handleStatusChange = async (status) => {
    try {
      await supplierService.updateSupplierStatus(supplier.id, status);
      toast.success(`Supplier ${status === 'active' ? 'activated' : 'suspended'}`);
      onUpdated();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (!supplier) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }}
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-nexus-surface w-full sm:w-[420px] h-full overflow-y-auto border-l border-slate-200 dark:border-nexus-border shadow-2xl">
        <div className="sticky top-0 bg-white dark:bg-nexus-surface p-5 border-b border-slate-200 dark:border-nexus-border flex items-center justify-between z-10">
          <h2 className="font-bold text-slate-900 dark:text-white">Supplier Profile</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-nexus-textSecondary"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-lg">
              {supplier.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{supplier.name}</h3>
              {supplier.company && <p className="text-sm text-nexus-textSecondary">{supplier.company}</p>}
              <div className="mt-1.5"><SupplierStatusBadge status={supplier.status} /></div>
            </div>
          </div>

          {/* Performance */}
          {performance && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total Purchases', value: `KES ${(performance.total_purchases || 0).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                { label: 'Orders', value: performance.order_count || 0, icon: Package, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' }
              ].map(s => (
                <div key={s.label} className={`${s.bg} rounded-xl p-3 flex items-center gap-2`}>
                  <s.icon size={18} className={s.color} />
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{s.value}</p>
                    <p className="text-xs text-nexus-textSecondary">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Contact Info */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-nexus-textSecondary">Contact</h4>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 space-y-2">
              {[
                { icon: Users, value: supplier.contact_person },
                { icon: Phone, value: supplier.phone },
                { icon: Mail, value: supplier.email },
                { icon: MapPin, value: [supplier.address, supplier.city, supplier.country].filter(Boolean).join(', ') },
                { icon: Globe, value: supplier.website },
              ].filter(r => r.value).map((row, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-nexus-textSecondary">
                  <row.icon size={13} className="text-nexus-textSecondary flex-shrink-0 mt-0.5" />
                  <span className="break-all">{row.value}</span>
                </div>
              ))}
              {supplier.tax_number && (
                <div className="text-xs text-nexus-textSecondary">Tax #: {supplier.tax_number}</div>
              )}
            </div>
          </div>

          {/* Status Actions */}
          <div className="flex gap-2">
            {supplier.status !== 'active' && (
              <button onClick={() => handleStatusChange('active')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm font-semibold hover:bg-emerald-100 transition-colors">
                <ShieldCheck size={15} /> Activate
              </button>
            )}
            {supplier.status !== 'suspended' && (
              <button onClick={() => handleStatusChange('suspended')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm font-semibold hover:bg-red-100 transition-colors">
                <ShieldOff size={15} /> Suspend
              </button>
            )}
          </div>

          {/* Products */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-nexus-textSecondary">Products Supplied ({products.length})</h4>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
              ))
            ) : products.length === 0 ? (
              <div className="text-center py-6 text-nexus-textSecondary text-sm">
                <Package size={28} className="mx-auto mb-2 opacity-30" />
                <p>No products linked</p>
              </div>
            ) : products.map(sp => {
              const product = sp.products;
              if (!product) return null;
              return (
                <div key={sp.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  {product.image_url && <img src={product.image_url} alt="" className="w-8 h-8 rounded-lg object-cover" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{product.title}</p>
                    <p className="text-xs text-nexus-textSecondary">Stock: {product.stock || 0} · {sp.is_primary ? '★ Primary' : ''}</p>
                  </div>
                  {sp.unit_cost && <p className="text-xs font-bold text-slate-700 dark:text-nexus-textSecondary">KES {sp.unit_cost}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ── Main Suppliers Page ────────────────────────────────────────
const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});
  const [formModal, setFormModal] = useState(null);
  const [profileDrawer, setProfileDrawer] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [suppRes, statsRes] = await Promise.all([
        supplierService.getSuppliers({ page, search, status: statusFilter }),
        supplierService.getSupplierStats()
      ]);
      if (suppRes.success) { setSuppliers(suppRes.data); setMeta(suppRes.meta); }
      if (statsRes.success) setStats(statsRes.stats);
    } catch (err) {
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (supplier) => {
    if (!confirm(`Delete supplier "${supplier.name}"? This cannot be undone.`)) return;
    try {
      await supplierService.deleteSupplier(supplier.id);
      toast.success('Supplier deleted');
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Cannot delete — may have linked records');
    }
  };

  const statCards = [
    { label: 'Total Suppliers', value: stats.total || 0,    icon: Building2,  color: 'text-slate-700 dark:text-nexus-textSecondary', bg: 'bg-slate-100 dark:bg-slate-800' },
    { label: 'Active',          value: stats.active || 0,   icon: ShieldCheck,color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/20' },
    { label: 'Suspended',       value: stats.suspended || 0,icon: ShieldOff,  color: 'text-red-600 dark:text-red-400',     bg: 'bg-red-100 dark:bg-red-500/20' },
  ];

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">Supplier Management</h1>
          <p className="text-nexus-textSecondary dark:text-nexus-textSecondary text-sm mt-1">Manage your vendors and purchasing relationships</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-nexus-border text-slate-600 hover:text-orange-500 transition-colors">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => setFormModal({})}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors shadow-lg shadow-orange-500/25">
            <Plus size={16} /> Add Supplier
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {statCards.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-nexus-border/50 p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.bg} ${s.color}`}><s.icon size={18} /></div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{s.value}</p>
            <p className="text-xs font-medium text-nexus-textSecondary dark:text-nexus-textSecondary mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-textSecondary" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search suppliers..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-nexus-border text-sm outline-none focus:ring-2 focus:ring-orange-500/40" />
        </div>
        <div className="flex gap-2">
          {[['all','All'], ['active','Active'], ['suspended','Suspended'], ['inactive','Inactive']].map(([k,l]) => (
            <button key={k} onClick={() => { setStatusFilter(k); setPage(1); }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === k ? 'bg-orange-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-nexus-border text-slate-600 dark:text-nexus-textSecondary'
              }`}>{l}</button>
          ))}
        </div>
      </div>

      {/* Suppliers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-nexus-border p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : suppliers.length === 0 ? (
        <div className="text-center py-20 text-nexus-textSecondary">
          <Building2 size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No suppliers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((supplier, i) => (
            <motion.div key={supplier.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-white dark:bg-nexus-surface rounded-2xl border border-slate-200 dark:border-nexus-border p-5 hover:shadow-lg dark:hover:shadow-slate-900/50 transition-all group">
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-lg">
                  {supplier.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white truncate">{supplier.name}</h3>
                  {supplier.company && <p className="text-xs text-nexus-textSecondary truncate">{supplier.company}</p>}
                  <div className="mt-1"><SupplierStatusBadge status={supplier.status} /></div>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-1.5 mb-4">
                {supplier.contact_person && (
                  <div className="flex items-center gap-1.5 text-xs text-nexus-textSecondary"><Users size={11} />{supplier.contact_person}</div>
                )}
                {supplier.phone && <div className="flex items-center gap-1.5 text-xs text-nexus-textSecondary"><Phone size={11} />{supplier.phone}</div>}
                {supplier.email && <div className="flex items-center gap-1.5 text-xs text-nexus-textSecondary truncate"><Mail size={11} />{supplier.email}</div>}
                {(supplier.city || supplier.country) && (
                  <div className="flex items-center gap-1.5 text-xs text-nexus-textSecondary">
                    <MapPin size={11} />{[supplier.city, supplier.country].filter(Boolean).join(', ')}
                  </div>
                )}
              </div>

              {/* Product count */}
              <div className="flex items-center gap-2 py-3 border-y border-slate-100 dark:border-nexus-border mb-4">
                <Layers size={13} className="text-nexus-textSecondary" />
                <span className="text-xs text-nexus-textSecondary">{supplier.products_count || 0} products linked</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button onClick={() => setProfileDrawer(supplier)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-nexus-textSecondary hover:bg-orange-500/10 hover:text-orange-600 transition-colors">
                  <ChevronRight size={13} /> View
                </button>
                <button onClick={() => setFormModal(supplier)} title="Edit"
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-nexus-textSecondary hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 transition-colors">
                  <Edit3 size={14} />
                </button>
                <button onClick={() => handleDelete(supplier)} title="Delete"
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-nexus-textSecondary hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={meta.page <= 1}
            className="px-4 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-nexus-border disabled:opacity-40">Prev</button>
          <span className="px-4 py-2 text-sm text-nexus-textSecondary">Page {meta.page} / {meta.totalPages}</span>
          <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={meta.page >= meta.totalPages}
            className="px-4 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-nexus-border disabled:opacity-40">Next</button>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {formModal !== null && (
          <SupplierFormModal supplier={formModal?.id ? formModal : null} onClose={() => setFormModal(null)} onSaved={fetchData} />
        )}
        {profileDrawer && (
          <SupplierProfileDrawer supplier={profileDrawer} onClose={() => setProfileDrawer(null)}
            onUpdated={() => { fetchData(); setProfileDrawer(null); }} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SuppliersPage;
