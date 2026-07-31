import {
  ShoppingCart, CreditCard, ShieldCheck, Wallet, BadgeCheck, PackageCheck,
  Warehouse, Truck, MapPin, CheckCircle, UserCheck, PartyPopper,
} from 'lucide-react';

export const ORDER_STAGES = [
  { id: 'order placed',       key: ['pending'],                          label: 'Order Placed',       icon: ShoppingCart,  dept: 'Orders',      color: '#FB461D' },
  { id: 'awaiting payment',   key: ['awaiting payment'],                 label: 'Awaiting Payment',   icon: CreditCard,    dept: 'Finance',     color: '#FB461D' },
  { id: 'payment verified',   key: ['paid', 'payment verified', 'pending payment verification'], label: 'Payment Verified', icon: ShieldCheck, dept: 'Finance', color: '#FB461D' },
  { id: 'finance review',     key: ['pending finance approval'],         label: 'Finance Review',     icon: Wallet,        dept: 'Finance',     color: '#FB461D' },
  { id: 'finance approved',   key: ['finance approved'],                 label: 'Finance Approved',   icon: BadgeCheck,    dept: 'Finance',     color: '#FB461D' },
  { id: 'inventory reserved', key: ['reserved', 'stock reserved', 'ready for picking', 'picking', 'packing', 'inventory reserved', 'inventory approved'], label: 'Inventory Reserved', icon: PackageCheck, dept: 'Inventory', color: '#F7A321' },
  { id: 'ready for dispatch', key: ['ready for dispatch'],               label: 'Ready for Dispatch', icon: Warehouse,     dept: 'Dispatch',    color: '#F7A321' },
  { id: 'driver assigned',    key: ['assigned'],                         label: 'Driver Assigned',    icon: Truck,         dept: 'Dispatch',    color: '#F7A321' },
  { id: 'out for delivery',   key: ['out for delivery'],                 label: 'Out for Delivery',   icon: MapPin,        dept: 'Dispatch',    color: '#F7A321' },
  { id: 'delivered',          key: ['delivered'],                        label: 'Delivered',          icon: CheckCircle,   dept: 'Delivery',    color: '#FB461D' },
  { id: 'customer confirmed', key: ['delivered'],                        label: 'Customer Confirmed', icon: UserCheck,     dept: 'Customer',    color: '#FB461D' },
  { id: 'completed',          key: ['completed'],                        label: 'Completed',          icon: PartyPopper,   dept: 'NexusTech',   color: '#FB461D' },
];

export const TERMINAL_STATUSES = ['cancelled', 'refunded', 'rejected', 'payment failed'];

/**
 * Resolve where the order currently sits on the journey.
 * Returns an object:
 *  - { index }          normal current stage index (0-based)
 *  - { index: x.5 }     low-stock branch sits between Finance Approved and Inventory Reserved
 *  - -1                 status not found (show all pending)
 *  - -2                 terminal state (cancelled/refunded/rejected/payment failed)
 */
export const getJourneyIndex = (status, order) => {
  const key = (status || '').toLowerCase();
  if (TERMINAL_STATUSES.includes(key)) return -2;
  if (key === 'waiting for stock') {
    return { index: ORDER_STAGES.findIndex(s => s.id === 'inventory reserved') - 0.5, lowStock: true };
  }
  if (key === 'delivered' && order?.delivery_confirmed_at) {
    return ORDER_STAGES.findIndex(s => s.id === 'customer confirmed');
  }
  for (let i = 0; i < ORDER_STAGES.length; i++) {
    if (ORDER_STAGES[i].key.includes(key)) return i;
  }
  return -1;
};

export const isTerminal = (status) => TERMINAL_STATUSES.includes((status || '').toLowerCase());

export const getProgress = (status, order) => {
  const res = getJourneyIndex(status, order);
  if (res === -2 || res === -1) return 0;
  return Math.max(0, Math.min(100, Math.round(((res + 1) / ORDER_STAGES.length) * 100)));
};

export const getCurrentStage = (status, order) => {
  const res = getJourneyIndex(status, order);
  if (res === -2 || res === -1) return null;
  const idx = typeof res === 'number' ? res : res.index;
  return ORDER_STAGES[Math.max(0, Math.floor(idx))];
};

export const getNextStage = (status, order) => {
  const res = getJourneyIndex(status, order);
  if (res === -2 || res === -1) return null;
  const idx = typeof res === 'number' ? res : res.index;
  const next = Math.floor(idx) + 1;
  if (next >= ORDER_STAGES.length) return null;
  return ORDER_STAGES[next];
};

export const estimateDelivery = (order) => {
  if (order?.delivery_confirmed_at) return new Date(order.delivery_confirmed_at);
  if (order?.created_at) {
    const est = new Date(order.created_at);
    est.setDate(est.getDate() + 3);
    return est;
  }
  return null;
};

export const estimateNextEta = (status, order) => {
  const key = (status || '').toLowerCase();
  if (key === 'delivered' || key === 'completed') return null;
  if (key === 'paid' || key === 'pending payment verification' || key === 'pending finance approval') return '~15 minutes';
  if (key === 'finance approved') return '~30 minutes';
  if (key === 'reserved' || key === 'stock reserved') return '~1 hour';
  if (key === 'picking' || key === 'packing') return '~2 hours';
  if (key === 'ready for dispatch') return '~1 hour';
  if (key === 'assigned' || key === 'out for delivery') return '~30 minutes';
  return '~24 hours';
};

export const buildStageLog = (order, statusHistory) => {
  const log = {};
  const set = (stageId, at, user) => {
    if (at && (!log[stageId] || new Date(at) > new Date(log[stageId].at))) {
      log[stageId] = { at, user };
    }
  };

  if (order?.created_at) set('order placed', order.created_at, order.shipping_name || 'Customer');
  if (order?.finance_approved_at) set('finance approved', order.finance_approved_at);
  if (order?.inventory_approved_at) set('inventory reserved', order.inventory_approved_at);
  if (order?.picked_at) set('picking', order.picked_at);
  if (order?.packed_at) set('packing', order.packed_at);
  if (order?.dispatched_at) set('ready for dispatch', order.dispatched_at);
  if (order?.delivery_confirmed_at) set('customer confirmed', order.delivery_confirmed_at);

  (statusHistory || []).forEach(h => {
    const key = (h.to_status || '').toLowerCase();
    const stage = ORDER_STAGES.find(s => s.key.includes(key));
    if (!stage) return;
    const user = Array.isArray(h.profiles) ? h.profiles[0]?.full_name : h.profiles?.full_name;
    set(stage.id, h.changed_at, user || h.changed_by_name);
  });

  return log;
};

export const formatJourneyDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatJourneyTime = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
};
