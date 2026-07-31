import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Download, Printer, MapPin, CreditCard, Truck, Phone, User,
  XCircle, AlertTriangle, Package, Clock, Star, ThumbsUp, CheckCircle, MapPinned, LocateFixed,
} from 'lucide-react';
import orderService from '../../services/orderService';
import { supabase } from '../../services/supabaseClient';
import OrderStatus from '../../components/orders/OrderStatus';
import TrackingTimeline from '../../components/orders/TrackingTimeline';
import { formatCurrency } from '../../utils/currency';
import { getImageUrl } from '../../utils/imageHelper';
import SmartImage from '../../components/SmartImage';
import toast from 'react-hot-toast';
import {
  ORDER_STAGES,
  getCurrentStage,
  getProgress,
  estimateDelivery,
  formatJourneyDate,
  formatJourneyTime,
  isTerminal,
} from '../../utils/orderJourney';

const StatMini = ({ label, value, sub }) => (
  <div className="rounded-xl bg-nexus-surface/60 dark:bg-nexus-card/60 border border-nexus-border/60 p-4">
    <p className="text-[11px] font-bold uppercase tracking-wider text-nexus-muted">{label}</p>
    <p className="text-xl font-extrabold text-nexus-heading mt-1 truncate">{value || '—'}</p>
    {sub && <p className="text-xs text-nexus-textSecondary mt-0.5 truncate">{sub}</p>}
  </div>
);

const ActivityFeed = ({ order, statusHistory }) => {
  const events = [];
  if (order?.created_at) {
    events.push({
      id: 'placed', at: order.created_at,
      label: 'Order Created', dept: 'Orders',
      user: order.shipping_name || 'Customer',
      icon: 'order placed',
    });
  }
  (statusHistory || []).forEach((h, i) => {
    const key = (h.to_status || '').toLowerCase();
    const stage = ORDER_STAGES.find(s => s.key.includes(key));
    const user = Array.isArray(h.profiles) ? h.profiles[0]?.full_name : h.profiles?.full_name;
    events.push({
      id: `h-${i}-${h.changed_at}`, at: h.changed_at,
      label: stage ? stage.label : `Status → ${h.to_status || ''}`,
      dept: stage?.dept || 'NexusTech',
      user: user || h.changed_by_name,
      note: h.note,
      icon: stage ? stage.id : null,
    });
  });
  events.sort((a, b) => new Date(a.at) - new Date(b.at));

  if (events.length === 0) {
    return <p className="text-sm text-nexus-textSecondary">No tracking events recorded yet.</p>;
  }

  return (
    <ol className="relative space-y-0" role="list" aria-label="Activity feed">
      <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-nexus-border/70 dark:bg-nexus-card" aria-hidden="true" />
      {events.map((ev) => {
        const stage = ORDER_STAGES.find(s => s.id === ev.icon);
        const Icon = stage?.icon || CheckCircle;
        return (
          <motion.li
            key={ev.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="relative flex gap-4 pb-5 last:pb-0"
          >
            <div className="relative z-10 w-8 h-8 rounded-full bg-[#FB461D]/10 text-[#FB461D] flex items-center justify-center border border-[#FB461D]/20">
              <Icon size={15} />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
                <p className="text-sm font-semibold text-nexus-heading">{ev.label}</p>
                <p className="text-xs text-nexus-textSecondary whitespace-nowrap">
                  {formatJourneyDate(ev.at)} · {formatJourneyTime(ev.at)}
                </p>
              </div>
              <p className="text-xs text-nexus-textSecondary mt-0.5">
                {ev.dept} department{ev.user ? ` · ${ev.user}` : ''}
              </p>
              {ev.note && <p className="text-xs text-nexus-muted mt-1 italic truncate">"{ev.note}"</p>}
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
};

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusHistory, setStatusHistory] = useState([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmRating, setConfirmRating] = useState(5);
  const [confirmFeedback, setConfirmFeedback] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [loyaltyEarned, setLoyaltyEarned] = useState(0);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await orderService.getOrderDetails(id);
        if (res.success) {
          setOrder(res.data.order);

          const historyRes = await orderService.getStatusHistory(id);
          if (historyRes.success) {
            setStatusHistory(historyRes.data);
          }
        }
      } catch (error) {
        console.error('Error fetching order details', error);
      }
      setLoading(false);
    };
    fetchOrderDetails();
  }, [id]);

  const handleConfirmDelivery = async () => {
    setConfirming(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase.rpc('customer_confirm_delivery', {
        p_order_id: id,
        p_customer_id: user?.id,
        p_rating: confirmRating,
        p_feedback: confirmFeedback || null,
      });
      if (error) throw error;
      if (data?.success) {
        setConfirmed(true);
        setLoyaltyEarned(data.loyalty_points_earned || 0);
        setShowConfirmModal(false);
        toast.success('Delivery confirmed! Thank you for your feedback.');
        const refreshRes = await orderService.getOrderDetails(id);
        if (refreshRes.success) setOrder(refreshRes.data.order);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to confirm delivery');
    }
    setConfirming(false);
  };

  const handleCancelOrder = async () => {
    const res = await orderService.cancelOrder(id, cancelReason);
    if (res.success) {
      setShowCancelModal(false);
      const refreshRes = await orderService.getOrderDetails(id);
      if (refreshRes.success) setOrder(refreshRes.data.order);
    } else {
      alert(res.message || 'Failed to cancel order');
    }
  };

  const handlePrintInvoice = () => {
    const printWindow = window.open('', '_blank');
    const buildInvoiceHtml = () => {
      const html = `
      <html>
        <head>
          <title>Invoice - ${order.order_number}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            h1 { color: #FB461D; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 20px; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .table th, .table td { padding: 12px; border-bottom: 1px solid #eee; text-align: left; }
            .total { font-weight: bold; font-size: 1.2em; text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>NexusTech Hub</h1>
              <p>Order Number: ${order.order_number}</p>
              <p>Date: ${new Date(order.created_at || order.placed_at).toLocaleString('en-KE')}</p>
            </div>
            <div style="text-align: right">
              <h3>INVOICE</h3>
              <p>Status: ${(order.payment_status || 'UNPAID').toUpperCase()}</p>
            </div>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              ${(order.items || []).map(item => `
                <tr>
                  <td>${item.product_name}</td>
                  <td>${item.quantity}</td>
                  <td>KES ${item.line_total}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p class="total">Total: KES ${order.total_amount}</p>
        </body>
      </html>
    `;
      return html;
    };

    const html = buildInvoiceHtml();

    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      return;
    }

    // Capacitor WebView blocks popups (window.open returns null) — print via a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    const iframeDoc = iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => iframe.remove(), 1000);
  };

  const scrollToJourney = () => {
    document.getElementById('order-journey')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex justify-center bg-nexus-surface">
        <div className="w-12 h-12 border-4 border-nexus-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-nexus-surface text-center text-nexus-textSecondary">
        Order not found.
      </div>
    );
  }

  const date = new Date(order.created_at || order.placed_at).toLocaleDateString('en-KE', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const statusKey = (order.status || '').toLowerCase();
  const canCancel = ['pending', 'awaiting payment', 'paid', 'pending payment verification'].includes(statusKey);
  const isPaid = ['paid', 'completed'].includes((order.payment_status || '').toLowerCase());
  const progress = getProgress(statusKey, order);
  const currentStage = getCurrentStage(statusKey, order);
  const estDelivery = estimateDelivery(order);
  const terminal = isTerminal(statusKey);

  const currentLocation =
    statusKey === 'delivered' || statusKey === 'completed' ? `Delivered · ${order.shipping_city || 'destination'}`
    : statusKey === 'out for delivery' || statusKey === 'assigned' ? 'Out for delivery'
    : order.dispatch?.current_location || 'Preparing your order';

  return (
    <div className="min-h-screen pt-32 pb-20 bg-nexus-surface transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-nexus-textSecondary hover:text-nexus-primary mb-4 transition-colors w-max">
            <ArrowLeft size={20} /> Back
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-brand text-white flex items-center justify-center shadow-lg shadow-[#FB461D]/25 shrink-0">
                <Package size={26} />
              </div>
              <div>
                <div className="flex items-center flex-wrap gap-3">
                  <h1 className="text-2xl md:text-3xl font-bold text-nexus-heading">Order {order.order_number}</h1>
                  <OrderStatus status={order.status} />
                </div>
                <p className="text-nexus-muted mt-1.5 flex items-center gap-1.5">
                  <Clock size={14} /> Placed on {date}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={scrollToJourney}
                className="flex items-center gap-2 bg-gradient-brand text-white px-5 py-2.5 rounded-xl transition-opacity hover:opacity-90 font-medium shadow-lg shadow-[#FB461D]/25"
              >
                <LocateFixed size={18} />
                Track Order
              </button>
              <button
                onClick={handlePrintInvoice}
                className="flex items-center gap-2 bg-nexus-card hover:bg-nexus-surface dark:hover:bg-nexus-hover text-nexus-text border border-nexus-border px-5 py-2.5 rounded-xl transition-colors font-medium"
              >
                <Printer size={18} />
                Print Invoice
              </button>
              <button
                onClick={() => isPaid ? navigate(`/payment/invoice/${order.id}`) : handlePrintInvoice()}
                className="flex items-center gap-2 bg-nexus-card hover:bg-nexus-surface dark:hover:bg-nexus-hover text-nexus-text border border-nexus-border px-5 py-2.5 rounded-xl transition-colors font-medium"
              >
                <Download size={18} />
                Download Invoice
              </button>
            </div>
          </div>
        </div>

        {/* Journey card */}
        <div id="order-journey" className="bg-white/80 dark:bg-nexus-card/80 backdrop-blur-md rounded-3xl p-5 md:p-8 mb-8 border border-nexus-border shadow-sm scroll-mt-32">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6">
            <StatMini label="Order Progress" value={`${progress}%`} sub={`${terminal ? '—' : `${Math.max(0, ORDER_STAGES.findIndex(s => s.id === currentStage?.id) + 1)} of ${ORDER_STAGES.length} stages`}`} />
            <StatMini label="Current Stage" value={currentStage?.label || (terminal ? 'Ended' : 'Starting')} sub={currentStage ? `${currentStage.dept} department` : ''} />
            <StatMini label="Estimated Delivery" value={estDelivery ? formatJourneyDate(estDelivery.toISOString()) : '—'} sub={estDelivery ? formatJourneyTime(estDelivery.toISOString()) : ''} />
          </div>
          <TrackingTimeline order={order} statusHistory={statusHistory} />
        </div>

        {/* Activity feed */}
        <div className="bg-white/80 dark:bg-nexus-card/80 backdrop-blur-md rounded-3xl p-6 md:p-8 mb-8 border border-nexus-border shadow-sm">
          <h3 className="text-lg font-bold text-nexus-heading mb-6 flex items-center gap-2">
            <Clock size={20} className="text-[#FB461D]" /> Activity Feed
          </h3>
          <ActivityFeed order={order} statusHistory={statusHistory} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items + summary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/80 dark:bg-nexus-card/80 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-nexus-border shadow-sm">
              <h3 className="text-lg font-bold text-nexus-heading mb-6">Items Ordered</h3>

              <div className="space-y-5">
                {(order.items || []).map(item => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-20 h-20 bg-nexus-surface rounded-xl overflow-hidden flex-shrink-0">
                      <SmartImage src={getImageUrl(item.image_url)} alt={item.product_name} className="w-full h-full bg-transparent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-nexus-heading truncate">{item.product_name}</h4>
                      <p className="text-sm text-nexus-textSecondary mt-1">SKU: {item.sku}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-nexus-textSecondary">
                        <span>Qty: <span className="font-semibold text-nexus-heading">{item.quantity}</span></span>
                        <span>Unit: <span className="font-semibold text-nexus-heading">{formatCurrency(item.price)}</span></span>
                      </div>
                    </div>
                    <div className="font-bold text-nexus-heading text-right whitespace-nowrap">
                      {formatCurrency(item.line_total)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/80 dark:bg-nexus-card/80 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-nexus-border shadow-sm">
              <div className="space-y-4 text-nexus-muted">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-nexus-heading">{formatCurrency(order.subtotal || order.total_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="font-semibold text-nexus-heading">{formatCurrency(order.shipping_fee || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes</span>
                  <span className="font-semibold text-nexus-heading">{formatCurrency(order.tax || 0)}</span>
                </div>
                {order.discount !== undefined && order.discount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span className="font-semibold text-nexus-success">−{formatCurrency(order.discount)}</span>
                  </div>
                )}

                <div className="h-px bg-nexus-surface dark:bg-nexus-card my-4"></div>

                <div className="flex justify-between text-xl">
                  <span className="font-bold text-nexus-heading">Grand Total</span>
                  <span className="font-bold text-[#FB461D]">{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-6">
            <div className="bg-white/80 dark:bg-nexus-card/80 backdrop-blur-md rounded-3xl p-6 border border-nexus-border shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-nexus-heading">
                <MapPin className="text-[#FB461D]" size={22} />
                <h3 className="font-bold text-lg">Shipping Address</h3>
              </div>
              <div className="text-nexus-muted space-y-1">
                <p className="font-semibold text-nexus-heading">{order.shippingName || order.shipping_name}</p>
                <p>{order.shippingAddress || order.shipping_address || order.shipping_addr}</p>
                <p className="flex items-center gap-1.5"><Phone size={13} /> {order.shippingPhone || order.shipping_phone}</p>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-nexus-card/80 backdrop-blur-md rounded-3xl p-6 border border-nexus-border shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-nexus-heading">
                <Truck className="text-[#FB461D]" size={22} />
                <h3 className="font-bold text-lg">Delivery</h3>
              </div>
              <dl className="text-sm space-y-3">
                <div className="flex justify-between gap-3">
                  <dt className="text-nexus-textSecondary">Tracking Number</dt>
                  <dd className="font-semibold text-nexus-heading text-right">{order.order_number}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-nexus-textSecondary">Delivery Method</dt>
                  <dd className="font-semibold text-nexus-heading capitalize">{order.payment_method || 'Standard Delivery'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-nexus-textSecondary">Estimated Delivery</dt>
                  <dd className="font-semibold text-nexus-heading">{estDelivery ? formatJourneyDate(estDelivery.toISOString()) : '—'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-nexus-textSecondary">Current Location</dt>
                  <dd className="font-semibold text-nexus-heading text-right flex items-center gap-1 justify-end">
                    <MapPinned size={13} className="text-[#F7A321]" /> {currentLocation}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 border-t border-nexus-border pt-3">
                  <dt className="text-nexus-textSecondary flex items-center gap-1.5"><User size={13} /> Driver</dt>
                  <dd className="font-semibold text-nexus-heading">{order.driver?.full_name || '—'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-nexus-textSecondary">Vehicle</dt>
                  <dd className="font-semibold text-nexus-heading">
                    {order.driver?.vehicle_number ? `${order.driver.vehicle_number}${order.driver.vehicle_type ? ` · ${order.driver.vehicle_type}` : ''}` : '—'}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-nexus-textSecondary">Customer Contact</dt>
                  <dd className="font-semibold text-nexus-heading">{order.shippingPhone || order.shipping_phone || '—'}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-white/80 dark:bg-nexus-card/80 backdrop-blur-md rounded-3xl p-6 border border-nexus-border shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-nexus-heading">
                <CreditCard className="text-[#FB461D]" size={22} />
                <h3 className="font-bold text-lg">Payment</h3>
              </div>
              <div className="text-nexus-muted space-y-2">
                <p className="font-semibold text-nexus-heading uppercase">
                  {order.payment_method || 'ONLINE PAYMENT'}
                </p>
                <p className="flex items-center gap-2">
                  Status:
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    order.payment_status === 'paid' || order.payment_status === 'completed'
                      ? 'bg-nexus-success/10 text-nexus-success'
                      : order.payment_status === 'failed'
                        ? 'bg-nexus-error/10 text-nexus-error'
                        : 'bg-nexus-gold/10 text-nexus-gold'
                  }`}>
                    {order.payment_status || 'unpaid'}
                  </span>
                </p>

                {!isPaid && (
                  <div className="mt-4 pt-4 border-t border-nexus-border">
                    <button
                      onClick={() => navigate(order.payment_method === 'Mock Mobile Money' ? `/payment/mock/${order.id}` : '/checkout')}
                      className="w-full py-2 bg-gradient-brand hover:opacity-90 text-white font-bold rounded-lg transition-all"
                    >
                      {order.payment_method === 'Mock Mobile Money' ? 'Complete Payment' : 'Pay Now'}
                    </button>
                    <p className="text-xs text-nexus-textSecondary mt-2 text-center">
                      * You will be redirected to complete payment for this order.
                    </p>
                  </div>
                )}

                {isPaid && (
                  <div className="mt-4 pt-4 border-t border-nexus-border space-y-3">
                    <button
                      onClick={() => navigate(`/payment/invoice/${order.id}`)}
                      className="w-full py-2 bg-nexus-dark-navy dark:bg-white text-white dark:text-nexus-navy font-bold rounded-lg transition-colors hover:opacity-90"
                    >
                      View Invoice
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Please enter a reason for your refund request:');
                        if (reason) {
                          alert('Refund requested for reason: ' + reason + '. Support will review it shortly.');
                        }
                      }}
                      className="w-full py-2 bg-nexus-surface hover:bg-nexus-surface dark:hover:bg-nexus-hover text-nexus-text font-bold rounded-lg transition-colors"
                    >
                      Request Refund
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery confirmation */}
            {order.status === 'Delivered' && !confirmed && !order.delivery_confirmed_at && (
              <div className="bg-nexus-success/10 dark:bg-nexus-success/10 border border-nexus-success/20 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Truck className="text-nexus-success" size={24} />
                  <h3 className="font-bold text-lg text-nexus-success dark:text-nexus-success">Order Delivered!</h3>
                </div>
                <p className="text-sm text-nexus-success dark:text-nexus-success mb-4">
                  Your order has arrived. Please confirm receipt and rate your experience.
                </p>
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="w-full py-3 bg-nexus-success hover:bg-nexus-success text-white font-bold rounded-xl transition-colors shadow-lg shadow-nexus-success/30 flex items-center justify-center gap-2"
                >
                  <ThumbsUp size={18} /> Confirm Receipt & Rate
                </button>
              </div>
            )}

            {confirmed && loyaltyEarned > 0 && (
              <div className="bg-nexus-gold/10 dark:bg-nexus-gold/10 border border-nexus-gold/20 rounded-3xl p-6 text-center">
                <Star size={32} className="text-nexus-gold mx-auto mb-2" />
                <p className="font-bold text-nexus-gold">+{loyaltyEarned} Loyalty Points Earned!</p>
                <p className="text-xs text-nexus-gold mt-1">Thank you for confirming your delivery.</p>
              </div>
            )}

            {canCancel && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full flex items-center justify-center gap-2 bg-nexus-error/5 dark:bg-nexus-error/10 hover:bg-nexus-error/10 dark:hover:bg-nexus-error/20 text-nexus-error border border-nexus-error/20 dark:border-nexus-error/20 px-6 py-3 rounded-xl transition-colors font-medium"
              >
                <XCircle size={18} />
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Delivery Modal */}
      {showConfirmModal && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowConfirmModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-nexus-card rounded-2xl p-6 w-full max-w-md border border-nexus-border shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-nexus-success/10 dark:bg-nexus-success/10 rounded-full">
                  <ThumbsUp size={24} className="text-nexus-success" />
                </div>
                <h3 className="text-lg font-bold text-nexus-heading">Confirm Delivery</h3>
              </div>
              <p className="text-sm text-nexus-textSecondary mb-4">
                Please confirm you have received your order and rate your delivery experience.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-nexus-heading mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setConfirmRating(star)} className={`p-2 rounded-lg transition-colors ${star <= confirmRating ? 'text-nexus-gold' : 'text-nexus-muted dark:text-nexus-muted'}`}>
                      <Star size={28} fill={star <= confirmRating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-nexus-heading mb-2">Feedback (optional)</label>
                <textarea
                  value={confirmFeedback}
                  onChange={(e) => setConfirmFeedback(e.target.value)}
                  placeholder="Tell us about your delivery experience..."
                  className="w-full bg-nexus-surface border border-nexus-border rounded-xl p-3 text-sm text-nexus-heading outline-none focus:ring-2 focus:ring-nexus-success/50 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-2.5 bg-nexus-surface text-nexus-text rounded-xl text-sm font-medium hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors">
                  Cancel
                </button>
                <button onClick={handleConfirmDelivery} disabled={confirming} className="flex-1 py-2.5 bg-nexus-success hover:bg-nexus-success disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-nexus-success/30 flex items-center justify-center gap-2">
                  {confirming ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <CheckCircle size={16} />}
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowCancelModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-nexus-card rounded-2xl p-6 w-full max-w-md border border-nexus-border shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-nexus-error/10 dark:bg-nexus-error/10 rounded-full">
                  <AlertTriangle size={24} className="text-nexus-error" />
                </div>
                <h3 className="text-lg font-bold text-nexus-heading">Cancel Order</h3>
              </div>
              <p className="text-sm text-nexus-textSecondary mb-4">
                Are you sure you want to cancel this order? This action cannot be undone.
              </p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation (optional)"
                className="w-full bg-nexus-surface border border-nexus-border rounded-xl p-3 text-sm text-nexus-heading outline-none focus:ring-2 focus:ring-nexus-primary/50 mb-4 resize-none"
                rows={3}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-2.5 bg-nexus-surface text-nexus-text rounded-xl text-sm font-medium hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancelOrder}
                  className="flex-1 py-2.5 bg-nexus-error hover:bg-nexus-error text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-nexus-error/30"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderDetailsPage;
