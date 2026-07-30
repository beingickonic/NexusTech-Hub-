import { Clock, CheckCircle, Package, Truck, XCircle, RefreshCw } from 'lucide-react';

const OrderStatus = ({ status }) => {
  const configs = {
    pending: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400', icon: Clock, label: 'Pending' },
    confirmed: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400', icon: CheckCircle, label: 'Confirmed' },
    processing: { color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400', icon: Package, label: 'Processing' },
    shipped: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400', icon: Truck, label: 'Shipped' },
    delivered: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400', icon: CheckCircle, label: 'Delivered' },
    cancelled: { color: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400', icon: XCircle, label: 'Cancelled' },
    refunded: { color: 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-nexus-textSecondary', icon: RefreshCw, label: 'Refunded' },
  };

  const config = configs[status] || configs.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
      <Icon size={14} />
      {config.label}
    </span>
  );
};

export default OrderStatus;
