import { supabase } from './supabaseClient';

const getUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
};

const createOrder = async (orderData) => {
  try {
    const userId = await getUserId();
    if (!userId) throw new Error("User not authenticated");
    
    const {
      items, total_amount, payment_status,
      shippingName, shippingPhone, shippingAddress,
      shippingCity, shippingPostalCode, notes
    } = orderData;
    
    const { data: order, error: orderError } = await supabase.from('orders').insert({
      user_id: userId,
      total_amount,
      payment_status: payment_status || 'unpaid',
      status: 'pending',
      shipping_name: shippingName || null,
      shipping_phone: shippingPhone || null,
      shipping_address: shippingAddress || null,
      shipping_city: shippingCity || null,
      shipping_postal_code: shippingPostalCode || null,
      notes: notes || null,
    }).select().single();
    
    if (orderError) throw orderError;
    
    if (items && items.length > 0) {
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      }));
      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;
    }
    
    // Clear cart items
    await supabase.from('cart_items').delete().eq('user_id', userId);
    
    return { success: true, data: { order } };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const getOrders = async () => {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, message: 'Not authenticated' };
    
    const { data, error } = await supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    const mappedData = data.map(order => ({
      ...order,
      shippingName: order.shipping_name,
      shippingPhone: order.shipping_phone,
      shippingAddress: order.shipping_address,
      shippingCity: order.shipping_city,
      shippingPostalCode: order.shipping_postal_code,
    }));
    return { success: true, data: { orders: mappedData } };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const getOrderDetails = async (orderId) => {
  try {
    const { data: order, error: orderError } = await supabase.from('orders').select('*').eq('id', orderId).single();
    if (orderError) throw orderError;
    
    const { data: items, error: itemsError } = await supabase.from('order_items').select('*, products(*)').eq('order_id', orderId);
    if (itemsError) throw itemsError;
    
    // Map joined product data to item fields for the UI
    const formattedItems = items.map(item => ({
      ...item,
      product_name: item.products?.title || 'Unknown Product',
      image_url: item.products?.image_url,
      sku: item.products?.sku || 'N/A',
      line_total: item.price * item.quantity
    }));
    
    const formattedOrder = {
      ...order,
      shippingName: order.shipping_name,
      shippingPhone: order.shipping_phone,
      shippingAddress: order.shipping_address,
      shippingCity: order.shipping_city,
      shippingPostalCode: order.shipping_postal_code,
      items: formattedItems
    };

    return { success: true, data: { order: formattedOrder } };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const updateOrderStatus = async (orderId, status) => {
  try {
    const { data, error } = await supabase.from('orders').update({ status }).eq('id', orderId).select().single();
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Realtime feature
const subscribeToOrderUpdates = (userId, callback) => {
  const subscription = supabase
    .channel('public:orders')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `user_id=eq.${userId}` }, payload => {
      callback(payload.new);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
};

const orderService = {
  createOrder,
  getOrders,
  getOrderDetails,
  updateOrderStatus,
  subscribeToOrderUpdates
};

export default orderService;
