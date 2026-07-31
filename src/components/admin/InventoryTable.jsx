import { useState, useEffect } from 'react';
import { Search, Filter, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminService } from '../../services/adminService';

const InventoryTable = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [inventory, setInventory] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchInventory = async (currentPage = 1, searchQuery = search, currentFilter = filter) => {
    try {
      setIsLoading(true);
      const response = await adminService.getInventory({ page: currentPage, search: searchQuery, filter: currentFilter });
      if (response.status === 'success') {
        setInventory(response.data);
        if (response.meta) setMeta(response.meta);
      }
    } catch (error) {
      console.error("Failed to fetch inventory", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchInventory(1, search, filter);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, filter]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= meta.totalPages) {
      fetchInventory(newPage, search, filter);
    }
  };

  const handleAdjustStock = async (id, currentStock, adjustment) => {
    const newStock = Math.max(0, currentStock + adjustment);
    if (newStock === currentStock) return;
    
    try {
      await adminService.updateStock(id, newStock);
      // Update local state to avoid full refetch
      setInventory(prev => prev.map(item => {
        if (item.id === id) {
          const updatedStock = newStock;
          let status = 'in_stock';
          if (updatedStock === 0) status = 'out_of_stock';
          else if (updatedStock <= 10) status = 'low_stock';
          return { ...item, stock: updatedStock, status };
        }
        return item;
      }));
    } catch (error) {
      console.error("Failed to adjust stock", error);
    }
  };

  return (
    <div className="bg-white/80 dark:bg-nexus-card/80 backdrop-blur-md rounded-2xl border border-nexus-border shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 md:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-nexus-border">
        <div className="relative w-full sm:max-w-md flex items-center">
          <input 
            type="text" 
            placeholder="Search by SKU or Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-nexus-surface border border-nexus-border rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-nexus-primary/50 outline-none transition-all placeholder:text-nexus-textSecondary text-nexus-heading"
          />
          <Search size={18} className="absolute left-3 text-nexus-textSecondary" />
        </div>
        
        <div className="flex w-full sm:w-auto items-center gap-3">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex items-center justify-center px-4 py-2.5 bg-nexus-surface text-nexus-text rounded-lg text-sm font-medium border border-nexus-border dark:border-nexus-border outline-none"
          >
            <option value="all">All Items</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
          <button onClick={() => fetchInventory(meta.page, search, filter)} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-nexus-surface hover:bg-nexus-surface dark:hover:bg-nexus-hover text-nexus-text rounded-lg text-sm font-medium transition-colors border border-nexus-border dark:border-nexus-border w-full sm:w-auto" title="Sync with warehouse">
            <RefreshCw size={16} /> Sync
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-nexus-surface/50 text-nexus-muted text-xs uppercase tracking-wider font-semibold border-b border-nexus-border">
              <th className="px-6 py-4">SKU</th>
              <th className="px-6 py-4">Product Name</th>
              <th className="px-6 py-4">Current Stock</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Adjust Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nexus-border dark:divide-nexus-card/50 text-sm">
            {isLoading ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-nexus-textSecondary">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nexus-primary"></div>
                  </div>
                </td>
              </tr>
            ) : inventory.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-nexus-muted">
                  No inventory records found.
                </td>
              </tr>
            ) : (
              inventory.map((item) => (
                <tr key={item.id} className="hover:bg-nexus-surface/50 dark:hover:bg-nexus-hover/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-nexus-heading">
                    {item.sku}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-nexus-heading line-clamp-1">{item.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-bold text-lg ${parseInt(item.stock) === 0 ? 'text-nexus-error' : parseInt(item.stock) <= 10 ? 'text-nexus-primary' : 'text-nexus-heading'}`}>
                      {item.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      item.status === 'in_stock'
                        ? 'bg-nexus-success/5 text-nexus-success border-nexus-success/20 dark:bg-nexus-success/10 dark:text-nexus-success dark:border-nexus-success/20'
                        : item.status === 'low_stock'
                        ? 'bg-nexus-primary/10 text-nexus-primary border-nexus-primary/20 dark:bg-nexus-primary/10 dark:text-nexus-primary dark:border-nexus-primary/20'
                        : 'bg-nexus-error/5 text-nexus-error border-nexus-error/20 dark:bg-nexus-error/10 dark:text-nexus-error dark:border-nexus-error/20'
                    }`}>
                      {item.status === 'out_of_stock' && <AlertCircle size={12} />}
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleAdjustStock(item.id, parseInt(item.stock), 1)} className="flex items-center gap-1 px-3 py-1.5 text-nexus-muted hover:text-nexus-success dark:hover:text-nexus-success bg-nexus-surface hover:bg-nexus-success/5 dark:hover:bg-nexus-success/10 rounded-lg transition-colors border border-nexus-border dark:border-nexus-border hover:border-nexus-success/20 dark:hover:border-nexus-success/30">
                        +1
                      </button>
                      <button onClick={() => handleAdjustStock(item.id, parseInt(item.stock), -1)} className="flex items-center gap-1 px-3 py-1.5 text-nexus-muted hover:text-nexus-error dark:hover:text-nexus-error bg-nexus-surface hover:bg-nexus-error/5 dark:hover:bg-nexus-error/10 rounded-lg transition-colors border border-nexus-border dark:border-nexus-border hover:border-nexus-error/20 dark:hover:border-nexus-error/30">
                        -1
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 border-t border-nexus-border flex items-center justify-between text-sm text-nexus-muted">
        <div>Showing page {meta.page} of {meta.totalPages || 1} ({meta.total} total items)</div>
        <div className="flex gap-2">
          <button 
            onClick={() => handlePageChange(meta.page - 1)}
            disabled={meta.page === 1}
            className="p-1.5 rounded-md hover:bg-nexus-surface dark:hover:bg-nexus-hover disabled:opacity-50 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={() => handlePageChange(meta.page + 1)}
            disabled={meta.page >= meta.totalPages}
            className="p-1.5 rounded-md hover:bg-nexus-surface dark:hover:bg-nexus-hover disabled:opacity-50 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryTable;
