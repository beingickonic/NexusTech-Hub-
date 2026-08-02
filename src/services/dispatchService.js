import { supabase } from './supabaseClient';
import { DEFAULT_LIMIT, pageRange, responseMeta } from '../utils/pagination';

let isFallbackActive = null;

async function shouldFallback() {
  if (isFallbackActive !== null) return isFallbackActive;
  try {
    const { data, error } = await supabase.from('dispatches').select('id').limit(1);
    if (error && error.code === 'PGRST205') { isFallbackActive = true; return true; }
    // If the dispatches table exists but is empty (no dispatch records were
    // ever created), fall back to deriving dispatches straight from orders.
    if (!data || data.length === 0) {
      const { count } = await supabase.from('dispatches').select('*', { count: 'exact', head: true });
      isFallbackActive = (count || 0) === 0;
      return isFallbackActive;
    }
    isFallbackActive = false;
  } catch (e) {
    isFallbackActive = true;
  }
  return isFallbackActive;
}

const notifyUser = async (userId, title, message, type = 'info') => {
  if (!userId) return;
  try {
    await supabase.rpc('send_notification', { p_user_id: userId, p_title: title, p_message: message, p_type: type });
  } catch (e) {
    console.warn('Notification send failed:', e?.message);
  }
};

const syncDriverStatus = async (driverId, status) => {
  if (!driverId) return;
  try {
    await supabase.from('drivers').update({ status }).eq('user_id', driverId);
  } catch (e) {
    console.warn('Driver status sync failed:', e?.message);
  }
};

export const dispatchService = {
  getDispatchStats: async () => {
    try {
      if (await shouldFallback()) {
        const { data: orders } = await supabase.from('orders')
          .select('status, updated_at')
          .in('status', ['Reserved', 'Ready for Dispatch', 'Assigned', 'Out for Delivery', 'Delivered', 'Completed']);
        
        const stats = { pending: 0, assigned: 0, picked_up: 0, in_transit: 0, delivered: 0, failed: 0, returned: 0 };
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        let todayDelivered = 0;
        (orders || []).forEach(o => {
          const s = (o.status || '').toLowerCase();
          if (s === 'reserved' || s === 'ready for dispatch') stats.pending++;
          else if (s === 'assigned') stats.assigned++;
          else if (s === 'out for delivery') stats.in_transit++;
          else if (s === 'delivered' || s === 'completed') {
            stats.delivered++;
            if (o.updated_at && new Date(o.updated_at) >= todayStart) todayDelivered++;
          }
        });

        return {
          success: true,
          stats: {
            ...stats,
            today_delivered: todayDelivered,
            in_transit: stats.in_transit,
            Pending: stats.pending,
          }
        };
      }

      const statuses = ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed', 'returned'];
      const results = await Promise.all(
        statuses.map(s =>
          supabase.from('dispatches').select('*', { count: 'exact', head: true }).eq('status', s)
        )
      );
      const stats = {};
      statuses.forEach((s, i) => { stats[s] = results[i].count || 0; });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: todayCount } = await supabase
        .from('dispatches')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'delivered')
        .gte('delivered_at', today.toISOString());

      return {
        success: true,
        stats: {
          ...stats,
          today_delivered: todayCount || 0,
          in_transit: stats.in_transit || 0,
          Pending: stats.pending || 0,
        }
      };
    } catch (error) {
      console.error('Dispatch stats error:', error);
      return { success: false, stats: {} };
    }
  },

  getDispatches: async ({ page = 1, limit = DEFAULT_LIMIT, status = 'all', search = '' } = {}) => {
    const { from, to } = pageRange(page, limit);

    if (await shouldFallback()) {
      let query = supabase.from('orders').select('*, profiles!fk_orders_user_profiles(full_name, phone)', { count: 'exact' });
      
      if (status && status !== 'all') {
        if (status === 'pending') query = query.in('status', ['Reserved', 'Ready for Dispatch']);
        else if (status === 'assigned') query = query.eq('status', 'Assigned');
        else if (status === 'in_transit') query = query.eq('status', 'Out for Delivery');
        else if (status === 'delivered') query = query.in('status', ['Delivered', 'Completed']);
      } else {
        query = query.in('status', ['Reserved', 'Ready for Dispatch', 'Assigned', 'Out for Delivery', 'Delivered', 'Completed']);
      }

      if (search) {
        query = query.or(`shipping_name.ilike.%${search}%,order_number.ilike.%${search}%,shipping_phone.ilike.%${search}%`);
      }

      const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, to);
      if (error) throw error;

      const driverIds = [...new Set((data || []).map(d => d.driver_id).filter(Boolean))];
      let drivers = [];
      if (driverIds.length > 0) {
        const { data: dData } = await supabase.from('profiles').select('id, full_name, phone').in('id', driverIds);
        drivers = dData || [];
      }
      const driverMap = Object.fromEntries(drivers.map(d => [d.id, d]));

      const mapped = (data || []).map(o => ({
        id: o.id,
        dispatch_number: o.order_number || `DISP-${o.id.substring(0, 8)}`,
        order_id: o.id,
        driver_id: o.driver_id,
        customer_name: o.shipping_name || 'Customer',
        customer_phone: o.shipping_phone || '',
        delivery_address: `${o.shipping_address || ''}, ${o.shipping_city || ''}`,
        status: o.status === 'Reserved' || o.status === 'Ready for Dispatch' ? 'pending' : 
                o.status === 'Assigned' ? 'assigned' : 
                o.status === 'Out for Delivery' ? 'in_transit' : 'delivered',
        created_at: o.created_at,
        orders: {
          id: o.id,
          total_amount: o.total_amount,
          status: o.status,
          order_number: o.order_number,
          payment_status: o.payment_status
        },
        drivers: driverMap[o.driver_id] ? {
          id: o.driver_id,
          full_name: driverMap[o.driver_id].full_name,
          phone: driverMap[o.driver_id].phone,
          vehicle_number: 'N/A'
        } : null
      }));

      return { success: true, data: mapped, meta: responseMeta(count, page, limit) };
    }

    let query = supabase
      .from('dispatches')
      .select(`
        *,
        orders(id, total_amount, status, order_number, payment_status),
        drivers(id, full_name, phone, vehicle_number, vehicle_type, photo_url)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status && status !== 'all') query = query.eq('status', status);
    if (search) query = query.or(`customer_name.ilike.%${search}%,dispatch_number.ilike.%${search}%,customer_phone.ilike.%${search}%`);

    const { data, count, error } = await query.range(from, to);
    if (error) throw error;

    return { success: true, data: data || [], meta: responseMeta(count, page, limit) };
  },

  getEligibleDispatchOrders: async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('id, order_number, shipping_name, shipping_phone, shipping_address, shipping_city, total_amount, status, driver_id, customer_id, created_at')
      .in('status', ['Reserved', 'Ready for Dispatch', 'Assigned', 'Out for Delivery'])
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { success: true, data: data || [] };
  },

  getDispatch: async (id) => {
    if (await shouldFallback()) {
      const { data: o, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(title, image_url))')
        .eq('id', id)
        .single();

      // RLS hides orders not owned by the caller (e.g. another driver's fleet
      // delivery opened from the fleet dashboard). Fall back to the
      // SECURITY DEFINER RPC so the status page can still open it.
      if (o) {
        let driver = null;
        if (o.driver_id) {
          const { data: d } = await supabase.from('profiles').select('*').eq('id', o.driver_id).single();
          driver = d;
        }

        const mapped = {
          id: o.id,
          dispatch_number: o.order_number || `DISP-${o.id.substring(0, 8)}`,
          order_id: o.id,
          driver_id: o.driver_id,
          customer_name: o.shipping_name || 'Customer',
          customer_phone: o.shipping_phone || '',
          delivery_address: `${o.shipping_address || ''}, ${o.shipping_city || ''}`,
          status: o.status === 'Reserved' || o.status === 'Ready for Dispatch' ? 'pending' :
                  o.status === 'Assigned' ? 'assigned' :
                  o.status === 'Out for Delivery' ? 'in_transit' : 'delivered',
          created_at: o.created_at,
          orders: {
            ...o,
            items: o.order_items
          },
          drivers: driver ? {
            id: driver.id,
            full_name: driver.full_name,
            phone: driver.phone,
            vehicle_number: 'N/A'
          } : null
        };
        return { success: true, data: mapped };
      }

      // Direct read failed (RLS). Look it up through the fleet RPC instead.
      const { data, error: rpcErr } = await supabase.rpc('get_fleet_deliveries');
      if (!rpcErr && Array.isArray(data)) {
        const o2 = data.find(x => x.id === id || x.order_id === id);
        if (o2) {
          return {
            success: true,
            data: {
              id: o2.id,
              dispatch_number: o2.dispatch_number,
              order_id: o2.order_id,
              driver_id: o2.driver_id,
              driver_name: o2.driver_name,
              customer_name: o2.customer_name,
              customer_phone: o2.customer_phone,
              delivery_address: `${o2.shipping_address || ''}, ${o2.shipping_city || ''}`.replace(/^,\s*/, '').replace(/,\s*$/, ''),
              status: o2.status === 'Assigned' ? 'assigned' :
                      o2.status === 'Out for Delivery' ? 'in_transit' : 'delivered',
              created_at: o2.created_at,
              orders: o2
            }
          };
        }
      }
      return { success: true, data: null };
    }

    const { data, error } = await supabase
      .from('dispatches')
      .select(`*, orders(*, order_items(*, products(title, image_url))), drivers(*)`)
      .eq('id', id)
      .single();
    if (error) throw error;
    return { success: true, data };
  },

  createDispatch: async (dispatchData) => {
    if (await shouldFallback()) {
      if (dispatchData.order_id) {
        await supabase.from('orders').update({ status: 'Assigned' }).eq('id', dispatchData.order_id);
      }
      return { success: true };
    }

    const { data: { user } } = await supabase.auth.getUser();

    const payload = { ...dispatchData };
    if (!payload.order_id) delete payload.order_id;
    payload.status = payload.driver_id ? 'assigned' : (payload.status || 'pending');
    payload.assigned_by = user?.id || null;

    const { data, error } = await supabase
      .from('dispatches')
      .insert([payload])
      .select()
      .single();
    if (error) throw error;

    if (data.order_id) {
      const orderUpdate = { status: 'Assigned' };
      if (data.driver_id) orderUpdate.driver_id = data.driver_id;
      await supabase.from('orders').update(orderUpdate).eq('id', data.order_id);
    }

    return { success: true, data };
  },

  assignDriver: async (dispatchId, driverId) => {
    if (await shouldFallback()) {
      const { data: order } = await supabase.from('orders').select('id, user_id, order_number, shipping_name').eq('id', dispatchId).maybeSingle();

      const { error } = await supabase
        .from('orders')
        .update({ driver_id: driverId, status: 'Assigned', updated_at: new Date().toISOString() })
        .eq('id', dispatchId);
      if (error) throw error;

      // Log event (delivery_events CHECK only allows 'notes' for a plain assignment)
      await supabase.from('delivery_events').insert([{
        order_id: dispatchId,
        driver_id: driverId,
        event_type: 'notes',
        notes: 'Driver assigned to order'
      }]).then(() => {}).catch(() => {});

      // Notify the driver + customer
      const { data: driverProfile } = await supabase.from('profiles').select('id, full_name').eq('id', driverId).maybeSingle();
      await notifyUser(driverId, 'New Delivery Assigned', `You have been assigned order ${order?.order_number || ''}. Please accept it in your driver portal.`, 'dispatch');
      if (order?.user_id) await notifyUser(order.user_id, 'Driver Assigned', `A driver (${driverProfile?.full_name || 'assigned'}) has been assigned to your order ${order?.order_number || ''}.`, 'dispatch');

      return {
        success: true,
        data: {
          id: dispatchId,
          order_id: dispatchId,
          status: 'assigned'
        }
      };
    }

    const { data, error } = await supabase
      .from('dispatches')
      .update({
        driver_id: driverId,
        status: 'assigned',
        updated_at: new Date().toISOString()
      })
      .eq('id', dispatchId)
      .select()
      .single();

    if (error) throw error;

    if (data.order_id) {
      await supabase.from('orders').update({ status: 'Assigned', driver_id: driverId }).eq('id', data.order_id);
    }

    return { success: true, data };
  },

  updateStatus: async (dispatchId, status, { notes, failed_reason, lat, lng } = {}) => {
    if (await shouldFallback()) {
      let orderStatus = 'Ready for Dispatch';
      if (status === 'assigned') orderStatus = 'Assigned';
      else if (status === 'in_transit' || status === 'picked_up') orderStatus = 'Out for Delivery';
      else if (status === 'delivered') orderStatus = 'Delivered';

      const { data: o, error } = await supabase
        .from('orders')
        .update({ status: orderStatus, updated_at: new Date().toISOString() })
        .eq('id', dispatchId)
        .select()
        .single();
      if (error) throw error;

      // Add delivery event
      await supabase.from('delivery_events').insert([{
        order_id: dispatchId,
        driver_id: o.driver_id,
        event_type: status === 'delivered' ? 'delivered' : 'in_transit',
        location_lat: lat || null,
        location_lng: lng || null,
        notes: notes || `Order marked as ${status}`
      }]);

      return { success: true, data: { id: o.id, order_id: o.id } };
    }

    const updateData = { status, updated_at: new Date().toISOString() };
    if (notes) updateData.notes = notes;
    if (failed_reason) updateData.failed_reason = failed_reason;
    if (status === 'picked_up') updateData.picked_up_at = new Date().toISOString();
    if (status === 'in_transit') updateData.dispatched_at = new Date().toISOString();
    if (status === 'delivered') updateData.delivered_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('dispatches')
      .update(updateData)
      .eq('id', dispatchId)
      .select()
      .single();

    if (error) throw error;

    if (data.order_id) {
      const statusMap = {
        'picked_up': 'Picking',
        'in_transit': 'Out for Delivery',
        'delivered': 'Delivered',
        'failed': 'Cancelled',
        'returned': 'Cancelled',
      };
      const orderStatus = statusMap[status];
      if (orderStatus) {
        await supabase.from('orders').update({ status: orderStatus }).eq('id', data.order_id);
      }
    }

    if (status === 'in_transit' && data.order_id && (lat || lng)) {
      await supabase.from('delivery_events').insert([{
        order_id: data.order_id,
        driver_id: data.driver_id,
        event_type: 'in_transit',
        location_lat: lat || null,
        location_lng: lng || null,
        notes: notes || 'Driver en route',
      }]);
    }

    return { success: true, data };
  },

  deleteDispatch: async (id) => {
    if (await shouldFallback()) {
      return { success: true };
    }
    const { error } = await supabase.from('dispatches').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  getDrivers: async () => {
    // Select profiles that have Driver role
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, phone')
      .eq('role', 'Driver')
      .order('full_name');
    if (error) throw error;
    return { success: true, data: data || [] };
  },

  subscribeToDispatches: (callback) => {
    const channel = supabase
      .channel('dispatches_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, callback)
      .subscribe();

    return () => supabase.removeChannel(channel);
  },

  // ── Driver Workflow Methods ──

  // All orders currently assigned to any driver (used by the driver dashboard
  // fleet view so one screen manages every driver's deliveries).
  getAllDriverDeliveries: async () => {
    // Prefer the SECURITY DEFINER RPC: RLS hides orders that are not owned by
    // the caller, so a plain orders query only ever returns the logged-in
    // driver's own deliveries. This returns the whole fleet's.
    try {
      const { data, error } = await supabase.rpc('get_fleet_deliveries');
      if (!error && Array.isArray(data)) {
        const mapped = data.map(o => ({
          id: o.id,
          dispatch_number: o.dispatch_number,
          order_id: o.order_id,
          driver_id: o.driver_id,
          driver_name: o.driver_name,
          customer_name: o.customer_name,
          customer_phone: o.customer_phone,
          delivery_address: `${o.shipping_address || ''}, ${o.shipping_city || ''}`.replace(/^,\s*/, '').replace(/,\s*$/, ''),
          status: o.status === 'Assigned' ? 'assigned' :
                  o.status === 'Out for Delivery' ? 'in_transit' : 'delivered',
          created_at: o.created_at,
          orders: o
        }));
        return { success: true, data: mapped };
      }
    } catch (e) {
      console.warn('get_fleet_deliveries RPC unavailable, falling back:', e?.message);
    }

    let query = supabase.from('orders').select('*').in('status', ['Assigned', 'Out for Delivery', 'Delivered', 'Completed']);
    if (await shouldFallback()) {
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      const driverIds = [...new Set((data || []).map(d => d.driver_id).filter(Boolean))];
      let drivers = {};
      if (driverIds.length > 0) {
        const { data: dData } = await supabase.from('profiles').select('id, full_name').in('id', driverIds);
        drivers = Object.fromEntries((dData || []).map(d => [d.id, d.full_name]));
      }

      const mapped = (data || []).map(o => ({
        id: o.id,
        dispatch_number: o.order_number || `DISP-${o.id.substring(0, 8)}`,
        order_id: o.id,
        driver_id: o.driver_id,
        driver_name: drivers[o.driver_id] || 'Unassigned',
        customer_name: o.shipping_name || 'Customer',
        customer_phone: o.shipping_phone || '',
        delivery_address: `${o.shipping_address || ''}, ${o.shipping_city || ''}`,
        status: o.status === 'Assigned' ? 'assigned' :
                o.status === 'Out for Delivery' ? 'in_transit' : 'delivered',
        created_at: o.created_at,
        orders: o
      }));
      return { success: true, data: mapped };
    }
    const { data, error } = await supabase
      .from('dispatches')
      .select(`*, orders(*), drivers(user_name, full_name)`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { success: true, data: data || [] };
  },

  getDriverDeliveries: async (driverId) => {
    if (await shouldFallback()) {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!fk_orders_user_profiles(full_name, phone)
        `)
        .eq('driver_id', driverId)
        .order('created_at', { ascending: false });
      if (error) throw error;

      const mapped = (data || []).map(o => ({
        id: o.id,
        dispatch_number: o.order_number || `DISP-${o.id.substring(0, 8)}`,
        order_id: o.id,
        driver_id: o.driver_id,
        customer_name: o.shipping_name || 'Customer',
        customer_phone: o.shipping_phone || '',
        delivery_address: `${o.shipping_address || ''}, ${o.shipping_city || ''}`,
        status: o.status === 'Ready for Dispatch' ? 'pending' : 
                o.status === 'Assigned' ? 'assigned' : 
                o.status === 'Out for Delivery' ? 'in_transit' : 'delivered',
        created_at: o.created_at,
        orders: o
      }));
      return { success: true, data: mapped };
    }

    const { data, error } = await supabase
      .from('dispatches')
      .select(`
        *,
        orders(id, total_amount, status, order_number, payment_status,
               shipping_name, shipping_phone, shipping_address, shipping_city,
               user_id, profiles!fk_orders_user_profiles(full_name, phone))
      `)
      .eq('driver_id', driverId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { success: true, data: data || [] };
  },

  getDeliveryEvents: async (dispatchId) => {
    const { data, error } = await supabase
      .from('delivery_events')
      .select('*')
      .eq('order_id', dispatchId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return { success: true, data: data || [] };
  },

  acceptDelivery: async (dispatchId, driverId) => {
    if (await shouldFallback()) {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'Assigned', driver_id: driverId, updated_at: new Date().toISOString() })
        .eq('id', dispatchId);
      if (error) throw error;

      await supabase.from('delivery_events').insert([{
        order_id: dispatchId,
        driver_id: driverId,
        event_type: 'accepted',
        notes: 'Delivery assignment accepted'
      }]).then(() => {}).catch(() => {});

      return { success: true, data: { id: dispatchId } };
    }

    const { data, error } = await supabase.rpc('driver_accept_delivery', {
      p_dispatch_id: dispatchId,
      p_driver_id: driverId
    });
    if (error) throw error;
    return { success: true, data };
  },

  rejectDelivery: async (dispatchId, driverId, reason) => {
    if (await shouldFallback()) {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'Ready for Dispatch', driver_id: null, updated_at: new Date().toISOString() })
        .eq('id', dispatchId);
      if (error) throw error;
      await supabase.from('delivery_events').insert([{
        order_id: dispatchId,
        driver_id: driverId,
        event_type: 'rejected',
        notes: `Driver rejected assignment: ${reason || 'No reason'}`
      }]).then(() => {}).catch(() => {});
      return { success: true, data: { id: dispatchId } };
    }

    const { data, error } = await supabase.rpc('driver_reject_delivery', {
      p_dispatch_id: dispatchId,
      p_driver_id: driverId,
      p_reason: reason
    });
    if (error) throw error;
    return { success: true, data };
  },

  startDelivery: async (dispatchId, driverId, lat, lng) => {
    if (await shouldFallback()) {
      const { data: order } = await supabase.from('orders').select('id, user_id, order_number').eq('id', dispatchId).maybeSingle();

      const { error } = await supabase
        .from('orders')
        .update({ status: 'Out for Delivery', updated_at: new Date().toISOString() })
        .eq('id', dispatchId);
      if (error) throw error;

      await supabase.from('delivery_events').insert([{
        order_id: dispatchId,
        driver_id: driverId,
        event_type: 'in_transit',
        location_lat: lat || null,
        location_lng: lng || null,
        notes: 'Out for delivery'
      }]);

      await syncDriverStatus(driverId, 'On Delivery');
      if (order?.user_id) await notifyUser(order.user_id, 'Out for Delivery', `Your order ${order?.order_number || ''} is on its way!`, 'delivery');

      return { success: true, data: { id: dispatchId } };
    }

    const { data, error } = await supabase.rpc('driver_start_delivery', {
      p_dispatch_id: dispatchId,
      p_driver_id: driverId,
      p_lat: lat || null,
      p_lng: lng || null
    });
    if (error) throw error;
    return { success: true, data };
  },

  recordGps: async (dispatchId, driverId, lat, lng, locationName) => {
    if (await shouldFallback()) {
      await supabase.from('delivery_events').insert([{
        order_id: dispatchId,
        driver_id: driverId,
        event_type: 'in_transit',
        location_lat: lat,
        location_lng: lng,
        notes: `GPS checkin: ${locationName || ''}`
      }]);
      return { success: true };
    }

    const { data, error } = await supabase.rpc('driver_record_gps', {
      p_dispatch_id: dispatchId,
      p_driver_id: driverId,
      p_lat: lat,
      p_lng: lng,
      p_location_name: locationName || null
    });
    if (error) throw error;
    return { success: true, data };
  },

  completeDelivery: async ({ dispatchId, driverId, photoUrls, signatureUrl, customerName, notes, lat, lng }) => {
    if (await shouldFallback()) {
      const { data: order } = await supabase.from('orders').select('id, user_id, order_number, driver_id').eq('id', dispatchId).maybeSingle();

      // RLS silently blocks UPDATE on an order owned by another driver
      // (0 rows, no error), which previously let "Delivery completed!"
      // show but the status never persisted. Use the SECURITY DEFINER RPC
      // so fleet restrains can act on any driver's delivery.
      try {
        const { error: rpcErr } = await supabase.rpc('fleet_update_order_status', {
          p_order_id: dispatchId,
          p_status: 'Delivered',
          p_driver_id: driverId || null
        });
        if (rpcErr) throw rpcErr;
      } catch (e) {
        const { error } = await supabase
          .from('orders')
          .update({ status: 'Delivered', updated_at: new Date().toISOString() })
          .eq('id', dispatchId);
        if (error) throw error;
      }

      await supabase.from('delivery_proofs').insert([{
        order_id: dispatchId,
        driver_id: driverId,
        signature_url: signatureUrl || null,
        photo_urls: photoUrls || [],
        customer_name: customerName || null,
        notes: notes || null
      }]).then(() => {}).catch(() => {});

      await supabase.from('delivery_events').insert([{
        order_id: dispatchId,
        driver_id: driverId,
        event_type: 'delivered',
        location_lat: lat || null,
        location_lng: lng || null,
        notes: notes || 'Delivery completed'
      }]).then(() => {}).catch(() => {});

      await syncDriverStatus(driverId, 'Available');
      if (order?.user_id) await notifyUser(order.user_id, 'Delivered', `Your order ${order?.order_number || ''} has been delivered. Please confirm receipt!`, 'delivery');

      return { success: true, data: { id: dispatchId } };
    }

    const { data, error } = await supabase.rpc('driver_complete_delivery', {
      p_dispatch_id: dispatchId,
      p_driver_id: driverId,
      p_photo_urls: photoUrls || [],
      p_signature_url: signatureUrl || null,
      p_customer_name: customerName || null,
      p_notes: notes || null,
      p_lat: lat || null,
      p_lng: lng || null
    });
    if (error) throw error;
    return { success: true, data };
  },

  reportFailure: async ({ dispatchId, driverId, failureType, notes, lat, lng }) => {
    if (await shouldFallback()) {
      const { data: order } = await supabase.from('orders').select('id, user_id, order_number').eq('id', dispatchId).maybeSingle();

      const { error } = await supabase
        .from('orders')
        .update({ status: 'Cancelled', updated_at: new Date().toISOString() })
        .eq('id', dispatchId);
      if (error) throw error;

      await supabase.from('delivery_events').insert([{
        order_id: dispatchId,
        driver_id: driverId,
        event_type: 'failed',
        location_lat: lat || null,
        location_lng: lng || null,
        notes: `${failureType}: ${notes || ''}`
      }]);

      await syncDriverStatus(driverId, 'Available');
      if (order?.user_id) await notifyUser(order.user_id, 'Delivery Issue', `There was an issue delivering your order ${order?.order_number || ''}. Our team will contact you.`, 'alert');

      return { success: true, data: { id: dispatchId } };
    }

    const { data, error } = await supabase.rpc('driver_report_failure', {
      p_dispatch_id: dispatchId,
      p_driver_id: driverId,
      p_failure_type: failureType,
      p_notes: notes,
      p_lat: lat || null,
      p_lng: lng || null
    });
    if (error) throw error;
    return { success: true, data };
  },

  uploadDeliveryPhoto: async (file, driverId) => {
    const fileName = `delivery/${driverId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const { error: uploadError } = await supabase.storage.from('delivery_proofs').upload(fileName, file);
    if (uploadError) throw uploadError;
    const { data: publicUrlData } = supabase.storage.from('delivery_proofs').getPublicUrl(fileName);
    return { success: true, url: publicUrlData.publicUrl };
  },

  subscribeToDeliveryEvents: (dispatchId, callback) => {
    const channel = supabase
      .channel(`delivery-events-${dispatchId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'delivery_events',
        filter: `order_id=eq.${dispatchId}`
      }, callback)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }
};
