import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Warehouse, AlertTriangle, TrendingDown, TrendingUp, Plus, Search,
  RefreshCw, X, History, Edit3, ArrowUp, ArrowDown, RotateCcw,
  Package, BarChart3, ChevronRight, Download, Layers
} from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import { supplierService } from '../../services/supplierService';
import toast from 'react-hot-toast';

// ── Stock Status Badge ─────────────────────────────────────────
const StockBadge = ({ status }) => {
  const cfg = {
    in_stock:     { label: 'In Stock',    color: 'text-nexus-success dark:text-nexus-success', bg: 'bg-nexus-success/10 dark:bg-nexus-success/15' },
    low_stock:    { label: 'Low Stock',   color: 'text-nexus-gold',     bg: 'bg-nexus-gold/10 dark:bg-nexus-gold/15' },
    out_of_stock: { label: 'Out of Stock',color: 'text-nexus-error',         bg: 'bg-nexus-error/10 dark:bg-nexus-error/15' },
    overstock:    { label: 'Overstock',   color: 'text-nexus-info',       bg: 'bg-nexus-info/10 dark:bg-nexus-info/15' }
  }[status] || { label: 'Unknown', color: 'text-nexus-textSecondary', bg: 'bg-nexus-surface' };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.color} ${cfg.bg}`}>{cfg.label}</span>;
};

// ── Stock Action Modal ─────────────────────────────────────────
const StockActionModal = ({ product, action, onClose, onDone }) => {
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [reason, setReason] = useState('damage');
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (action === 'add') {
      supplierService.getSuppliersList().then(res => setSuppliers(res.data || []));
    }
    if (action === 'adjust') setQuantity(String(product.quantity_on_hand || 0));
  }, [action, product]);

  const actionConfig = {
    add:    { title: 'Add Stock',     color: 'bg-nexus-success hover:bg-nexus-success', icon: ArrowUp },
    remove: { title: 'Remove Stock',  color: 'bg-nexus-error hover:bg-nexus-error',         icon: ArrowDown },
    adjust: { title: 'Adjust Stock',  color: 'bg-nexus-info hover:bg-nexus-primary-hover',       icon: RotateCcw }
  };
  const cfg = actionConfig[action] || actionConfig.add;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const qty = Number(quantity);
    if (!qty || qty < 0) return toast.error('Enter a valid quantity');
    setLoading(true);
    try {
      if (action === 'add') {
        await inventoryService.addStock(product.id, qty, { supplierId: supplierId || null, unitCost: unitCost || null, notes });
      } else if (action === 'remove') {
        await inventoryService.removeStock(product.id, qty, { reason, notes });
      } else if (action === 'adjust') {
        await inventoryService.adjustStock(product.id, qty, { notes });
      }
      toast.success(`Stock ${action === 'add' ? 'added' : action === 'remove' ? 'removed' : 'adjusted'} successfully!`);
      onDone();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full px-3 py-2.5 rounded-xl bg-nexus-surface text-sm border-0 outline-none focus:ring-2 focus:ring-nexus-primary/40 text-nexus-heading';
  const labelCls = 'block text-xs font-semibold text-nexus-muted mb-1.5 uppercase tracking-wide';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-nexus-card rounded-2xl shadow-2xl w-full max-w-sm border border-nexus-border">
        <div className="flex items-center justify-between p-5 border-b border-nexus-border">
          <div>
            <h2 className="font-bold text-nexus-heading">{cfg.title}</h2>
            <p className="text-xs text-nexus-textSecondary mt-0.5 truncate max-w-[220px]">{product.title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-nexus-surface dark:hover:bg-nexus-hover text-nexus-textSecondary"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className={labelCls}>{action === 'adjust' ? 'New Quantity' : 'Quantity'}</label>
            <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} min={0} required
              placeholder={action === 'adjust' ? `Current: ${product.quantity_on_hand}` : 'Enter quantity'}
              className={inputCls} />
          </div>
          {action === 'remove' && (
            <div>
              <label className={labelCls}>Reason</label>
              <select value={reason} onChange={e => setReason(e.target.value)} className={inputCls + ' cursor-pointer'}>
                {['damage', 'sale', 'return', 'transfer', 'adjustment'].map(r => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>
            </div>
          )}
          {action === 'add' && (
            <>
              <div>
                <label className={labelCls}>Supplier (optional)</label>
                <select value={supplierId} onChange={e => setSupplierId(e.target.value)} className={inputCls + ' cursor-pointer'}>
                  <option value="">No supplier</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Unit Cost (KES)</label>
                <input type="number" value={unitCost} onChange={e => setUnitCost(e.target.value)} min={0} step={0.01}
                  placeholder="Cost per unit" className={inputCls} />
              </div>
            </>
          )}
          <div>
            <label className={labelCls}>Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes..." rows={2}
              className={inputCls + ' resize-none'} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-nexus-border text-sm font-medium text-nexus-muted">Cancel</button>
            <button type="submit" disabled={loading} className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-50 ${cfg.color}`}>
              {loading ? 'Processing...' : cfg.title}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ── Movement History Drawer ────────────────────────────────────
const MovementHistoryDrawer = ({ product, onClose }) => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});

  useEffect(() => {
    if (!product) return;
    inventoryService.getStockMovements(product.id, { page }).then(res => {
      if (res.success) { setMovements(res.data); setMeta(res.meta); }
      setLoading(false);
    });
  }, [product, page]);

  const movTypeConfig = {
    purchase:   { color: 'text-nexus-success', bg: 'bg-nexus-success/10 dark:bg-nexus-success/10', label: 'Purchase' },
    sale:       { color: 'text-nexus-info',    bg: 'bg-nexus-info/10 dark:bg-nexus-info/10',       label: 'Sale' },
    return:     { color: 'text-info',  bg: 'bg-info/10 dark:bg-info/100/10',   label: 'Return' },
    damage:     { color: 'text-nexus-error',     bg: 'bg-nexus-error/5 dark:bg-nexus-error/10',         label: 'Damage' },
    adjustment: { color: 'text-nexus-primary',  bg: 'bg-nexus-primary/10 dark:bg-nexus-primary/10',   label: 'Adjustment' },
    transfer:   { color: 'text-nexus-textSecondary',   bg: 'bg-nexus-surface',        label: 'Transfer' }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }}
        onClick={e => e.stopPropagation()}
        className="bg-nexus-card w-full sm:w-96 h-full overflow-y-auto border-l border-nexus-border shadow-2xl">
        <div className="sticky top-0 bg-nexus-card p-5 border-b border-nexus-border flex items-center justify-between z-10">
          <div>
            <h2 className="font-bold text-nexus-heading">Stock History</h2>
            <p className="text-xs text-nexus-textSecondary truncate max-w-[220px]">{product?.title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-nexus-surface dark:hover:bg-nexus-hover text-nexus-textSecondary"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 bg-nexus-surface rounded-xl animate-pulse" />
            ))
          ) : movements.length === 0 ? (
            <div className="text-center py-12 text-nexus-textSecondary">
              <History size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No movements recorded</p>
            </div>
          ) : movements.map(m => {
            const cfg = movTypeConfig[m.movement_type] || movTypeConfig.adjustment;
            return (
              <div key={m.id} className={`flex items-center gap-3 p-3 rounded-xl ${cfg.bg}`}>
                <div className={`text-xs font-bold ${cfg.color} w-20 flex-shrink-0`}>{cfg.label}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-nexus-heading">
                    {m.quantity > 0 ? `+${m.quantity}` : m.quantity} units
                    <span className="text-nexus-textSecondary font-normal"> ({m.quantity_before} → {m.quantity_after})</span>
                  </p>
                  <p className="text-xs text-nexus-textSecondary truncate">{m.notes || m.suppliers?.name || m.profiles?.full_name || '—'}</p>
                </div>
                <p className="text-xs text-nexus-textSecondary flex-shrink-0">{new Date(m.created_at).toLocaleDateString()}</p>
              </div>
            );
          })}
        </div>
        {meta.totalPages > 1 && (
          <div className="flex justify-center gap-2 p-5 border-t border-nexus-border">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg text-xs bg-nexus-surface disabled:opacity-40">Prev</button>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= meta.totalPages}
              className="px-3 py-1.5 rounded-lg text-xs bg-nexus-surface disabled:opacity-40">Next</button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// ── Main Inventory Page ────────────────────────────────────────
const InventoryPage = () => {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});
  const [stockModal, setStockModal] = useState(null); // { product, action }
  const [historyDrawer, setHistoryDrawer] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [itemsRes, statsRes] = await Promise.all([
        inventoryService.getInventoryItems({ page, search, filter }),
        inventoryService.getInventoryStats()
      ]);
      if (itemsRes.success) { setItems(itemsRes.data); setMeta(itemsRes.meta); }
      if (statsRes.success) setStats(statsRes.stats);
    } catch (err) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [page, search, filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Realtime inventory alerts
  useEffect(() => {
    const unsub = inventoryService.subscribeToInventoryAlerts(({ type, product }) => {
      if (type === 'low_stock') toast(`⚠️ Low stock: ${product.title}`, { icon: '⚠️' });
    });
    return unsub;
  }, []);

  const statCards = [
    { label: 'Total Items',    value: meta.total || 0,               icon: Layers,        color: 'text-nexus-muted', bg: 'bg-nexus-surface' },
    { label: 'Low Stock',      value: stats.low_stock || 0,          icon: AlertTriangle, color: 'text-nexus-gold', bg: 'bg-nexus-gold/10 dark:bg-nexus-gold/20' },
    { label: 'Out of Stock',   value: stats.out_of_stock || 0,       icon: TrendingDown,  color: 'text-nexus-error',     bg: 'bg-nexus-error/10 dark:bg-nexus-error/20' },
    { label: 'Overstock',      value: stats.overstock || 0,          icon: TrendingUp,    color: 'text-nexus-info',   bg: 'bg-nexus-info/10 dark:bg-nexus-info/20' },
    { label: 'Stock Value',    value: `KES ${(stats.total_value || 0).toLocaleString()}`, icon: BarChart3, color: 'text-nexus-success dark:text-nexus-success', bg: 'bg-nexus-success/10 dark:bg-nexus-success/20' },
  ];

  const filterBtns = [
    { key: 'all', label: 'All' },
    { key: 'low', label: '⚠ Low Stock' },
    { key: 'out', label: '🔴 Out of Stock' },
    { key: 'over', label: '🔵 Overstock' }
  ];

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-nexus-heading">Inventory Management</h1>
          <p className="text-nexus-muted text-sm mt-1">Track stock levels, movements, and reorder alerts</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2.5 rounded-xl bg-nexus-card border border-nexus-border text-nexus-muted hover:text-nexus-primary transition-colors">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {(stats.low_stock > 0 || stats.out_of_stock > 0) && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-2xl bg-nexus-gold/10 dark:bg-nexus-gold/10 border border-nexus-gold/20 dark:border-nexus-gold/30">
          <AlertTriangle size={20} className="text-nexus-gold flex-shrink-0" />
          <p className="text-sm font-medium text-nexus-gold">
            {stats.out_of_stock > 0 && <span className="font-bold">{stats.out_of_stock} products out of stock</span>}
            {stats.out_of_stock > 0 && stats.low_stock > 0 && ' · '}
            {stats.low_stock > 0 && <span>{stats.low_stock} products running low</span>}
          </p>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-nexus-card rounded-2xl border border-nexus-border/50 p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.bg} ${s.color}`}><s.icon size={18} /></div>
            <p className="text-xl font-extrabold text-nexus-heading">{s.value}</p>
            <p className="text-xs font-medium text-nexus-muted mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-nexus-card rounded-2xl border border-nexus-border shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-nexus-border">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-56">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-textSecondary" />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-nexus-surface text-sm border-0 outline-none focus:ring-2 focus:ring-nexus-primary/40" />
            </div>
            <div className="flex gap-1.5">
              {filterBtns.map(btn => (
                <button key={btn.key} onClick={() => { setFilter(btn.key); setPage(1); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                    filter === btn.key ? 'bg-nexus-primary text-white' : 'bg-nexus-surface text-nexus-muted hover:bg-nexus-surface dark:hover:bg-nexus-hover'
                  }`}>{btn.label}</button>
              ))}
            </div>
          </div>
          <p className="text-xs text-nexus-textSecondary whitespace-nowrap">{meta.total || 0} products</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-nexus-border">
                {['Product', 'SKU', 'Category', 'On Hand', 'Reserved', 'Available', 'Reorder At', 'Supplier', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-nexus-muted whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-nexus-border">
                    {Array.from({ length: 10 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-nexus-surface rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-16 text-nexus-textSecondary">
                  <Warehouse size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No inventory items found</p>
                </td></tr>
              ) : items.map((item, i) => (
                <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="border-b border-nexus-border hover:bg-nexus-surface dark:hover:bg-nexus-hover/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {item.image_url && (
                        <img src={item.image_url} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0 bg-nexus-surface" />
                      )}
                      <span className="font-medium text-nexus-heading max-w-[180px] truncate">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="font-mono text-xs text-nexus-textSecondary">{item.sku || '—'}</span></td>
                  <td className="px-4 py-3"><span className="text-xs text-nexus-textSecondary">{item.category_name || '—'}</span></td>
                  <td className="px-4 py-3">
                    <span className={`font-bold text-sm ${item.quantity_on_hand === 0 ? 'text-nexus-error' : item.quantity_on_hand <= item.reorder_level ? 'text-nexus-gold' : 'text-nexus-heading'}`}>
                      {item.quantity_on_hand}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-nexus-textSecondary">{item.quantity_reserved || 0}</td>
                  <td className="px-4 py-3 font-semibold text-nexus-success dark:text-nexus-success text-sm">{item.quantity_available}</td>
                  <td className="px-4 py-3 text-xs text-nexus-textSecondary">{item.reorder_level}</td>
                  <td className="px-4 py-3 text-xs text-nexus-textSecondary max-w-[100px] truncate">{item.supplier_name || '—'}</td>
                  <td className="px-4 py-3"><StockBadge status={item.stock_status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setStockModal({ product: item, action: 'add' })} title="Add Stock"
                        className="p-1.5 rounded-lg text-nexus-success hover:bg-nexus-success/10 dark:hover:bg-nexus-success/10 transition-colors">
                        <ArrowUp size={13} />
                      </button>
                      <button onClick={() => setStockModal({ product: item, action: 'remove' })} title="Remove Stock"
                        className="p-1.5 rounded-lg text-nexus-error hover:bg-nexus-error/5 dark:hover:bg-nexus-error/10 transition-colors">
                        <ArrowDown size={13} />
                      </button>
                      <button onClick={() => setStockModal({ product: item, action: 'adjust' })} title="Adjust Stock"
                        className="p-1.5 rounded-lg text-nexus-info hover:bg-nexus-info/10 dark:hover:bg-nexus-info/10 transition-colors">
                        <Edit3 size={13} />
                      </button>
                      <button onClick={() => setHistoryDrawer(item)} title="View History"
                        className="p-1.5 rounded-lg text-nexus-textSecondary hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors">
                        <History size={13} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-nexus-border">
            <p className="text-xs text-nexus-textSecondary">Page {meta.page} of {meta.totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={meta.page <= 1}
                className="px-3 py-1.5 rounded-lg text-xs bg-nexus-surface disabled:opacity-40">Prev</button>
              <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={meta.page >= meta.totalPages}
                className="px-3 py-1.5 rounded-lg text-xs bg-nexus-surface disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {stockModal && (
          <StockActionModal product={stockModal.product} action={stockModal.action}
            onClose={() => setStockModal(null)} onDone={fetchData} />
        )}
        {historyDrawer && (
          <MovementHistoryDrawer product={historyDrawer} onClose={() => setHistoryDrawer(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default InventoryPage;
