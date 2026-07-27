import InventoryTable from '../../components/admin/InventoryTable';

const InventoryPage = () => {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Inventory Management</h1>
        <p className="text-slate-500 dark:text-slate-400">Track stock levels across all your products and manage replenishments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Stock Value</h3>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">Ksh 4,520,000</p>
        </div>
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl border border-orange-200 dark:border-orange-500/30 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-orange-500"></div>
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Low Stock Alerts</h3>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-500">12 Products</p>
        </div>
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl border border-red-200 dark:border-red-500/30 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-red-500"></div>
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Out of Stock</h3>
          <p className="text-2xl font-bold text-red-600 dark:text-red-500">3 Products</p>
        </div>
      </div>

      <InventoryTable />
    </div>
  );
};

export default InventoryPage;
