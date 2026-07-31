import { PackageX } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyOrders = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white/50 dark:bg-nexus-card backdrop-blur-sm rounded-3xl border border-nexus-border">
      <div className="w-24 h-24 bg-nexus-surface rounded-full flex items-center justify-center text-nexus-textSecondary mb-6">
        <PackageX size={48} />
      </div>
      <h3 className="text-2xl font-bold text-nexus-heading mb-2">No orders yet</h3>
      <p className="text-nexus-muted max-w-md mb-8">
        Looks like you haven't made your first purchase yet. Browse our premium collection and find something you'll love!
      </p>
      <Link 
        to="/products"
        className="bg-nexus-primary hover:bg-nexus-primary-hover text-white font-semibold py-3 px-8 rounded-xl transition-colors shadow-lg shadow-primary/30"
      >
        Start Shopping
      </Link>
    </div>
  );
};

export default EmptyOrders;
