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
      const statuses = ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed', 'returned'];
      const results = await Promise.all(
        statuses.map(s =>
          supabase.from('dispatches').select('*', { count: 'exact', head: true }).eq('status', s)
        )
      );
      const stats = {};
      statuses.forEach((s, i) => { stats[s] = results[i].count || 0; });

      // Today's deliveries
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: todayCount } = await supabase
        .from('dispatches')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'delivered')
        .gte('actual_delivery', today.toISOString());

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
      .from('dispatches')
      .select(`
        *,
        orders(id, total_amount, status),
        drivers(id, full_name, phone, vehicle_number, vehicle_type, photo_url)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status && status !== 'all') query = query.eq('status', status);
    if (search) query = query.or(
      `customer_name.ilike.%${search}%,dispatch_number.ilike.%${search}%,delivery_address.ilike.%${search}%`
    );

    const { data, count, error } = await query.range(from, to);
    if (error) throw error;

    return { success: true, data: data || [], meta: responseMeta(count, page, limit) };
  },

  // ── Get Single Dispatch ────────────────────────────────────────
  getDispatch: async (id) => {
    const { data, error } = await supabase
      .from('dispatches')
      .select(`*, orders(*, order_items(*, products(title, image_url))), drivers(*)`)
      .eq('id', id)
      .single();
    if (error) throw error;
    return { success: true, data };
  },

  // ── Create Dispatch from Order ─────────────────────────────────
  createDispatch: async (dispatchData) => {
    const { data, error } = await supabase
      .from('dispatches')
      .insert([{ ...dispatchData, dispatch_number: '' }])
      .select()
      .single();
    if (error) throw error;
    return { success: true, data };
  },

  // ── Assign Driver ──────────────────────────────────────────────
  assignDriver: async (dispatchId, driverId) => {
    // Get driver info for vehicle field
    const { data: driver } = await supabase
      .from('drivers')
      .select('full_name, vehicle_number, vehicle_type')
      .eq('id', driverId)
      .single();

    const { data, error } = await supabase
      .from('dispatches')
      .update({
        driver_id: driverId,
        status: 'assigned',
        vehicle: driver ? `${driver.vehicle_type || ''} - ${driver.vehicle_number || ''}`.trim() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', dispatchId)
      .select()
      .single();
    if (error) throw error;
    return { success: true, data };
  },

  // ── Update Status ──────────────────────────────────────────────
  updateStatus: async (dispatchId, status, extra = {}) => {
    const updates = { status, updated_at: new Date().toISOString(), ...extra };
    if (status === 'delivered') updates.actual_delivery = new Date().toISOString();

    const { data, error } = await supabase
      .from('dispatches')
      .update(updates)
      .eq('id', dispatchId)
      .select()
      .single();
    if (error) throw error;
    return { success: true, data };
  },

  // ── Update Dispatch ────────────────────────────────────────────
  updateDispatch: async (id, updates) => {
    const { data, error } = await supabase
      .from('dispatches')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { success: true, data };
  },

  // ── Delete Dispatch ────────────────────────────────────────────
  deleteDispatch: async (id) => {
    const { error } = await supabase.from('dispatches').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  // ── Realtime subscription ──────────────────────────────────────
  subscribeToDispatches: (callback) => {
    const channel = supabase
      .channel('erp-dispatches')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dispatches' }, payload => callback(payload))
      .subscribe();
    return () => supabase.removeChannel(channel);
  }
};
