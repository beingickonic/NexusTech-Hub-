import { supabase } from './supabaseClient';

const getUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
};

const VALID_TRANSITIONS = {
  'pending':                       ['awaiting payment', 'cancelled'],
  'awaiting payment':              ['paid', 'pending payment verification', 'payment failed', 'cancelled'],
  'pending payment verification':  ['paid', 'payment failed'],
  'paid':                          ['pending finance approval', 'cancelled', 'refunded'],
  'payment verified':              ['pending finance approval', 'cancelled', 'refunded'],
  'pending finance approval':      ['finance approved', 'rejected', 'cancelled', 'refunded'],
  'finance approved':              ['reserved', 'stock reserved', 'ready for dispatch', 'waiting for stock', 'ready for picking', 'cancelled', 'refunded'],
  'waiting for stock':             ['reserved', 'stock reserved', 'ready for dispatch', 'cancelled'],
  'reserved':                      ['ready for dispatch', 'ready for picking', 'picking', 'cancelled'],
  'stock reserved':                ['ready for dispatch', 'ready for picking', 'picking', 'cancelled'],
  'ready for picking':             ['picking', 'cancelled'],
  'rejected':                      ['pending payment verification', 'cancelled', 'refunded'],
  'picking':                       ['packing', 'cancelled'],
  'packing':                       ['ready for dispatch', 'cancelled'],
  'ready for dispatch':            ['assigned', 'cancelled'],
  'assigned':                      ['out for delivery', 'cancelled'],
  'out for delivery':              ['delivered', 'cancelled'],
  'delivered':                     ['customer confirmed', 'completed', 'refunded'],
  'customer confirmed':            ['completed'],
  'completed':                     ['refunded'],
  'cancelled':                     ['refunded'],
  'refunded':                      [],
};

const isValidTransition = (from, to) => {
  const validTargets = VALID_TRANSITIONS[(from || '').toLowerCase()];
  return validTargets && validTargets.includes((to || '').toLowerCase());
};

const createOrder = async (orderData) => {
  try {
    const userId = await getUserId();
    if (!userId) throw new Error('User not authenticated');

    const {
      items, total_amount, payment_status,
      shippingName, shippingPhone, shippingAddress,
      shippingCity, shippingPostalCode, notes,
      payment_method
    } = orderData;

    const { data: order, error: orderError } = await supabase.from('orders').insert({
      user_id: userId,
      total_amount,
      payment_status: payment_status || 'unpaid',
      status: 'Pending',
      shipping_name: shippingName || null,
      shipping_phone: shippingPhone || null,
      shipping_address: shippingAddress || null,
      shipping_city: shippingCity || null,
      shipping_postal_code: shippingPostalCode || null,
      notes: notes || null,
      payment_method: payment_method || null,
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

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

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
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*, products(*)')
      .eq('order_id', orderId);

    if (itemsError) throw itemsError;

    const formattedItems = items.map(item => ({
      ...item,
      product_name: item.products?.title || 'Unknown Product',
      image_url: item.products?.image_url,
      sku: item.products?.sku || 'N/A',
      line_total: item.price * item.quantity
    }));

    let dispatch = null;
    let driver = null;

    // Resolve assigned driver: orders.driver_id holds the driver's profile id
    if (order.driver_id) {
      const [{ data: driverRow }, { data: profileData }] = await Promise.all([
        supabase.from('drivers').select('id, user_id, vehicle_info, license_number, status').eq('user_id', order.driver_id).maybeSingle(),
        supabase.from('profiles').select('id, full_name, phone, avatar_url').eq('id', order.driver_id).maybeSingle()
      ]);
      const [vehicle_type = '', ...rest] = String(driverRow?.vehicle_info || '').split(' - ');
      driver = {
        id: driverRow?.id || order.driver_id,
        user_id: order.driver_id,
        full_name: profileData?.full_name || 'Driver',
        phone: profileData?.phone || '',
        photo_url: profileData?.avatar_url || null,
        vehicle_info: driverRow?.vehicle_info || '',
        vehicle_type,
        vehicle_number: rest.join(' - '),
        license_number: driverRow?.license_number || '',
        status: driverRow?.status || ''
      };
    }

    let statusHistory = [];
    const { data: historyData } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', orderId)
      .order('changed_at', { ascending: true });

    if (historyData) statusHistory = historyData;

    const formattedOrder = {
      ...order,
      shippingName: order.shipping_name,
      shippingPhone: order.shipping_phone,
      shippingAddress: order.shipping_address,
      shippingCity: order.shipping_city,
      shippingPostalCode: order.shipping_postal_code,
      items: formattedItems,
      dispatch,
      driver,
      status_history: statusHistory,
    };

    return { success: true, data: { order: formattedOrder } };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const updateOrderStatus = async (orderId, status) => {
  try {
    const { data: current } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .maybeSingle();

    if (current && !isValidTransition(current.status, status)) {
      return {
        success: false,
        message: `Cannot transition from "${current.status}" to "${status}". Valid targets: ${(VALID_TRANSITIONS[(current.status || '').toLowerCase()] || []).join(', ')}`
      };
    }

    // Preferred path: SECURITY DEFINER RPC bypasses RLS so warehouse/inventory
    // staff can transition order status (migration 036).
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('update_order_status', { p_order_id: orderId, p_new_status: status });

    if (!rpcError) {
      const parsed = rpcData && typeof rpcData === 'string' ? JSON.parse(rpcData) : rpcData;
      if (parsed?.success) return { success: true, data: parsed.data };
      return { success: false, message: parsed?.error || 'Failed to update order status' };
    }

    // Fallback: direct update (only effective for Admin/Manager roles).
    if (rpcError.code === 'PGRST202') {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: false,
            message: 'Order status could not be updated. Your account may not have permission. Please try again or contact an administrator.'
          };
        }
        throw error;
      }
      return { success: true, data };
    }

    throw rpcError;
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const reserveInventory = async (orderId) => {
  try {
    const userId = await getUserId();
    const { data, error } = await supabase.rpc('reserve_inventory', {
      p_order_id: orderId,
      p_user_id: userId
    });
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const releaseInventory = async (orderId) => {
  try {
    const { data, error } = await supabase.rpc('release_inventory', {
      p_order_id: orderId
    });
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const deductInventory = async (orderId) => {
  try {
    const { data, error } = await supabase.rpc('deduct_inventory', {
      p_order_id: orderId
    });
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const cancelOrder = async (orderId, reason) => {
  try {
    const { data: current } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single();

    if (!current) throw new Error('Order not found');

    await releaseInventory(orderId);

    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'Cancelled',
        notes: supabase.rpc ? undefined : `Cancelled: ${reason || 'No reason provided'}`
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    if (reason) {
      await supabase.from('order_status_history').insert({
        order_id: orderId,
        to_status: 'Cancelled',
        from_status: current.status,
        note: reason
      });
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const getStatusHistory = async (orderId) => {
  try {
    const { data, error } = await supabase
      .from('order_status_history')
      .select('*, profiles:changed_by(full_name)')
      .eq('order_id', orderId)
      .order('changed_at', { ascending: true });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const subscribeToOrderUpdates = (userId, callback) => {
  const subscription = supabase
    .channel('public:orders')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'orders',
      filter: `user_id=eq.${userId}`
    }, payload => {
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
  reserveInventory,
  releaseInventory,
  deductInventory,
  cancelOrder,
  getStatusHistory,
  subscribeToOrderUpdates,
  isValidTransition,
};

export default orderService;
