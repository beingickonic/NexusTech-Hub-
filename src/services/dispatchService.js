import { supabase } from './supabaseClient';

import { DEFAULT_LIMIT, pageRange, responseMeta } from '../utils/pagination';

export const dispatchService = {
  // ── Stats ──────────────────────────────────────────────────────
  getDispatchStats: async () => {
    try {
      // Statuses match the DB schema (lowercase)
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
        .gte('delivered_at', today.toISOString());

      // pending field used by DispatchDashboard KPI card
      return {
        success: true,
        stats: {
          ...stats,
          today_delivered: todayCount || 0,
          // Convenience aliases used by DispatchDashboard
          in_transit: stats.in_transit || 0,
          Pending: stats.pending || 0, // backward compat shim
        }
      };
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
    if (search) query = query.or(`customer_name.ilike.%${search}%,dispatch_number.ilike.%${search}%,customer_phone.ilike.%${search}%`);

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
    // Ensure status is lowercase
    const payload = { ...dispatchData, status: dispatchData.status || 'pending' };
    const { data, error } = await supabase
      .from('dispatches')
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return { success: true, data };
  },

  // ── Assign Driver ──────────────────────────────────────────────
  assignDriver: async (dispatchId, driverId) => {
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
    return { success: true, data };
  },

  // ── Update Status ──────────────────────────────────────────────
  updateStatus: async (dispatchId, status, { notes, failed_reason } = {}) => {
    const updateData = { status, updated_at: new Date().toISOString() };
    if (notes) updateData.notes = notes;
    if (failed_reason) updateData.failed_reason = failed_reason;
    if (status === 'in_transit') updateData.dispatched_at = new Date().toISOString();
    if (status === 'delivered') updateData.delivered_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('dispatches')
      .update(updateData)
      .eq('id', dispatchId)
      .select()
      .single();

    if (error) throw error;

    // Sync order status when delivered
    if (status === 'delivered' && data.order_id) {
      await supabase.from('orders').update({ status: 'Delivered' }).eq('id', data.order_id);
    }

    return { success: true, data };
  },

  // ── Delete Dispatch ────────────────────────────────────────────
  deleteDispatch: async (id) => {
    const { error } = await supabase.from('dispatches').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  // ── Get Available Drivers (for assign modal) ───────────────────
  getDrivers: async () => {
    const { data, error } = await supabase
      .from('drivers')
      .select('id, full_name, phone, vehicle_number, vehicle_type, rating, photo_url')
      .eq('status', 'available')
      .order('full_name');
    if (error) throw error;
    return { success: true, data: data || [] };
  },

  // ── Realtime subscription ──────────────────────────────────────
  // Previously missing — caused TypeError crash in DispatchPage
  subscribeToDispatches: (callback) => {
    const channel = supabase
      .channel('dispatches_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dispatches' }, callback)
      .subscribe();

    // Return unsubscribe function
    return () => supabase.removeChannel(channel);
  }
};
