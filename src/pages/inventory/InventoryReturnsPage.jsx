import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRightLeft, Search, Filter, Plus, FileText, CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw, Eye, X
} from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-500/15', icon: Clock },
  approved: { label: 'Approved', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-500/15', icon: CheckCircle },
  received: { label: 'Received', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/15', icon: ArrowRightLeft },
  rejected: { label: 'Rejected', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-500/15', icon: XCircle }
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

const InventoryReturnsPage = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Dummy data fallback if service doesn't have getReturns implemented yet
  const [dummyData, setDummyData] = useState([
    { id: 'RET-001', order_id: 'ORD-1045', customer: 'Acme Corp', product: 'Office Chair', quantity: 2, reason: 'Damaged in transit', status: 'pending', date: '2026-07-29' },
    { id: 'RET-002', order_id: 'ORD-1022', customer: 'Jane Doe', product: 'Ergonomic Keyboard', quantity: 1, reason: 'Wrong item shipped', status: 'approved', date: '2026-07-28' },
    { id: 'RET-003', order_id: 'ORD-0998', customer: 'Tech Solutions', product: 'Monitor Stand', quantity: 5, reason: 'Defective batch', status: 'received', date: '2026-07-25' },
    { id: 'RET-004', order_id: 'ORD-1011', customer: 'Global Imports', product: 'Wireless Mouse', quantity: 1, reason: 'Customer changed mind', status: 'rejected', date: '2026-07-27' },
  ]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // In a full implementation, we'd call inventoryService.getReturns()
      // For now, simulating API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setReturns(dummyData);
    } catch (err) {
      toast.error('Failed to load returns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredReturns = returns.filter(ret => 
    (activeFilter === 'all' || ret.status === activeFilter) &&
    (search === '' || 
     ret.id.toLowerCase().includes(search.toLowerCase()) || 
     ret.customer.toLowerCase().includes(search.toLowerCase()) ||
     ret.order_id.toLowerCase().includes(search.toLowerCase()) ||
     ret.product.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="space-y-6 max-w-6xl animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Returns & RMAs</h1>
          <p className="text-nexus-textSecondary text-sm mt-1">Manage customer returns and returned merchandise authorizations</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-nexus-border text-slate-600 dark:text-nexus-textSecondary hover:text-primary transition-colors">
            <RefreshCw size={16} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-orange-600 text-white text-sm font-semibold transition-colors shadow-lg shadow-primary/25">
            <Plus size={16} /> Process Return
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-textSecondary" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ID, customer, order, or product..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-nexus-border text-sm outline-none focus:ring-2 focus:ring-primary/40 text-slate-900 dark:text-white" 
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          {[['all', 'All Returns'], ['pending', 'Pending'], ['approved', 'Approved'], ['received', 'Received'], ['rejected', 'Rejected']].map(([key, label]) => (
            <button 
              key={key} 
              onClick={() => setActiveFilter(key)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                activeFilter === key 
                  ? 'bg-primary text-white' 
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-nexus-border text-slate-600 dark:text-nexus-textSecondary hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-nexus-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-nexus-border bg-slate-50/50 dark:bg-white/[0.02]">
                <th className="text-left px-5 py-4 text-xs font-semibold uppercase tracking-wider text-nexus-textSecondary">RMA ID</th>
                <th className="text-left px-5 py-4 text-xs font-semibold uppercase tracking-wider text-nexus-textSecondary">Order / Customer</th>
                <th className="text-left px-5 py-4 text-xs font-semibold uppercase tracking-wider text-nexus-textSecondary">Product Details</th>
                <th className="text-left px-5 py-4 text-xs font-semibold uppercase tracking-wider text-nexus-textSecondary">Status</th>
                <th className="text-left px-5 py-4 text-xs font-semibold uppercase tracking-wider text-nexus-textSecondary">Date</th>
                <th className="text-right px-5 py-4 text-xs font-semibold uppercase tracking-wider text-nexus-textSecondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-nexus-border">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-nexus-textSecondary">
                    <ArrowRightLeft size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="font-medium text-slate-600 dark:text-slate-400">No returns found</p>
                    <p className="text-xs mt-1">Adjust your search or filters to see more results</p>
                  </td>
                </tr>
              ) : (
                filteredReturns.map((ret, i) => (
                  <motion.tr 
                    key={ret.id} 
                    initial={{ opacity: 0, y: 4 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-slate-100 dark:border-nexus-border hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">{ret.id}</span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{ret.customer}</p>
                      <p className="text-xs text-nexus-textSecondary">{ret.order_id}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900 dark:text-white text-sm">{ret.product}</p>
                      <p className="text-xs text-nexus-textSecondary truncate max-w-[200px]">
                        Qty: {ret.quantity} • {ret.reason}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={ret.status} />
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs text-slate-600 dark:text-nexus-textSecondary">{ret.date}</p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button title="View Details" className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">
                          <Eye size={16} />
                        </button>
                        {ret.status === 'pending' && (
                          <button title="Approve Return" className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors">
                            <CheckCircle size={16} />
                          </button>
                        )}
                        {ret.status === 'approved' && (
                          <button title="Mark Received" className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors">
                            <ArrowRightLeft size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryReturnsPage;
