import { supabase } from './supabaseClient';

const DEFAULT_LIMIT = 15;

const pageRange = (page = 1, limit = DEFAULT_LIMIT) => {
  const from = (Number(page) - 1) * Number(limit);
  return { from, to: from + Number(limit) - 1 };
};

const responseMeta = (count = 0, page = 1, limit = DEFAULT_LIMIT) => ({
  page: Number(page),
  limit: Number(limit),
  total: count || 0,
  totalPages: Math.max(1, Math.ceil((count || 0) / Number(limit)))
});

export const dispatchService = {
  // ── Stats ──────────────────────────────────────────────────────
  getDispatchStats: async () => {
    try {
      const statuses = ['Pending', 'Packed', 'Ready', 'Out For Delivery', 'Delivered', 'Failed'];
      const results = await Promise.all(
        statuses.map(s =>
          supabase.from('dispatch_orders').select('*', { count: 'exact', head: true }).eq('status', s)
        )
      );
      const stats = {};
      statuses.forEach((s, i) => { stats[s] = results[i].count || 0; });

      // Today's deliveries
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: todayCount } = await supabase
        .from('dispatch_orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Delivered')
        .gte('delivered_at', today.toISOString());

      return { success: true, stats: { ...stats, today_delivered: todayCount || 0 } };
    } catch (error) {
      console.error('Dispatch stats error:', error);
      return { success: false, stats: {} };
    }
  },

  // ── Get Dispatches ─────────────────────────────────────────────
  getDispatches: async ({ page = 1, limit = DEFAULT_LIMIT, status = 'all', search = '' } = {}) => {
    const { from, to } = pageRange(page, limit);
    let query = supabase
      .from('dispatch_orders')
      .select(`
        *,
        orders(id, total_amount, status),
        drivers(id, vehicle_info)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status && status !== 'all') query = query.ilike('status', status);
    
    // Simplistic search for now, could search by order ID
    if (search) query = query.or(`notes.ilike.%${search}%`);

    const { data, count, error } = await query.range(from, to);
    if (error) throw error;

    return { success: true, data: data || [], meta: responseMeta(count, page, limit) };
  },

  // ── Get Single Dispatch ────────────────────────────────────────
  getDispatch: async (id) => {
    const { data, error } = await supabase
      .from('dispatch_orders')
      .select(`*, orders(*, order_items(*, products(title, image_url))), drivers(*)`)
      .eq('id', id)
      .single();
    if (error) throw error;
    return { success: true, data };
  },

  // ── Create Dispatch from Order ─────────────────────────────────
  createDispatch: async (dispatchData) => {
    const { data, error } = await supabase
      .from('dispatch_orders')
      .insert([dispatchData])
      .select()
      .single();
    if (error) throw error;
    return { success: true, data };
  },

  // ── Assign Driver ──────────────────────────────────────────────
  assignDriver: async (dispatchId, driverId) => {
    const { data, error } = await supabase
      .from('dispatch_orders')
      .update({ 
        driver_id: driverId, 
        status: 'Out For Delivery', 
        updated_at: new Date().toISOString() 
      })
      .eq('id', dispatchId)
      .select()
      .single();
      
    if (error) throw error;
    return { success: true, data };
  },

  // ── Update Status ──────────────────────────────────────────────
  updateStatus: async (dispatchId, status, { notes } = {}) => {
    const updateData = { status, updated_at: new Date().toISOString() };
    if (notes) updateData.notes = notes;
    if (status === 'Out For Delivery') updateData.dispatched_at = new Date().toISOString();
    if (status === 'Delivered') updateData.delivered_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('dispatch_orders')
      .update(updateData)
      .eq('id', dispatchId)
      .select()
      .single();
      
    if (error) throw error;

    // Trigger Order status sync if Delivered
    if (status === 'Delivered' && data.order_id) {
       await supabase.from('orders').update({ status: 'Delivered' }).eq('id', data.order_id);
    }

    return { success: true, data };
  },

  // ── Get Drivers ────────────────────────────────────────────────
  getDrivers: async () => {
    const { data, error } = await supabase
      .from('drivers')
      .select('*, profiles:user_id(full_name, phone, photo_url)')
      .eq('status', 'Available');
    if (error) throw error;
    return { success: true, data: data || [] };
  }
};
