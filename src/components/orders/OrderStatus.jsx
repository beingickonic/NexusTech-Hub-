import {
  Clock, CheckCircle, Package, Truck, XCircle, RefreshCw,
  CreditCard, AlertTriangle, PackageCheck, ClipboardList,
  Send, MapPin, Home, Award, ShieldCheck, Search
} from 'lucide-react';

const STATUS_CONFIG = {
  'pending':                       { color: 'bg-nexus-gold/10 text-nexus-gold dark:bg-nexus-gold/20 dark:text-nexus-gold', icon: Clock, label: 'Pending' },
  'awaiting payment':              { color: 'bg-nexus-gold/10 text-nexus-gold dark:bg-nexus-gold/20 dark:text-nexus-gold', icon: Clock, label: 'Awaiting Payment' },
  'paid':                          { color: 'bg-nexus-success/10 text-nexus-success dark:bg-nexus-success/20 dark:text-nexus-success', icon: CreditCard, label: 'Paid' },
  'pending payment verification':  { color: 'bg-nexus-gold/10 text-nexus-gold dark:bg-nexus-gold/20 dark:text-nexus-gold', icon: Clock, label: 'Pending Verification' },
  'payment failed':                { color: 'bg-nexus-error/10 text-nexus-error dark:bg-nexus-error/20 dark:text-nexus-error', icon: XCircle, label: 'Payment Failed' },
  'pending finance approval':      { color: 'bg-info/10 text-info dark:bg-info/100/20 dark:text-info', icon: ShieldCheck, label: 'Pending Finance' },
  'finance approved':              { color: 'bg-nexus-info/10 text-nexus-info dark:bg-nexus-info/20 dark:text-nexus-info', icon: CheckCircle, label: 'Finance Approved' },
  'waiting for stock':             { color: 'bg-nexus-primary/15 text-nexus-primary dark:bg-nexus-primary/20 dark:text-nexus-primary', icon: AlertTriangle, label: 'Waiting for Stock' },
  'reserved':                      { color: 'bg-nexus-info/10 text-nexus-info dark:bg-nexus-info/20 dark:text-nexus-info', icon: CheckCircle, label: 'Reserved' },
  'picking':                       { color: 'bg-info/10 text-info dark:bg-info/100/20 dark:text-info', icon: ClipboardList, label: 'Picking' },
  'packing':                       { color: 'bg-info/10 text-info dark:bg-info/100/20 dark:text-info', icon: PackageCheck, label: 'Packing' },
  'ready for dispatch':            { color: 'bg-info/10 text-info dark:bg-info/100/20 dark:text-info', icon: Send, label: 'Ready for Dispatch' },
  'assigned':                      { color: 'bg-success/10 text-success dark:bg-success/100/20 dark:text-success', icon: Truck, label: 'Assigned' },
  'out for delivery':              { color: 'bg-info/10 text-info dark:bg-info/100/20 dark:text-info', icon: MapPin, label: 'Out for Delivery' },
  'delivered':                     { color: 'bg-nexus-success/10 text-nexus-success dark:bg-nexus-success/20 dark:text-nexus-success', icon: Home, label: 'Delivered' },
  'completed':                     { color: 'bg-nexus-success/10 text-nexus-success dark:bg-nexus-success/20 dark:text-nexus-success', icon: Award, label: 'Completed' },
  'cancelled':                     { color: 'bg-nexus-error/10 text-nexus-error dark:bg-nexus-error/20 dark:text-nexus-error', icon: XCircle, label: 'Cancelled' },
  'refunded':                      { color: 'bg-nexus-surface text-nexus-heading dark:bg-nexus-muted/20 dark:text-nexus-textSecondary', icon: RefreshCw, label: 'Refunded' },
};

const OrderStatus = ({ status }) => {
  const key = (status || '').toLowerCase();
  const config = STATUS_CONFIG[key] || STATUS_CONFIG['pending'];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
      <Icon size={14} />
      {config.label}
    </span>
  );
};

export default OrderStatus;
