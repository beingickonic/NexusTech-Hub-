import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle2, XCircle, ClipboardCheck, AlertTriangle, Package, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../services/supabaseClient';
import { inventoryService } from '../../services/inventoryService';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dateFormatter';

const InventoryApprovalsPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionOrder, setActionOrder] = useState(null);
  const [actionType, setActionType] = useState('approve');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const { success, data } = await inventoryService.getOrdersAwaitingInventoryApproval();
      if (success) setOrders(data || []);
    } catch (error) {
      console.error('Failed to fetch inventory approvals:', error);
      toast.error(error.message || 'Failed to load pending orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    const channel = supabase.channel('inventory-approvals-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: 'status=in.(Finance Approved,Waiting for Stock)'
      }, () => fetchOrders())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchOrders]);

  const openAction = (order, type) => {
    setActionOrder(order);
    setActionType(type);
    setNotes('');
  };

  const handleSubmit = async () => {
    if (!actionOrder) return;
    if (actionType === 'reject' && !notes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const result = actionType === 'approve'
        ? await inventoryService.inventoryApproveOrder(actionOrder.id, user.id, notes)
        : await inventoryService.inventoryRejectOrder(actionOrder.id, user.id, notes);

      const payload = result.data || {};
      if (actionType === 'approve') {
        if (payload.inventory_status === 'waiting') {
          toast.success(`Reserved what we could — ${(payload.low_stock_items || []).length} item(s) need restocking`);
        } else {
          toast.success(`Order ${actionOrder.order_number || actionOrder.id} approved & stock reserved`);
        }
      } else {
        toast.success(`Order ${actionOrder.order_number || actionOrder.id} rejected`);
      }
      setActionOrder(null);
      setNotes('');
      fetchOrders();
    } catch (error) {
      console.error('Action failed:', error);
      toast.error(error.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const q = searchTerm.toLowerCase();
    return !q ||
      order.order_number?.toLowerCase().includes(q) ||
      order.profiles?.full_name?.toLowerCase().includes(q) ||
      order.profiles?.phone?.includes(q);
  });

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-nexus-heading">Order Approvals</h1>
          <p className="text-sm text-nexus-textSecondary">Approve finance-cleared orders to reserve inventory.</p>
        </div>
        <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-nexus-primary/10 text-nexus-primary dark:bg-nexus-primary/20">
          {orders.length} awaiting approval
        </span>
      </div>

      <div className="bg-white dark:bg-nexus-bg border border-nexus-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-nexus-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-nexus-surface dark:bg-nexus-hover">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-textSecondary" size={18} />
            <input
              type="text"
              placeholder="Search by Order # or Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-nexus-bg border border-nexus-border rounded-xl text-sm focus:outline-none focus:border-nexus-primary transition-colors"
            />
          </div>
          <span className="text-sm text-nexus-textSecondary">
            {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nexus-primary"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 text-nexus-textSecondary">
            <ClipboardCheck size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium">No orders awaiting approval</p>
            <p className="text-sm mt-1">Orders appear here after finance marks them approved.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-nexus-surface dark:bg-nexus-hover text-nexus-textSecondary">
                <tr>
                  <th className="px-6 py-4 font-medium">Order Number</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Items</th>
                  <th className="px-6 py-4 font-medium">Total</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nexus-border dark:divide-nexus-card">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors align-top">
                    <td className="px-6 py-4">
                      <span className="font-medium text-nexus-heading">{order.order_number || `#ORD-${order.id}`}</span>
                      <div className="text-xs mt-1">
                        {order.status === 'Waiting for Stock' ? (
                          <span className="px-2 py-0.5 rounded-full bg-nexus-gold/10 text-nexus-gold dark:bg-nexus-gold/20 font-medium">
                            Waiting for Stock
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-nexus-success/10 text-nexus-success dark:bg-nexus-success/20 font-medium">
                            Finance Approved
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-nexus-muted">
                      {order.profiles?.full_name || 'Unknown'}
                      {order.profiles?.phone && (
                        <div className="text-xs text-nexus-textSecondary">{order.profiles.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-nexus-muted">
                        <Package size={14} className="text-nexus-textSecondary shrink-0" />
                        <span>{(order.items || []).length} item{(order.items || []).length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="text-xs text-nexus-textSecondary mt-1 max-w-xs truncate">
                        {(order.items || []).slice(0, 3).map(i => i.title).join(', ')}
                        {(order.items || []).length > 3 ? '…' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-nexus-heading">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-6 py-4 text-nexus-textSecondary text-xs">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => openAction(order, 'approve')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-nexus-success/10 text-nexus-success hover:bg-nexus-success/20 transition-colors"
                      >
                        <CheckCircle2 size={14} /> {order.status === 'Waiting for Stock' ? 'Retry Reserve' : 'Approve'}
                      </button>
                      <button
                        onClick={() => openAction(order, 'reject')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-nexus-error/10 text-nexus-error hover:bg-nexus-error/20 transition-colors ml-2"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {actionOrder && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => !submitting && setActionOrder(null)}
          >
            <motion.div
              className="bg-white dark:bg-nexus-card w-full max-w-md rounded-2xl shadow-xl"
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-nexus-border">
                <h3 className="text-lg font-semibold text-nexus-heading">
                  {actionType === 'approve' ? 'Approve Order' : 'Reject Order'}
                </h3>
                <button onClick={() => !submitting && setActionOrder(null)} className="text-nexus-textSecondary hover:text-nexus-heading">
                  <X size={18} />
                </button>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <p className="text-sm font-medium text-nexus-heading">
                    {actionOrder.order_number || `#ORD-${actionOrder.id}`}
                  </p>
                  <p className="text-xs text-nexus-textSecondary mt-0.5">
                    {actionOrder.profiles?.full_name || 'Unknown'} • {formatCurrency(actionOrder.total_amount)}
                  </p>
                </div>
                {actionType === 'approve' && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-info/10 text-info text-xs">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <span>
                      {actionOrder.status === 'Waiting for Stock'
                        ? 'Stock has arrived. This will reserve inventory for the order and move it to the dispatch queue.'
                        : 'Stock will be reserved for this order (deducted from available quantity). If stock is low, the order will be marked <strong>Waiting for Stock</strong>.'}
                    </span>
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-nexus-textSecondary">
                    Notes {actionType === 'reject' && <span className="text-nexus-error">*</span>}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder={actionType === 'reject' ? 'Reason for rejection (required)' : 'Optional note'}
                    className="mt-1 w-full px-3 py-2 bg-white dark:bg-nexus-bg border border-nexus-border rounded-xl text-sm focus:outline-none focus:border-nexus-primary transition-colors resize-none"
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-nexus-border flex justify-end gap-3">
                <button
                  onClick={() => setActionOrder(null)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-nexus-surface text-nexus-text border border-nexus-border hover:bg-nexus-hover disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className={`px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50 transition-colors ${
                    actionType === 'approve'
                      ? 'bg-nexus-success hover:bg-nexus-success/90'
                      : 'bg-nexus-error hover:bg-nexus-error/90'
                  }`}
                >
                  {submitting ? 'Processing...' : actionType === 'approve' ? (actionOrder.status === 'Waiting for Stock' ? 'Retry Reserve' : 'Approve & Reserve') : 'Reject Order'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InventoryApprovalsPage;
