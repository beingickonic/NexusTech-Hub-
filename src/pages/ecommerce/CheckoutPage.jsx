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

  useEffect(() => {
    if (cartItems.length === 0 && step === 1) {
      navigate('/cart');
    }
  }, [cartItems, navigate, step]);

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
    if (paymentMethod === 'mpesa') {
      if (!mpesaPhone) {
        alert("Please provide an M-Pesa phone number");
        return;
      }
      // Validate Safaricom/Airtel/Telkom format (general Kenyan regex: 07.., 01.., 254.., +254..)
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
      shipping_name: formData.fullName,
      shipping_phone: formData.phone,
      shipping_address: formData.address,
      shipping_city: formData.city,
      shipping_postal_code: formData.postalCode,
      payment_method: paymentMethod
    };

    try {
      const res = await orderService.createOrder(orderData);
      if (res.success) {
        clearCartState();
        
        if (paymentMethod === 'mpesa') {
          try {
             const paymentRes = await paymentService.initiateMpesaPayment(
               res.data.order.id, 
               mpesaPhone, 
               cartSummary.total
             );
             if (paymentRes.success && paymentRes.data?.checkout_request_id) {
               navigate(`/payment/processing/${paymentRes.data.checkout_request_id}`);
             } else {
               console.error("Mpesa initiation failed", paymentRes.message);
               alert("Order created, but M-Pesa push failed: " + (paymentRes.message || "Unknown error"));
               navigate(`/orders/${res.data.order.id}`);
             }
          } catch (paymentErr) {
             console.error("Mpesa initiation crashed", paymentErr);
             alert("Order created but M-Pesa push crashed.");
             navigate(`/orders/${res.data.order.id}`);
          }
        } else if (paymentMethod === 'flutterwave') {
          try {
             const fwRes = await paymentService.initiateFlutterwavePayment(
               res.data.order.id, 
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
             navigate(`/orders/${res.data.order.id}`);
          }
        } else if (paymentMethod === 'paypal') {
          try {
             // Convert to USD roughly if KES, or assume USD
             const usdAmount = (cartSummary.total / 130).toFixed(2);
             const ppRes = await paymentService.createPayPalOrder(
               res.data.order.id,
               usdAmount,
               'USD'
             );
             if (ppRes.data?.approve_link) {
               window.location.href = ppRes.data.approve_link;
             } else {
               navigate(`/payment/status?provider=paypal&error=nolink`);
             }
          } catch (err) {
             navigate(`/orders/${res.data.order.id}`);
          }
        } else {
          navigate(`/orders/${res.data.order.id}`);
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

  return (
    <div className="min-h-screen pt-32 pb-20 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-10">Checkout</h1>
        
        <CheckoutSteps currentStep={step} />

        <div className="flex flex-col lg:flex-row gap-10 mt-12">
          <div className="flex-1">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl p-6 md:p-10 border border-slate-200 dark:border-slate-700 shadow-sm">
              
              {step === 1 && (
                <ShippingForm formData={formData} setFormData={setFormData} />
              )}
              
              {step === 2 && (
                <PaymentMethods selected={paymentMethod} onSelect={setPaymentMethod} />
              )}
              
              {step === 3 && (
                <div className="animate-fade-in text-center py-10">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Almost there!</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
                    Please review your order details on the right panel. Once you confirm, you'll be redirected to complete your payment securely.
                  </p>
                  {paymentMethod === 'mpesa' && (
                    <div className="bg-orange-50 dark:bg-orange-500/10 p-6 rounded-2xl border border-orange-200 dark:border-orange-500/20 max-w-md mx-auto text-left shadow-inner">
                      <h4 className="font-semibold text-orange-900 dark:text-orange-300 mb-2">M-Pesa Payment Details</h4>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-orange-800 dark:text-orange-400 mb-1">M-Pesa Phone Number</label>
                        <input 
                          type="text" 
                          value={mpesaPhone}
                          onChange={(e) => setMpesaPhone(e.target.value)}
                          placeholder="e.g. 0712345678"
                          className="w-full bg-white dark:bg-slate-900 border border-orange-200 dark:border-orange-500/30 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/50"
                        />
                      </div>
                      <p className="text-xs font-medium text-orange-800/80 dark:text-orange-400/80 leading-relaxed">
                        Keep your phone nearby. An STK push prompt will appear on your phone shortly after clicking Place Order.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between mt-10 pt-6 border-t border-slate-200 dark:border-slate-700">
                {step > 1 ? (
                  <button 
                    onClick={handleBack}
                    className="px-6 py-3 rounded-xl font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Back
                  </button>
                ) : <div></div>}
                
                {step < 3 ? (
                  <button 
                    onClick={handleNext}
                    className="bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-semibold py-3 px-8 rounded-xl transition-colors shadow-lg"
                  >
                    Continue
                  </button>
                ) : (
                  <button 
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-10 rounded-xl transition-all shadow-lg shadow-orange-500/30 disabled:opacity-70 flex items-center"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    ) : null}
                    Place Order & Pay
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
