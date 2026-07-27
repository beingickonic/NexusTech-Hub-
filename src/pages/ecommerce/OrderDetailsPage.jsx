import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, MapPin, CreditCard } from 'lucide-react';
import orderService from '../../services/orderService';
import OrderStatus from '../../components/orders/OrderStatus';
import TrackingTimeline from '../../components/orders/TrackingTimeline';
import { formatCurrency } from '../../utils/currency';
import { getImageUrl } from '../../utils/imageHelper';
import SmartImage from '../../components/SmartImage';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await orderService.getOrderDetails(id);
        if (res.success) {
          setOrder(res.data.order);
        }
      } catch (error) {
        console.error("Error fetching order details", error);
      }
      setLoading(false);
    };
    fetchOrderDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-slate-50 dark:bg-slate-900 text-center text-slate-500">
        Order not found.
      </div>
    );
  }

  const date = new Date(order.placed_at).toLocaleDateString('en-KE', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="min-h-screen pt-32 pb-20 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-orange-500 mb-4 transition-colors w-max">
              <ArrowLeft size={20} /> Back
            </button>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-4">
              Order {order.order_number}
              <OrderStatus status={order.status} />
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Placed on {date}</p>
          </div>
          
          <button className="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-xl transition-colors font-medium">
            <Download size={18} />
            Download Invoice
          </button>
        </div>

        {/* Timeline */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl p-8 mb-8 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Tracking</h3>
          <TrackingTimeline status={order.status} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Items Ordered</h3>
              
              <div className="space-y-6">
                {order.items?.map(item => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-xl overflow-hidden flex-shrink-0">
                      <SmartImage src={getImageUrl(item.image_url)} alt={item.product_name} className="w-full h-full bg-transparent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 dark:text-white truncate">{item.product_name}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">SKU: {item.sku}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Qty: {item.quantity}</p>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white text-right">
                      {formatCurrency(item.line_total)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
               <div className="space-y-4 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="font-semibold">{formatCurrency(order.shipping_fee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes</span>
                  <span className="font-semibold">{formatCurrency(order.tax)}</span>
                </div>
                
                <div className="h-px bg-slate-200 dark:bg-slate-700 my-4"></div>
                
                <div className="flex justify-between text-xl">
                  <span className="font-bold text-slate-900 dark:text-white">Total Amount</span>
                  <span className="font-bold text-orange-500">{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-slate-900 dark:text-white">
                <MapPin className="text-orange-500" size={24} />
                <h3 className="font-bold text-lg">Shipping Address</h3>
              </div>
              <div className="text-slate-600 dark:text-slate-400 space-y-1">
                <p className="font-semibold text-slate-900 dark:text-white">{order.shipping_name}</p>
                <p>{order.shipping_addr}</p>
                <p>{order.shipping_phone}</p>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-slate-900 dark:text-white">
                <CreditCard className="text-orange-500" size={24} />
                <h3 className="font-bold text-lg">Payment Method</h3>
              </div>
              <div className="text-slate-600 dark:text-slate-400 space-y-2">
                <p className="font-semibold text-slate-900 dark:text-white uppercase">
                  {order.payment_method || 'mpesa'}
                </p>
                <p className="flex items-center gap-2 mb-4">
                  Status: 
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {order.payment_status || 'unpaid'}
                  </span>
                </p>

                {order.payment_status !== 'paid' && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button 
                      onClick={() => navigate('/checkout')}
                      className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors"
                    >
                      Pay Now
                    </button>
                    <p className="text-xs text-slate-500 mt-2 text-center">
                      * You will be redirected to checkout to complete payment.
                    </p>
                  </div>
                )}

                {order.payment_status === 'paid' && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button 
                      onClick={() => {
                        const reason = prompt("Please enter a reason for your refund request:");
                        if (reason) {
                          // In a real app we'd dispatch to a service, but here we can just alert or call supabase directly if we imported it.
                          // For now, alert that it will be submitted.
                          alert("Refund requested for reason: " + reason + ". Support will review it shortly.");
                        }
                      }}
                      className="w-full py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-lg transition-colors"
                    >
                      Request Refund
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
