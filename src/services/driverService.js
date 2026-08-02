import { supabase } from './supabaseClient';

import { DEFAULT_LIMIT, responseMeta } from '../utils/pagination';

const DB_STATUS = {
  available: 'Available',
  busy: 'On Delivery',
  offline: 'Off Duty',
  suspended: 'Off Duty'
};

// The drivers table only stores: Available | On Delivery | Off Duty.
// UI "suspended"/"offline" both persist as "Off Duty" (there is no suspended value),
// so anything that is not Available/On Delivery reads back as "offline".
const toDbStatus = (status) => DB_STATUS[status] || 'Available';
const toUiStatus = (dbStatus) => {
  if (dbStatus === 'Available') return 'available';
  if (dbStatus === 'On Delivery') return 'busy';
  return 'offline';
};

const parseVehicleInfo = (info = '') => {
  const [vehicle_type = '', ...rest] = String(info).split(' - ');
  return { vehicle_type, vehicle_number: rest.join(' - ') };
};

const buildVehicleInfo = (vehicle_type, vehicle_number) =>
  `${vehicle_type || ''}${vehicle_number ? ` - ${vehicle_number}` : ''}`.trim();

const fetchProfiles = async (userIds) => {
  const unique = [...new Set(userIds.filter(Boolean))];
  if (unique.length === 0) return {};
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, phone, avatar_url, role, department, status')
    .in('id', unique);
  if (error) throw error;
  return Object.fromEntries((data || []).map(p => [p.id, p]));
};

const normalizeDriver = (row, profile) => {
  const { vehicle_type, vehicle_number } = parseVehicleInfo(row.vehicle_info);
  return {
    id: row.id,
    user_id: row.user_id,
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    email: undefined,
    avatar_url: profile?.avatar_url || null,
    photo_url: profile?.avatar_url || null,
    vehicle_info: row.vehicle_info || '',
    vehicle_type,
    vehicle_number,
    license_number: row.license_number || '',
    status: toUiStatus(row.status),
    rating: 5,
    total_deliveries: row.total_deliveries || 0,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
};

const fetchDriverRows = async ({ includeAll = false, statuses = null } = {}) => {
  let query = supabase.from('drivers').select('*').order('created_at', { ascending: false });
  if (!includeAll && statuses) query = query.in('status', statuses);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

const enrichDrivers = async (rows) => {
  if (rows.length === 0) return [];
  const profiles = await fetchProfiles(rows.map(r => r.user_id));
  return rows.map(row => normalizeDriver(row, profiles[row.user_id]));
};

// Set each driver's total_deliveries from actual Delivered/Completed orders
// (drivers.total_deliveries column is stale/never maintained, so trips read 0).
const attachDeliveryCounts = async (list) => {
  if (list.length === 0) return list;
  const userIds = list.map(d => d.user_id).filter(Boolean);
  if (userIds.length === 0) return list;

  const counts = new Map();
  await Promise.all(userIds.map(async (id) => {
    const { count } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('driver_id', id)
      .in('status', ['Delivered', 'Completed']);
    counts.set(id, count || 0);
  }));

  return list.map(d => ({
    ...d,
    total_deliveries: counts.get(d.user_id) || 0
  }));
};

const todayStart = () => {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t.toISOString();
};

export const driverService = {
  // ── Stats ──────────────────────────────────────────────────────
  getDriverStats: async () => {
    try {
      const [
        availableRes,
        busyRes,
        offDutyRes,
        totalRes
      ] = await Promise.all([
        supabase.from('drivers').select('*', { count: 'exact', head: true }).eq('status', 'Available'),
        supabase.from('drivers').select('*', { count: 'exact', head: true }).eq('status', 'On Delivery'),
        supabase.from('drivers').select('*', { count: 'exact', head: true }).eq('status', 'Off Duty'),
        supabase.from('drivers').select('*', { count: 'exact', head: true })
      ]);

      // Today's deliveries across all drivers
      let todayDeliveries = 0;
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['Delivered', 'Completed'])
        .gte('delivery_confirmed_at', todayStart());
      if (!error) todayDeliveries = count || 0;

      return {
        success: true,
        stats: {
          available: availableRes.count || 0,
          busy: busyRes.count || 0,
          offline: offDutyRes.count || 0,
          suspended: 0,
          total: totalRes.count || 0,
          today_deliveries: todayDeliveries
        }
      };
    } catch (error) {
      console.error('Driver stats error:', error);
      return { success: false, stats: { available: 0, busy: 0, offline: 0, suspended: 0, total: 0, today_deliveries: 0 } };
    }
  },

  // ── Get All Drivers ────────────────────────────────────────────
  getDrivers: async ({ page = 1, limit = DEFAULT_LIMIT, search = '', status = 'all' } = {}) => {
    const rows = await fetchDriverRows({ includeAll: true });
    let list = await enrichDrivers(rows);
    list = await attachDeliveryCounts(list);

    if (status && status !== 'all') list = list.filter(d => d.status === status);

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(d =>
        (d.full_name || '').toLowerCase().includes(q) ||
        (d.phone || '').toLowerCase().includes(q) ||
        (d.vehicle_number || '').toLowerCase().includes(q) ||
        (d.license_number || '').toLowerCase().includes(q)
      );
    }

    const total = list.length;
    const start = (Number(page) - 1) * Number(limit);
    const data = list.slice(start, start + Number(limit));

    return { success: true, data, meta: responseMeta(total, page, limit) };
  },

  // ── Get Available Drivers (for dispatch) ───────────────────────
  getAvailableDrivers: async () => {
    const rows = await fetchDriverRows({ statuses: ['Available'] });
    const data = await enrichDrivers(rows);
    return { success: true, data };
  },

  // ── Get Driver by ID ───────────────────────────────────────────
  getDriver: async (id) => {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;

    const [driver] = await enrichDrivers([data]);

    // Delivery history from orders (no dispatches table)
    const { data: history } = await supabase
      .from('orders')
      .select('id, order_number, shipping_name, status, created_at')
      .eq('driver_id', data.user_id)
      .order('created_at', { ascending: false })
      .limit(20);

    const mappedHistory = (history || []).map(o => ({
      id: o.id,
      dispatch_number: o.order_number || 'ORDER',
      customer_name: o.shipping_name || 'Customer',
      status: o.status === 'Delivered' || o.status === 'Completed' ? 'available'
        : ['Assigned', 'Reserved', 'Picking', 'Pending', 'Waiting for Stock', 'Out for Delivery'].includes(o.status) ? 'busy'
        : 'offline',
      created_at: o.created_at
    }));

    return { success: true, data: driver[0], history: mappedHistory };
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

    if (!data.email || !data.password) throw new Error('Email and password are required');

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name || '',
          phone: data.phone || '',
          role: 'Driver',
          department: 'Driver'
        }
      }
    });
    if (signUpError) throw new Error(signUpError.message.includes('already') ? 'A driver with this email already exists' : signUpError.message);

    const userId = signUpData.user?.id;
    if (!userId) throw new Error('Failed to create driver account');

    let photoUrl = null;
    if (photoFile && photoFile.size > 0) {
      const fileName = `driver_${Date.now()}_${photoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { error: uploadError } = await supabase.storage
        .from('drivers')
        .upload(`photos/${fileName}`, photoFile);
      if (!uploadError) {
        photoUrl = supabase.storage.from('drivers').getPublicUrl(`photos/${fileName}`).data.publicUrl;
        await supabase.from('profiles').update({ avatar_url: photoUrl }).eq('id', userId);
      }
    }

    const { data: result, error } = await supabase
      .from('drivers')
      .insert([{
        user_id: userId,
        vehicle_info: buildVehicleInfo(data.vehicle_type, data.vehicle_number),
        license_number: data.license_number || null,
        status: toDbStatus(data.status)
      }])
      .select()
      .single();
    if (error) throw error;

    return { success: true, data: { ...result, user_id: userId, photo_url: photoUrl } };
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

    const { data: current, error: fetchError } = await supabase
      .from('drivers')
      .select('user_id')
      .eq('id', id)
      .single();
    if (fetchError) throw fetchError;

    const updates = {
      vehicle_info: buildVehicleInfo(data.vehicle_type, data.vehicle_number),
      license_number: data.license_number || null,
      status: toDbStatus(data.status),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('drivers').update(updates).eq('id', id);
    if (error) throw error;

    // Best-effort profile update (name / phone live on profiles)
    if (current.user_id) {
      const profileUpdate = {};
      if (data.full_name !== undefined) profileUpdate.full_name = data.full_name;
      if (data.phone !== undefined) profileUpdate.phone = data.phone;
      if (Object.keys(profileUpdate).length > 0) {
        await supabase.from('profiles').update(profileUpdate).eq('id', current.user_id);
      }

      if (photoFile && photoFile.size > 0) {
        const fileName = `driver_${id}_${Date.now()}_${photoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const { error: uploadError } = await supabase.storage
          .from('drivers')
          .upload(`photos/${fileName}`, photoFile);
        if (!uploadError) {
          const photoUrl = supabase.storage.from('drivers').getPublicUrl(`photos/${fileName}`).data.publicUrl;
          await supabase.from('profiles').update({ avatar_url: photoUrl }).eq('id', current.user_id);
        }
      }
    }

    return { success: true, data: { id } };
  },

  // ── Update Driver Status ───────────────────────────────────────
  updateDriverStatus: async (id, status) => {
    const { data, error } = await supabase
      .from('drivers')
      .update({ status: toDbStatus(status), updated_at: new Date().toISOString() })
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
      const { data: row } = await supabase.from('drivers').select('user_id').eq('id', driverId).single();
      const userId = row?.user_id || driverId;
      const today = todayStart();

      const [
        { count: totalCompleted },
        { count: todayDeliveries },
        { count: failedCount },
        { count: activeTrips }
      ] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('driver_id', userId).in('status', ['Delivered', 'Completed']),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('driver_id', userId).in('status', ['Delivered', 'Completed']).gte('delivery_confirmed_at', today),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('driver_id', userId).eq('status', 'Cancelled'),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('driver_id', userId).in('status', ['Assigned', 'Reserved', 'Picking', 'Pending', 'Waiting for Stock', 'Out for Delivery'])
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
