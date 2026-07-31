import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../auth/AuthContext';
import orderService from '../../services/orderService';
import paymentService from '../../services/paymentService';
import CheckoutSteps from '../../components/checkout/CheckoutSteps';
import ShippingForm from '../../components/checkout/ShippingForm';
import PaymentMethods from '../../components/checkout/PaymentMethods';
import OrderSummary from '../../components/checkout/OrderSummary';

// Feature Flag: Set to true to re-enable automatic STK Push in the future
const USE_STK_PUSH = false;
const PAYBILL_NUMBER = '123456';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, cartSummary, clearCartState } = useCart();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });
  
  const [mpesaPhone, setMpesaPhone] = useState('');
  
  // Manual M-Pesa State
  const [createdOrder, setCreatedOrder] = useState(null);
  const [transactionCode, setTransactionCode] = useState('');

  useEffect(() => {
    if (cartItems.length === 0 && step === 1 && !createdOrder) {
      navigate('/cart');
    }
  }, [cartItems, navigate, step, createdOrder]);

  const handleNext = () => {
    if (step === 1 && (!formData.fullName || !formData.phone || !formData.address || !formData.city)) {
      alert("Please fill all required shipping fields");
      return;
    }
    if (step === 1) {
      setMpesaPhone(formData.phone);
    }
    setStep(prev => Math.min(prev + 1, 3));
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handlePlaceOrder = async () => {
    if (USE_STK_PUSH && paymentMethod === 'mpesa') {
      if (!mpesaPhone) {
        alert("Please provide an M-Pesa phone number");
        return;
      }
      const phoneRegex = /^(?:254|\+254|0)?([17]\d{8})$/;
      if (!phoneRegex.test(mpesaPhone.replace(/\s+/g, ''))) {
        alert("Please enter a valid Kenyan phone number (e.g., 0712345678 or 254712345678)");
        return;
      }
    }

    setLoading(true);
    const orderData = {
      items: cartItems,
      total_amount: cartSummary.total,
      payment_status: 'unpaid',
      payment_method: paymentMethod,
      shippingName: formData.fullName,
      shippingPhone: formData.phone,
      shippingAddress: formData.address,
      shippingCity: formData.city,
      shippingPostalCode: formData.postalCode
    };

    try {
      const res = await orderService.createOrder(orderData);
      if (res.success) {
        clearCartState();
        const newOrder = res.data.order;
        
        // Update order status to Awaiting Payment
        await orderService.updateOrderStatus(newOrder.id, 'Awaiting Payment');
        
        if (paymentMethod === 'mock') {
          navigate(`/payment/mock/${newOrder.id}`);
        } else if (paymentMethod === 'mpesa') {
          if (!USE_STK_PUSH) {
            // MANUAL M-PESA FLOW
            setCreatedOrder(newOrder);
            setLoading(false);
            window.scrollTo(0, 0);
            return; // Stop here, wait for transaction code
          }
          
          // STK PUSH FLOW
          try {
             const paymentRes = await paymentService.initiateMpesaPayment(
               newOrder.id, 
               mpesaPhone, 
               cartSummary.total
             );
             if (paymentRes.success && paymentRes.data?.checkout_request_id) {
               navigate(`/payment/processing/${paymentRes.data.checkout_request_id}`);
             } else {
               console.error("Mpesa initiation failed", paymentRes.message);
               alert("Order created, but M-Pesa push failed: " + (paymentRes.message || "Unknown error"));
               navigate(`/orders/${newOrder.id}`);
             }
          } catch (paymentErr) {
             console.error("Mpesa initiation crashed", paymentErr);
             alert("Order created but M-Pesa push crashed.");
             navigate(`/orders/${newOrder.id}`);
          }
        } else if (paymentMethod === 'flutterwave') {
          try {
             const fwRes = await paymentService.initiateFlutterwavePayment(
               newOrder.id, 
               cartSummary.total,
               user?.email,
               formData.fullName,
               formData.phone
             );
             if (fwRes.data?.payment_link) {
               window.location.href = fwRes.data.payment_link;
             } else {
               navigate(`/payment/status?provider=flutterwave&error=nolink`);
             }
          } catch (err) {
             navigate(`/orders/${newOrder.id}`);
          }
        } else if (paymentMethod === 'paypal') {
          try {
             const usdAmount = (cartSummary.total / 130).toFixed(2);
             const ppRes = await paymentService.createPayPalOrder(
               newOrder.id,
               usdAmount,
               'USD'
             );
             if (ppRes.data?.approve_link) {
               window.location.href = ppRes.data.approve_link;
             } else {
               navigate(`/payment/status?provider=paypal&error=nolink`);
             }
          } catch (err) {
             navigate(`/orders/${newOrder.id}`);
          }
        } else {
          navigate(`/orders/${newOrder.id}`);
        }
      } else {
        alert(res.message);
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred during checkout.");
    }
    setLoading(false);
  };

  const handleVerifyPayment = async () => {
    if (!transactionCode.trim()) {
      alert("Please enter the M-Pesa Transaction Code.");
      return;
    }
    setLoading(true);
    const res = await paymentService.submitManualPayment(
      createdOrder.id, 
      transactionCode.trim(), 
      createdOrder.total_amount, 
      user.id
    );
    if (res.success) {
      navigate(`/payment/processing/manual_${res.data.id}`); // Or just redirect to orders list with success message
      // Actually, we can just navigate to the order details page directly.
      navigate(`/orders/${createdOrder.id}`);
    } else {
      alert("Failed to submit verification: " + res.message);
    }
    setLoading(false);
  };

  if (createdOrder && paymentMethod === 'mpesa' && !USE_STK_PUSH) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-nexus-surface transition-colors duration-300">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-nexus-card rounded-3xl p-8 border border-nexus-border shadow-sm text-center">
            <h2 className="text-3xl font-bold text-nexus-heading mb-6">Complete Payment</h2>
            
            <div className="bg-nexus-primary/10 dark:bg-nexus-primary/10 rounded-2xl p-6 border border-nexus-primary/20 text-left mb-8">
              <h3 className="font-semibold text-nexus-primary mb-4 text-lg">M-Pesa Instructions</h3>
              <ol className="list-decimal list-inside space-y-3 text-nexus-primary/80 mb-6">
                <li>Go to M-Pesa menu on your phone</li>
                <li>Select <strong>Lipa na M-Pesa</strong> {'>'} <strong>Pay Bill</strong></li>
                <li>Enter Business No: <strong className="text-nexus-primary">{PAYBILL_NUMBER}</strong></li>
                <li>Enter Account No: <strong className="text-nexus-primary">ORD-{createdOrder.id}</strong></li>
                <li>Enter Amount: <strong className="text-nexus-primary">KES {createdOrder.total_amount.toLocaleString()}</strong></li>
                <li>Enter your M-Pesa PIN and confirm</li>
              </ol>
            </div>

            <div className="space-y-4">
              <label className="block text-left text-sm font-medium text-nexus-muted">
                M-Pesa Transaction Code
              </label>
              <input 
                type="text" 
                value={transactionCode}
                onChange={(e) => setTransactionCode(e.target.value.toUpperCase())}
                placeholder="e.g. OXX1234567"
                className="w-full bg-nexus-surface border border-nexus-border rounded-xl px-4 py-3 text-nexus-heading outline-none focus:ring-2 focus:ring-nexus-primary uppercase"
              />
              <button 
                onClick={handleVerifyPayment}
                disabled={loading || !transactionCode.trim()}
                className="w-full bg-nexus-primary hover:bg-nexus-primary-hover text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-primary/30 disabled:opacity-70 flex items-center justify-center"
              >
                {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span> : null}
                Verify Payment
              </button>
            </div>
            
            <p className="mt-6 text-sm text-nexus-muted">
              Your order #ORD-{createdOrder.id} has been created and is awaiting payment verification.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-nexus-surface transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <h1 className="text-4xl font-bold text-nexus-heading mb-10">Checkout</h1>
        
        <CheckoutSteps currentStep={step} />

        <div className="flex flex-col lg:flex-row gap-10 mt-12">
          <div className="flex-1">
            <div className="bg-white/80 dark:bg-nexus-card/80 backdrop-blur-md rounded-3xl p-6 md:p-10 border border-nexus-border shadow-sm">
              
              {step === 1 && (
                <ShippingForm formData={formData} setFormData={setFormData} />
              )}
              
              {step === 2 && (
                <PaymentMethods selected={paymentMethod} onSelect={setPaymentMethod} />
              )}
              
              {step === 3 && (
                <div className="animate-fade-in text-center py-10">
                  <h3 className="text-2xl font-bold text-nexus-heading mb-4">Almost there!</h3>
                  <p className="text-nexus-muted max-w-md mx-auto mb-8">
                    Please review your order details on the right panel. Once you confirm, your order will be created.
                  </p>
                  {paymentMethod === 'mpesa' && USE_STK_PUSH && (
                    <div className="bg-nexus-primary/10 dark:bg-nexus-primary/10 p-6 rounded-2xl border border-nexus-primary/20 max-w-md mx-auto text-left shadow-inner">
                      <h4 className="font-semibold text-nexus-primary mb-2">M-Pesa Payment Details</h4>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-nexus-primary mb-1">M-Pesa Phone Number</label>
                        <input 
                          type="text" 
                          value={mpesaPhone}
                          onChange={(e) => setMpesaPhone(e.target.value)}
                          placeholder="e.g. 0712345678"
                          className="w-full bg-nexus-card border border-nexus-primary/20 dark:border-nexus-primary/30 rounded-lg px-4 py-2 text-nexus-heading outline-none focus:ring-2 focus:ring-nexus-primary/50"
                        />
                      </div>
                      <p className="text-xs font-medium text-nexus-primary/80 leading-relaxed">
                        Keep your phone nearby. An STK push prompt will appear on your phone shortly after clicking Place Order.
                      </p>
                    </div>
                  )}
                  {paymentMethod === 'mpesa' && !USE_STK_PUSH && (
                    <div className="bg-nexus-primary/10 dark:bg-nexus-primary/10 p-6 rounded-2xl border border-nexus-primary/20 max-w-md mx-auto text-center shadow-inner">
                      <p className="text-nexus-primary font-medium">
                        You will be provided with Paybill instructions on the next screen to complete your payment manually.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between mt-10 pt-6 border-t border-nexus-border">
                {step > 1 ? (
                  <button 
                    onClick={handleBack}
                    className="px-6 py-3 rounded-xl font-semibold text-nexus-muted hover:bg-nexus-surface dark:hover:bg-nexus-hover transition-colors"
                  >
                    Back
                  </button>
                ) : <div></div>}
                
                {step < 3 ? (
                  <button 
                    onClick={handleNext}
                    className="bg-nexus-heading hover:bg-nexus-dark-navy dark:bg-white dark:hover:bg-nexus-surface text-white dark:text-nexus-navy font-semibold py-3 px-8 rounded-xl transition-colors shadow-lg"
                  >
                    Continue
                  </button>
                ) : (
                  <button 
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="bg-nexus-primary hover:bg-nexus-primary-hover text-white font-bold py-3 px-10 rounded-xl transition-all shadow-lg shadow-primary/30 disabled:opacity-70 flex items-center"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    ) : null}
                    {(!USE_STK_PUSH && paymentMethod === 'mpesa') ? 'Proceed to Payment' : 'Place Order & Pay'}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="w-full lg:w-[400px]">
            <OrderSummary cartItems={cartItems} cartSummary={cartSummary} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
