import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dispatchService } from '../../../services/dispatchService';
import { useAuth } from '../../../auth/AuthContext';
import {
  Package, Clock, MapPin, CheckCircle, Navigation, XCircle, AlertTriangle,
  ChevronRight, Phone, User
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  'assigned': 'bg-nexus-gold/10 text-nexus-gold dark:bg-nexus-gold/20 dark:text-nexus-gold',
  'accepted': 'bg-nexus-info/10 text-nexus-info dark:bg-nexus-info/20 dark:text-nexus-info',
  'picked_up': 'bg-info/10 text-info dark:bg-info/100/20 dark:text-info',
  'in_transit': 'bg-info/10 text-info dark:bg-info/100/20 dark:text-info',
  'delivered': 'bg-nexus-success/10 text-nexus-success dark:bg-nexus-success/20 dark:text-nexus-success',
};

const MyDeliveriesPage = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const load = async () => {
      const result = await dispatchService.getDriverDeliveries(user.id);
      if (!cancelled) {
        if (result.success) setDeliveries(result.data);
        setLoading(false);
      }
    };
    load();

    const unsubscribe = dispatchService.subscribeToDispatches(() => load());
    const timer = setInterval(load, 15000);

    return () => { cancelled = true; clearInterval(timer); unsubscribe(); };
  }, [user]);

  const handleAccept = async (dispatchId) => {
    setActionLoading(dispatchId);
    const result = await dispatchService.acceptDelivery(dispatchId, user.id);
    if (result.success) {
      setDeliveries(prev => prev.map(d => d.id === dispatchId ? { ...d, status: 'accepted', driver_accepted_at: new Date().toISOString() } : d));
      toast.success('Delivery accepted');
    } else toast.error(result.data?.error || 'Failed to accept');
    setActionLoading(null);
  };

  const handleReject = async (dispatchId) => {
    if (!rejectReason.trim()) { toast.error('Please provide a reason'); return; }
    setActionLoading(dispatchId);
    const result = await dispatchService.rejectDelivery(dispatchId, user.id, rejectReason);
    if (result.success) {
      setDeliveries(prev => prev.filter(d => d.id !== dispatchId));
      setRejectId(null);
      setRejectReason('');
      toast.success('Delivery returned to queue');
    } else toast.error(result.data?.error || 'Failed to reject');
    setActionLoading(null);
  };

  if (loading) return <div className="p-8 text-center text-nexus-textSecondary">Loading...</div>;

  const pendingAccept = deliveries.filter(d => d.status === 'assigned');
  const active = deliveries.filter(d => ['accepted', 'picked_up', 'in_transit'].includes(d.status));
  const completed = deliveries.filter(d => d.status === 'delivered');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-nexus-heading">My Deliveries</h1>
          <p className="text-sm text-nexus-textSecondary mt-1">{deliveries.length} total deliveries</p>
        </div>
      </div>

      {pendingAccept.length > 0 && (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-nexus-textSecondary mb-3 flex items-center gap-2">
            <Clock size={14} /> Pending Acceptance ({pendingAccept.length})
          </h2>
          <div className="space-y-3">
            {pendingAccept.map(d => (
              <div key={d.id} className="bg-nexus-card rounded-2xl border border-nexus-border p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-nexus-heading flex items-center gap-2">
                      {d.orders?.shipping_name || d.customer_name || 'N/A'}
                    </p>
                    <p className="text-xs text-nexus-textSecondary flex items-center gap-1 mt-0.5">
                      <Phone size={11} /> {d.orders?.shipping_phone || d.customer_phone || 'N/A'}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${STATUS_STYLES['assigned']}`}>New</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-nexus-textSecondary mb-3">
                  <MapPin size={14} className="mt-0.5 shrink-0" />
                  <span>{d.delivery_address}{d.delivery_city ? `, ${d.delivery_city}` : ''}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAccept(d.id)} disabled={actionLoading === d.id} className="flex-1 bg-nexus-success hover:bg-nexus-success disabled:opacity-50 text-white py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
                    {actionLoading === d.id ? <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" /> : <CheckCircle size={14} />}
                    Accept
                  </button>
                  <button onClick={() => setRejectId(rejectId === d.id ? null : d.id)} className="px-4 bg-nexus-error hover:bg-nexus-error text-white py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5">
                    <XCircle size={14} /> Reject
                  </button>
                </div>
                {rejectId === d.id && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Reason for rejection..."
                      className="flex-1 bg-nexus-surface dark:bg-nexus-card/30 border border-nexus-border rounded-lg px-3 py-2 text-xs text-nexus-heading outline-none"
                      autoFocus
                    />
                    <button onClick={() => handleReject(d.id)} disabled={actionLoading === d.id} className="px-3 bg-nexus-error hover:bg-nexus-error disabled:opacity-50 text-white rounded-lg text-xs font-bold">Submit</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {active.length > 0 && (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-nexus-textSecondary mb-3 flex items-center gap-2">
            <Navigation size={14} /> Active ({active.length})
          </h2>
          <div className="space-y-3">
            {active.map(d => (
              <div key={d.id} onClick={() => navigate(`/driver/deliveries/${d.id}`)} className="bg-nexus-card rounded-2xl border border-nexus-border p-4 hover:shadow-md hover:border-nexus-success/30 dark:hover:border-nexus-success/50 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-nexus-success animate-pulse" />
                    <div>
                      <p className="font-bold text-nexus-heading">{d.orders?.shipping_name || d.customer_name}</p>
                      <p className="text-xs text-nexus-textSecondary">{d.orders?.shipping_phone || d.customer_phone}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-nexus-textSecondary" />
                </div>
                <div className="flex items-start gap-2 text-sm text-nexus-textSecondary ml-6">
                  <MapPin size={14} className="mt-0.5 shrink-0" />
                  <span>{d.delivery_address}</span>
                </div>
                <div className="mt-2 ml-6">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_STYLES[d.status] || ''}`}>
                    {d.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-nexus-textSecondary mb-3 flex items-center gap-2">
            <CheckCircle size={14} /> Completed ({completed.length})
          </h2>
          <div className="space-y-2">
            {completed.slice(0, 5).map(d => (
              <div key={d.id} className="bg-white/50 dark:bg-nexus-card rounded-xl border border-nexus-border p-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-nexus-heading">{d.orders?.shipping_name || d.customer_name}</p>
                  <p className="text-xs text-nexus-textSecondary">{d.delivery_address}</p>
                </div>
                <span className="text-xs text-nexus-success font-medium">{d.delivered_at ? new Date(d.delivered_at).toLocaleDateString() : ''}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {deliveries.length === 0 && (
        <div className="bg-nexus-card p-12 rounded-2xl border border-nexus-border text-center">
          <Package size={48} className="mx-auto text-nexus-textSecondary mb-4" />
          <h3 className="text-lg font-bold text-nexus-heading">No deliveries yet</h3>
          <p className="text-nexus-textSecondary text-sm mt-1">You don't have any deliveries assigned.</p>
        </div>
      )}
    </div>
  );
};

export default MyDeliveriesPage;
