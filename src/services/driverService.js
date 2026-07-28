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

export const driverService = {
  // ── Stats ──────────────────────────────────────────────────────
  getDriverStats: async () => {
    try {
      const statuses = ['available', 'busy', 'offline', 'suspended'];
      const results = await Promise.all(
        statuses.map(s =>
          supabase.from('drivers').select('*', { count: 'exact', head: true }).eq('status', s)
        )
      );
      const stats = {};
      statuses.forEach((s, i) => { stats[s] = results[i].count || 0; });

      const { count: total } = await supabase
        .from('drivers')
        .select('*', { count: 'exact', head: true });

      // Today's deliveries across all drivers
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: todayDeliveries } = await supabase
        .from('dispatches')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'delivered')
        .gte('actual_delivery', today.toISOString());

      return { success: true, stats: { ...stats, total: total || 0, today_deliveries: todayDeliveries || 0 } };
    } catch (error) {
      console.error('Driver stats error:', error);
      return { success: false, stats: { available: 0, busy: 0, offline: 0, suspended: 0, total: 0 } };
    }
  },

  // ── Get All Drivers ────────────────────────────────────────────
  getDrivers: async ({ page = 1, limit = DEFAULT_LIMIT, search = '', status = 'all' } = {}) => {
    const { from, to } = pageRange(page, limit);
    let query = supabase
      .from('drivers')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status && status !== 'all') query = query.eq('status', status);
    if (search) query = query.or(
      `full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%,vehicle_number.ilike.%${search}%`
    );

    const { data, count, error } = await query.range(from, to);
    if (error) throw error;

    return { success: true, data: data || [], meta: responseMeta(count, page, limit) };
  },

  // ── Get Available Drivers (for dispatch) ───────────────────────
  getAvailableDrivers: async () => {
    const { data, error } = await supabase
      .from('drivers')
      .select('id, full_name, phone, vehicle_number, vehicle_type, rating, photo_url')
      .eq('status', 'available')
      .order('full_name');
    if (error) throw error;
    return { success: true, data: data || [] };
  },

  // ── Get Driver by ID ───────────────────────────────────────────
  getDriver: async (id) => {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;

    // Get delivery history
    const { data: history } = await supabase
      .from('dispatches')
      .select('*, orders(total_amount)')
      .eq('driver_id', id)
      .order('created_at', { ascending: false })
      .limit(20);

    return { success: true, data, history: history || [] };
  },

  // ── Create Driver ──────────────────────────────────────────────
  createDriver: async (driverData) => {
    let data = { ...driverData };
    let photoFile = null;

    if (driverData instanceof FormData) {
      data = Object.fromEntries(driverData.entries());
      photoFile = driverData.get('photo');
      delete data.photo;
    }

    if (photoFile && photoFile.size > 0) {
      const fileName = `driver_${Date.now()}_${photoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { error: uploadError } = await supabase.storage
        .from('drivers')
        .upload(`photos/${fileName}`, photoFile);
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('drivers').getPublicUrl(`photos/${fileName}`);
        data.photo_url = urlData.publicUrl;
      }
    }

    const { data: result, error } = await supabase
      .from('drivers')
      .insert([data])
      .select()
      .single();
    if (error) throw error;
    return { success: true, data: result };
  },

  // ── Update Driver ──────────────────────────────────────────────
  updateDriver: async (id, driverData) => {
    let data = { ...driverData };
    let photoFile = null;

    if (driverData instanceof FormData) {
      data = Object.fromEntries(driverData.entries());
      photoFile = driverData.get('photo');
      delete data.photo;
    }

    if (photoFile && photoFile.size > 0) {
      const fileName = `driver_${id}_${Date.now()}_${photoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { error: uploadError } = await supabase.storage
        .from('drivers')
        .upload(`photos/${fileName}`, photoFile);
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('drivers').getPublicUrl(`photos/${fileName}`);
        data.photo_url = urlData.publicUrl;
      }
    }

    const { data: result, error } = await supabase
      .from('drivers')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { success: true, data: result };
  },

  // ── Update Driver Status ───────────────────────────────────────
  updateDriverStatus: async (id, status) => {
    const { data, error } = await supabase
      .from('drivers')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { success: true, data };
  },

  // ── Delete Driver ──────────────────────────────────────────────
  deleteDriver: async (id) => {
    const { error } = await supabase.from('drivers').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  // ── Get Driver Delivery Stats ──────────────────────────────────
  getDriverDeliveryStats: async (driverId) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [
        { count: totalCompleted },
        { count: todayDeliveries },
        { count: failedCount },
        { count: activeTrips }
      ] = await Promise.all([
        supabase.from('dispatches').select('*', { count: 'exact', head: true }).eq('driver_id', driverId).eq('status', 'delivered'),
        supabase.from('dispatches').select('*', { count: 'exact', head: true }).eq('driver_id', driverId).eq('status', 'delivered').gte('actual_delivery', today.toISOString()),
        supabase.from('dispatches').select('*', { count: 'exact', head: true }).eq('driver_id', driverId).eq('status', 'failed'),
        supabase.from('dispatches').select('*', { count: 'exact', head: true }).eq('driver_id', driverId).in('status', ['assigned', 'picked_up', 'in_transit'])
      ]);

      return {
        success: true,
        stats: {
          total_completed: totalCompleted || 0,
          today_deliveries: todayDeliveries || 0,
          failed: failedCount || 0,
          active_trips: activeTrips || 0
        }
      };
    } catch (error) {
      return { success: false, stats: { total_completed: 0, today_deliveries: 0, failed: 0, active_trips: 0 } };
    }
  }
};
