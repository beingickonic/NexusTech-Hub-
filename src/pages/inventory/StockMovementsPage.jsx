import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ArrowRightLeft, ArrowUpRight, ArrowDownRight, Package, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const StockMovementsPage = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMovements();
  }, []);

  async function fetchMovements() {
    setLoading(true);
    // Simulating API fetch
    setTimeout(() => {
      setMovements([
        {
          id: 'MOV-1004',
          date: new Date().toISOString(),
          product: 'Dell XPS 15',
          sku: 'LPT-DELL-XPS15',
          type: 'purchase',
          previousQty: 25,
          newQty: 45,
          change: 20,
          reason: 'PO-2023-085 Received',
          user: 'Derrick (Admin)',
          warehouse: 'Main WH (Nairobi)'
        },
        {
          id: 'MOV-1003',
          date: new Date(Date.now() - 3600000).toISOString(),
          product: 'Samsung Galaxy S23 Ultra',
          sku: 'MOB-SAM-S23U',
          type: 'sale',
          previousQty: 122,
          newQty: 120,
          change: -2,
          reason: 'Order #ORD-8492 Dispatch',
          user: 'System',
          warehouse: 'Main WH (Nairobi)'
        },
        {
          id: 'MOV-1002',
          date: new Date(Date.now() - 86400000).toISOString(),
          product: 'Herman Miller Aeron',
          sku: 'FURN-HM-AER',
          type: 'adjustment',
          previousQty: 16,
          newQty: 15,
          change: -1,
          reason: 'Stock Count Correction',
          user: 'Inventory Officer',
          warehouse: 'Mombasa Depot'
        },
        {
          id: 'MOV-1001',
          date: new Date(Date.now() - 172800000).toISOString(),
          product: 'Logitech MX Master 3S',
          sku: 'ACC-LOG-MX3S',
          type: 'transfer',
          previousQty: 25,
          newQty: 5,
          change: -20,
          reason: 'Transfer to Mombasa Depot',
          user: 'Inventory Officer',
          warehouse: 'Main WH (Nairobi)'
        }
      ]);
      setLoading(false);
    }, 800);
  };

  const filteredMovements = movements.filter(m => 
    m.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMovementIcon = (type) => {
    switch (type) {
      case 'purchase': return <ArrowUpRight className="text-emerald-500" size={18} />;
      case 'sale': return <ArrowDownRight className="text-red-500" size={18} />;
      case 'transfer': return <ArrowRightLeft className="text-blue-500" size={18} />;
      case 'return': return <ArrowUpRight className="text-violet-500" size={18} />;
      case 'damage': return <ArrowDownRight className="text-orange-500" size={18} />;
      case 'adjustment': return <ArrowRightLeft className="text-slate-500" size={18} />;
      default: return <Package className="text-slate-500" size={18} />;
    }
  };

  const getMovementColor = (type) => {
    switch (type) {
      case 'purchase': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400';
      case 'sale': return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400';
      case 'transfer': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
      case 'return': return 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400';
      case 'damage': return 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400';
      case 'adjustment': return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Stock Movement History</h1>
          <p className="text-slate-500 text-sm mt-1">Audit log of all inventory changes across warehouses</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors border border-slate-200 dark:border-white/10">
            <Calendar size={18} /> Date Range
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search product, SKU, or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>
          <button className="inline-flex items-center gap-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors">
            <Filter size={18} /> Filters
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date & ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Qty Change</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-8 w-24 bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse"></div></td>
                    <td className="px-6 py-4"><div className="h-8 w-48 bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-20 bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse"></div></td>
                    <td className="px-6 py-4"><div className="h-8 w-24 bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse"></div></td>
                    <td className="px-6 py-4"><div className="h-8 w-32 bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse"></div></td>
                  </tr>
                ))
              ) : filteredMovements.length > 0 ? (
                filteredMovements.map((movement) => (
                  <motion.tr 
                    key={movement.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {new Date(movement.date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{movement.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{movement.product}</p>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">{movement.sku}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold capitalize ${getMovementColor(movement.type)}`}>
                        {getMovementIcon(movement.type)}
                        {movement.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-500 line-through">{movement.previousQty}</span>
                        <ArrowRightLeft size={14} className="text-slate-400" />
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{movement.newQty}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          movement.change > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {movement.change > 0 ? '+' : ''}{movement.change}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-900 dark:text-white line-clamp-1">{movement.reason}</p>
                      <p className="text-xs text-slate-500 mt-0.5">By {movement.user} • {movement.warehouse}</p>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <Package size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-base font-medium">No movements found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockMovementsPage;
