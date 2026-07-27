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

const paymentService = {
  createPayment,
  updatePaymentStatus,
  initiateMpesaPayment,
  initiateFlutterwavePayment,
  createPayPalOrder,
  capturePayPalOrder,
  verifyPayment
};

export default paymentService;
