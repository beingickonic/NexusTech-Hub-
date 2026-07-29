import { supabase } from './supabaseClient';
import { Capacitor } from '@capacitor/core';

const getReturnUrl = (paymentId) => {
  if (Capacitor.isNativePlatform()) {
    return `nexustechhub://payment/processing/${paymentId}`;
  }
  return `${window.location.origin}/payment/processing/${paymentId}`;
};

const createPayment = async (orderId, amount, provider, transactionRef = null, currency = 'KES') => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('payments').insert({
      order_id: orderId,
      user_id: user?.id,
      amount,
      provider,
      currency,
      transaction_reference: transactionRef,
      status: 'pending'
    }).select().single();
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const updatePaymentStatus = async (paymentId, status) => {
  try {
    const { data, error } = await supabase.from('payments').update({ status }).eq('id', paymentId).select().single();
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const initiateMpesaPayment = async (orderId, phoneNumber, amount) => {
  try {
    const payment = await createPayment(orderId, amount, 'mpesa');
    const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
      body: { orderId, paymentId: payment.data.id, phoneNumber, amount }
    });
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const initiateFlutterwavePayment = async (orderId, amount, email, name, phone, currency = 'KES') => {
  try {
    const payment = await createPayment(orderId, amount, 'flutterwave', null, currency);
    const returnUrl = getReturnUrl(payment.data.id);
    const { data, error } = await supabase.functions.invoke('flutterwave-initiate', {
      body: { orderId, paymentId: payment.data.id, amount, currency, email, name, phone, returnUrl }
    });
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const createPayPalOrder = async (orderId, amount, currency = 'USD') => {
  try {
    const payment = await createPayment(orderId, amount, 'paypal', null, currency);
    const returnUrl = getReturnUrl(payment.data.id);
    const { data, error } = await supabase.functions.invoke('paypal-create-order', {
      body: { orderId, paymentId: payment.data.id, amount, currency, returnUrl }
    });
    if (error) throw error;
    return { success: true, data }; // data.id is paypalOrderId
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const capturePayPalOrder = async (paypalOrderId) => {
  try {
    const { data, error } = await supabase.functions.invoke('paypal-capture-order', {
      body: { paypalOrderId }
    });
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const verifyPayment = async (transactionRef) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('id, status, order_id')
      .eq('transaction_reference', transactionRef)
      .single();
      
    if (error) throw error;
    return { 
      success: true, 
      data: { 
        status: data.status, 
        payment_id: data.id, 
        order_id: data.order_id 
      } 
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const submitManualPayment = async (orderId, transactionCode, amount, userId) => {
  try {
    const { data: payment, error: paymentError } = await supabase.from('payments').insert({
      order_id: orderId,
      user_id: userId,
      amount,
      provider: 'mpesa_manual',
      currency: 'KES',
      transaction_reference: transactionCode,
      status: 'pending'
    }).select().single();
    
    if (paymentError) throw paymentError;
    
    const { error: orderError } = await supabase.from('orders').update({
      status: 'Pending Payment Verification'
    }).eq('id', orderId);
    
    if (orderError) throw orderError;
    
    return { success: true, data: payment };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const getPendingManualPayments = async () => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*, orders(total_amount, status), profiles:user_id(full_name, phone)')
      .eq('provider', 'mpesa_manual')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const verifyManualPayment = async (paymentId, orderId, isApproved) => {
  try {
    const paymentStatus = isApproved ? 'paid' : 'rejected';
    const orderStatus = isApproved ? 'Processing' : 'Payment Failed';
    
    const { error: paymentError } = await supabase.from('payments').update({
      status: paymentStatus,
      updated_at: new Date().toISOString()
    }).eq('id', paymentId);
    
    if (paymentError) throw paymentError;
    
    const { error: orderError } = await supabase.from('orders').update({
      status: orderStatus,
      payment_status: paymentStatus === 'paid' ? 'paid' : 'unpaid'
    }).eq('id', orderId);
    
    if (orderError) throw orderError;
    
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const createReceipt = async (paymentId) => {
  try {
    const { data: payment, error } = await supabase
      .from('payments')
      .select(`
        *,
        orders!inner (
          *,
          order_items (
            *,
            products (name)
          )
        ),
        payment_callbacks (
          mpesa_receipt
        )
      `)
      .eq('id', paymentId)
      .single();

    if (error) throw error;

    // Transform data to match receipt format
    const receiptData = {
      payment_id: payment.id,
      order_id: payment.order_id,
      amount: payment.amount,
      provider: payment.provider,
      status: payment.status,
      created_at: payment.created_at,
      mpesa_receipt: payment.payment_callbacks?.[0]?.mpesa_receipt || payment.transaction_reference,
      items: payment.orders.order_items.map(item => ({
        product_name: item.products?.name || 'Unknown Product',
        quantity: item.quantity,
        line_total: item.price * item.quantity
      }))
    };

    return { success: true, data: { receipt: receiptData } };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const paymentService = {
  createPayment,
  updatePaymentStatus,
  initiateMpesaPayment,
  initiateFlutterwavePayment,
  createPayPalOrder,
  capturePayPalOrder,
  verifyPayment,
  createReceipt,
  submitManualPayment,
  getPendingManualPayments,
  verifyManualPayment
};

export default paymentService;
