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
    in_stock:     { label: 'In Stock',    color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/15' },
    low_stock:    { label: 'Low Stock',   color: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-100 dark:bg-amber-500/15' },
    out_of_stock: { label: 'Out of Stock',color: 'text-red-600 dark:text-red-400',         bg: 'bg-red-100 dark:bg-red-500/15' },
    overstock:    { label: 'Overstock',   color: 'text-blue-600 dark:text-blue-400',       bg: 'bg-blue-100 dark:bg-blue-500/15' }
  }[status] || { label: 'Unknown', color: 'text-slate-500', bg: 'bg-slate-100' };
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
    add:    { title: 'Add Stock',     color: 'bg-emerald-500 hover:bg-emerald-600', icon: ArrowUp },
    remove: { title: 'Remove Stock',  color: 'bg-red-500 hover:bg-red-600',         icon: ArrowDown },
    adjust: { title: 'Adjust Stock',  color: 'bg-blue-500 hover:bg-blue-600',       icon: RotateCcw }
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

  const inputCls = 'w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm border-0 outline-none focus:ring-2 focus:ring-orange-500/40 text-slate-900 dark:text-white';
  const labelCls = 'block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">{cfg.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[220px]">{product.title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><X size={18} /></button>
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
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400">Cancel</button>
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
    purchase:   { color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', label: 'Purchase' },
    sale:       { color: 'text-blue-500',    bg: 'bg-blue-50 dark:bg-blue-500/10',       label: 'Sale' },
    return:     { color: 'text-violet-500',  bg: 'bg-violet-50 dark:bg-violet-500/10',   label: 'Return' },
    damage:     { color: 'text-red-500',     bg: 'bg-red-50 dark:bg-red-500/10',         label: 'Damage' },
    adjustment: { color: 'text-orange-500',  bg: 'bg-orange-50 dark:bg-orange-500/10',   label: 'Adjustment' },
    transfer:   { color: 'text-slate-500',   bg: 'bg-slate-50 dark:bg-slate-800',        label: 'Transfer' }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }}
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 w-full sm:w-96 h-full overflow-y-auto border-l border-slate-200 dark:border-slate-700 shadow-2xl">
        <div className="sticky top-0 bg-white dark:bg-slate-900 p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between z-10">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">Stock History</h2>
            <p className="text-xs text-slate-500 truncate max-w-[220px]">{product?.title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            ))
          ) : movements.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <History size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No movements recorded</p>
            </div>
          ) : movements.map(m => {
            const cfg = movTypeConfig[m.movement_type] || movTypeConfig.adjustment;
            return (
              <div key={m.id} className={`flex items-center gap-3 p-3 rounded-xl ${cfg.bg}`}>
                <div className={`text-xs font-bold ${cfg.color} w-20 flex-shrink-0`}>{cfg.label}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">
                    {m.quantity > 0 ? `+${m.quantity}` : m.quantity} units
                    <span className="text-slate-400 font-normal"> ({m.quantity_before} → {m.quantity_after})</span>
                  </p>
                  <p className="text-xs text-slate-400 truncate">{m.notes || m.suppliers?.name || m.profiles?.full_name || '—'}</p>
                </div>
                <p className="text-xs text-slate-400 flex-shrink-0">{new Date(m.created_at).toLocaleDateString()}</p>
              </div>
            );
          })}
        </div>
        {meta.totalPages > 1 && (
          <div className="flex justify-center gap-2 p-5 border-t border-slate-200 dark:border-slate-700">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 disabled:opacity-40">Prev</button>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= meta.totalPages}
              className="px-3 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 disabled:opacity-40">Next</button>
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
    { label: 'Total Items',    value: meta.total || 0,               icon: Layers,        color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800' },
    { label: 'Low Stock',      value: stats.low_stock || 0,          icon: AlertTriangle, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-500/20' },
    { label: 'Out of Stock',   value: stats.out_of_stock || 0,       icon: TrendingDown,  color: 'text-red-600 dark:text-red-400',     bg: 'bg-red-100 dark:bg-red-500/20' },
    { label: 'Overstock',      value: stats.overstock || 0,          icon: TrendingUp,    color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-100 dark:bg-blue-500/20' },
    { label: 'Stock Value',    value: `KES ${(stats.total_value || 0).toLocaleString()}`, icon: BarChart3, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/20' },
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
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">Inventory Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track stock levels, movements, and reorder alerts</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 hover:text-orange-500 transition-colors">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {(stats.low_stock > 0 || stats.out_of_stock > 0) && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30">
          <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
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
            className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.bg} ${s.color}`}><s.icon size={18} /></div>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">{s.value}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-56">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm border-0 outline-none focus:ring-2 focus:ring-orange-500/40" />
            </div>
            <div className="flex gap-1.5">
              {filterBtns.map(btn => (
                <button key={btn.key} onClick={() => { setFilter(btn.key); setPage(1); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                    filter === btn.key ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}>{btn.label}</button>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-500 whitespace-nowrap">{meta.total || 0} products</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                {['Product', 'SKU', 'Category', 'On Hand', 'Reserved', 'Available', 'Reorder At', 'Supplier', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-800/50">
                    {Array.from({ length: 10 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-16 text-slate-400">
                  <Warehouse size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No inventory items found</p>
                </td></tr>
              ) : items.map((item, i) => (
                <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {item.image_url && (
                        <img src={item.image_url} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0 bg-slate-100" />
                      )}
                      <span className="font-medium text-slate-900 dark:text-white max-w-[180px] truncate">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="font-mono text-xs text-slate-500">{item.sku || '—'}</span></td>
                  <td className="px-4 py-3"><span className="text-xs text-slate-500">{item.category_name || '—'}</span></td>
                  <td className="px-4 py-3">
                    <span className={`font-bold text-sm ${item.quantity_on_hand === 0 ? 'text-red-600' : item.quantity_on_hand <= item.reorder_level ? 'text-amber-600' : 'text-slate-900 dark:text-white'}`}>
                      {item.quantity_on_hand}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{item.quantity_reserved || 0}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400 text-sm">{item.quantity_available}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{item.reorder_level}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 max-w-[100px] truncate">{item.supplier_name || '—'}</td>
                  <td className="px-4 py-3"><StockBadge status={item.stock_status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setStockModal({ product: item, action: 'add' })} title="Add Stock"
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors">
                        <ArrowUp size={13} />
                      </button>
                      <button onClick={() => setStockModal({ product: item, action: 'remove' })} title="Remove Stock"
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                        <ArrowDown size={13} />
                      </button>
                      <button onClick={() => setStockModal({ product: item, action: 'adjust' })} title="Adjust Stock"
                        className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">
                        <Edit3 size={13} />
                      </button>
                      <button onClick={() => setHistoryDrawer(item)} title="View History"
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500">Page {meta.page} of {meta.totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={meta.page <= 1}
                className="px-3 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 disabled:opacity-40">Prev</button>
              <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={meta.page >= meta.totalPages}
                className="px-3 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 disabled:opacity-40">Next</button>
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
