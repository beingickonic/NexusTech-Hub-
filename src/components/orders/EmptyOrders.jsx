import { PackageX } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyOrders = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-slate-200 dark:border-nexus-border">
      <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-nexus-textSecondary mb-6">
        <PackageX size={48} />
      </div>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No orders yet</h3>
      <p className="text-nexus-textSecondary dark:text-nexus-textSecondary max-w-md mb-8">
        Looks like you haven't made your first purchase yet. Browse our premium collection and find something you'll love!
      </p>
      <Link 
        to="/products"
        className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-xl transition-colors shadow-lg shadow-orange-500/30"
      >
        Start Shopping
      </Link>
    </div>
  );
};

export default EmptyOrders;
