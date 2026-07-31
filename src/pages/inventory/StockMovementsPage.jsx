import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ArrowRightLeft, ArrowUpRight, ArrowDownRight, Package, Calendar } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { inventoryService } from '../../services/inventoryService';

const StockMovementsPage = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchMovements() {
      setLoading(true);
      try {
        const { success, data } = await inventoryService.getAllStockMovements({ limit: 50 });
        if (success) {
          const mapped = data.map(m => ({
            id: m.id,
            date: m.created_at,
            product: m.inventory?.products?.title || 'Unknown Product',
            sku: m.inventory?.products?.sku || 'N/A',
            type: (m.movement_type || 'adjustment').toLowerCase(),
            change: m.quantity || 0,
            reason: m.reason || 'No reason provided',
            user: m.profiles?.full_name || 'System',
            warehouse: 'Main Warehouse' // Assuming Main Warehouse for now if not joined
          }));
          setMovements(mapped);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchMovements();
  }, []);

  const filteredMovements = movements.filter(m => 
    m.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMovementIcon = (type) => {
    switch (type) {
      case 'purchase': return <ArrowUpRight className="text-nexus-success" size={18} />;
      case 'sale': return <ArrowDownRight className="text-nexus-error" size={18} />;
      case 'transfer': return <ArrowRightLeft className="text-nexus-info" size={18} />;
      case 'return': return <ArrowUpRight className="text-primary" size={18} />;
      case 'damage': return <ArrowDownRight className="text-nexus-primary" size={18} />;
      case 'adjustment': return <ArrowRightLeft className="text-nexus-textSecondary" size={18} />;
      default: return <Package className="text-nexus-textSecondary" size={18} />;
    }
  };

  const getMovementColor = (type) => {
    switch (type) {
      case 'purchase': return 'bg-nexus-success/10 text-nexus-success dark:bg-nexus-success/20 dark:text-nexus-success';
      case 'sale': return 'bg-nexus-error/10 text-nexus-error dark:bg-nexus-error/20 dark:text-nexus-error';
      case 'transfer': return 'bg-nexus-info/10 text-nexus-info dark:bg-nexus-info/20 dark:text-nexus-info';
      case 'return': return 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary';
      case 'damage': return 'bg-nexus-primary/15 text-nexus-primary dark:bg-nexus-primary/20 dark:text-nexus-primary';
      case 'adjustment': return 'bg-nexus-surface text-nexus-heading dark:bg-nexus-muted/20 dark:text-nexus-textSecondary';
      default: return 'bg-nexus-surface text-nexus-heading dark:bg-nexus-muted/20 dark:text-nexus-textSecondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-nexus-heading">Stock Movement History</h1>
          <p className="text-nexus-textSecondary text-sm mt-1">Audit log of all inventory changes across warehouses</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 bg-nexus-surface dark:bg-nexus-hover hover:bg-nexus-surface dark:hover:bg-nexus-hover text-nexus-heading px-4 py-2.5 rounded-xl font-medium text-sm transition-colors border border-nexus-border">
            <Calendar size={18} /> Date Range
          </button>
        </div>
      </div>

      <div className="bg-nexus-card rounded-2xl border border-nexus-border shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-nexus-border flex flex-col sm:flex-row gap-4 items-center justify-between bg-nexus-surface/50 dark:bg-white/[0.02]">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-textSecondary" size={20} />
            <input 
              type="text" 
              placeholder="Search product, SKU, or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-nexus-bg border border-nexus-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-nexus-heading placeholder-nexus-muted"
            />
          </div>
          <button className="inline-flex items-center gap-2 bg-white dark:bg-nexus-hover border border-nexus-border px-4 py-2 rounded-xl text-sm font-medium text-nexus-muted hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors">
            <Filter size={18} /> Filters
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-nexus-surface dark:bg-white/[0.02] border-b border-nexus-border">
                <th className="px-6 py-4 text-xs font-semibold text-nexus-muted uppercase tracking-wider">Date & ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-nexus-muted uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-semibold text-nexus-muted uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-nexus-muted uppercase tracking-wider">Qty Change</th>
                <th className="px-6 py-4 text-xs font-semibold text-nexus-muted uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nexus-border dark:divide-white/10">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-8 w-24 bg-nexus-surface dark:bg-nexus-hover rounded-lg animate-pulse"></div></td>
                    <td className="px-6 py-4"><div className="h-8 w-48 bg-nexus-surface dark:bg-nexus-hover rounded-lg animate-pulse"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-20 bg-nexus-surface dark:bg-nexus-hover rounded-lg animate-pulse"></div></td>
                    <td className="px-6 py-4"><div className="h-8 w-24 bg-nexus-surface dark:bg-nexus-hover rounded-lg animate-pulse"></div></td>
                    <td className="px-6 py-4"><div className="h-8 w-32 bg-nexus-surface dark:bg-nexus-hover rounded-lg animate-pulse"></div></td>
                  </tr>
                ))
              ) : filteredMovements.length > 0 ? (
                filteredMovements.map((movement) => (
                  <motion.tr 
                    key={movement.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-nexus-surface/50 dark:hover:bg-nexus-hover/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-nexus-heading">
                        {new Date(movement.date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-nexus-textSecondary font-mono mt-0.5">{movement.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-nexus-heading">{movement.product}</p>
                      <p className="text-xs font-mono text-nexus-textSecondary mt-0.5">{movement.sku}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold capitalize ${getMovementColor(movement.type)}`}>
                        {getMovementIcon(movement.type)}
                        {movement.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold px-2.5 py-1 rounded-md ${
                          movement.change > 0 ? 'bg-nexus-success/10 text-nexus-success dark:bg-nexus-success/20 dark:text-nexus-success' : 
                          movement.change < 0 ? 'bg-nexus-error/10 text-nexus-error dark:bg-nexus-error/20 dark:text-nexus-error' :
                          'bg-nexus-surface text-nexus-heading dark:bg-nexus-muted/20 dark:text-nexus-textSecondary'
                        }`}>
                          {movement.change > 0 ? '+' : ''}{movement.change}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-nexus-heading line-clamp-1">{movement.reason}</p>
                      <p className="text-xs text-nexus-textSecondary mt-0.5">By {movement.user} • {movement.warehouse}</p>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-nexus-textSecondary">
                    <Package size={48} className="mx-auto text-nexus-textSecondary dark:text-nexus-muted mb-3" />
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
