import React, { useState, useEffect } from 'react';
import { financeService } from '../../services/financeService';
import { ShieldCheck, CheckCircle, XCircle, AlertTriangle, Eye, Clock, DollarSign, User, FileText } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dateFormatter';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { Table, TableRow, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { Card } from '../../components/ui/Card';
import { Textarea } from '../../components/ui/Textarea';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

const ApprovalsPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadPendingApprovals();
  }, []);

  const loadPendingApprovals = async () => {
    setLoading(true);
    const result = await financeService.getPendingApprovals();
    if (result.success) {
      setOrders(result.data);
    }
    setLoading(false);
  };

  const handleApprove = async (orderId) => {
    setActionLoading(true);
    const result = await financeService.approvePayment(orderId, notes);
    if (result.success) {
      setOrders(prev => prev.filter(o => o.id !== orderId));
      setSelectedOrder(null);
      setNotes('');
    }
    setActionLoading(false);
  };

  const handleReject = async (orderId) => {
    if (!notes.trim()) return;
    setActionLoading(true);
    const result = await financeService.rejectPayment(orderId, notes);
    if (result.success) {
      setOrders(prev => prev.filter(o => o.id !== orderId));
      setSelectedOrder(null);
      setNotes('');
    }
    setActionLoading(false);
  };

  const handleInvestigate = async (orderId) => {
    if (!notes.trim()) return;
    setActionLoading(true);
    const result = await financeService.investigatePayment(orderId, notes);
    if (result.success) {
      setOrders(prev => prev.filter(o => o.id !== orderId));
      setSelectedOrder(null);
      setNotes('');
    }
    setActionLoading(false);
  };

  const filteredOrders = orders.filter(o =>
    !search || o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
    o.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    (o.profiles?.email || o.profiles?.phone)?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Payment Approvals"
        subtitle="Review and approve customer payments"
        actions={
          <Button onClick={loadPendingApprovals} variant="secondary" size="sm" className="gap-2">
            <Clock size={16} /> Refresh
          </Button>
        }
      />

      <Card className="p-4" hoverElevation={false}>
        <div className="mb-4">
          <SearchInput
            placeholder="Search by order number or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton variant="rectangular" className="h-10" />
            <Skeleton variant="rectangular" className="h-10" />
            <Skeleton variant="rectangular" className="h-10" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            title="No pending approvals"
            description="All payment approvals have been processed."
            icon={ShieldCheck}
          />
        ) : (
          <Table headers={['Order', 'Customer', 'Amount', 'Payment', 'Date', 'Actions']}>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium text-nexus-heading">
                  {order.order_number || `#${order.id.slice(0, 8)}`}
                </TableCell>
                <TableCell>
                  <div className="font-medium text-nexus-heading">{order.profiles?.full_name || 'N/A'}</div>
                  <div className="text-xs text-nexus-muted">{order.profiles?.email || order.profiles?.phone}</div>
                </TableCell>
                <TableCell className="font-bold text-nexus-heading">
                  {formatCurrency(order.total_amount)}
                </TableCell>
                <TableCell>
                  <Badge variant="info">
                    {order.payment_method || 'N/A'}
                  </Badge>
                </TableCell>
                <TableCell className="text-nexus-muted">
                  {formatDate(order.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    onClick={() => setSelectedOrder(order)}
                    variant="ghost"
                    size="sm"
                    className="p-2"
                  >
                    <Eye size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </Card>

      {/* Drawer details */}
      <Drawer
        isOpen={!!selectedOrder}
        onClose={() => { setSelectedOrder(null); setNotes(''); }}
        title="Payment Review"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div>
              <p className="text-xs text-nexus-muted mb-1">Order Ref</p>
              <p className="font-bold text-nexus-heading">{selectedOrder.order_number || `#${selectedOrder.id.slice(0, 8)}`}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4" hoverElevation={false}>
                <p className="text-xs text-nexus-muted mb-1">Customer</p>
                <p className="font-medium text-nexus-heading flex items-center gap-2">
                  <User size={14} className="text-nexus-muted" />
                  {selectedOrder.profiles?.full_name || 'N/A'}
                </p>
                <p className="text-xs text-nexus-muted mt-1">{selectedOrder.profiles?.email || selectedOrder.profiles?.phone}</p>
              </Card>
              <Card className="p-4" hoverElevation={false}>
                <p className="text-xs text-nexus-muted mb-1">Amount</p>
                <p className="text-lg font-bold text-nexus-primary">{formatCurrency(selectedOrder.total_amount)}</p>
                <p className="text-xs text-nexus-muted mt-1">
                  Method: <span className="uppercase font-medium">{selectedOrder.payment_method || 'N/A'}</span>
                </p>
              </Card>
            </div>

            {(selectedOrder.payments || []).length > 0 && (
              <Card className="p-4" hoverElevation={false}>
                <h4 className="font-semibold text-nexus-heading mb-3 flex items-center gap-2">
                  <DollarSign size={16} className="text-nexus-primary" /> Payment Details
                </h4>
                {selectedOrder.payments.map((p, idx) => (
                  <div key={p.id || idx} className="flex justify-between items-center py-2 border-b border-nexus-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-nexus-heading capitalize">{p.provider}</p>
                      <p className="text-xs text-nexus-muted">Ref: {p.transaction_reference || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatCurrency(p.amount)}</p>
                      <p className="text-xs capitalize"><Badge variant={p.status === 'paid' ? 'success' : 'pending'}>{p.status}</Badge></p>
                    </div>
                  </div>
                ))}
              </Card>
            )}

            <div className="space-y-4">
              <Textarea
                label="Review Notes / Remarks"
                placeholder="Enter approval details, rejection reasons, or investigation notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required
              />

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handleApprove(selectedOrder.id)}
                  disabled={actionLoading}
                  variant="success"
                  className="flex-1"
                >
                  Approve
                </Button>
                <Button
                  onClick={() => handleReject(selectedOrder.id)}
                  disabled={actionLoading || !notes.trim()}
                  variant="danger"
                  className="flex-1"
                >
                  Reject
                </Button>
                <Button
                  onClick={() => handleInvestigate(selectedOrder.id)}
                  disabled={actionLoading || !notes.trim()}
                  variant="secondary"
                  className="flex-1"
                >
                  Investigate
                </Button>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default ApprovalsPage;
