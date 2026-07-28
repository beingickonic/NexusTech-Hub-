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

export const supplierService = {
  // ── Stats ──────────────────────────────────────────────────────
  getSupplierStats: async () => {
    try {
      const [
        { count: total },
        { count: active },
        { count: suspended }
      ] = await Promise.all([
        supabase.from('suppliers').select('*', { count: 'exact', head: true }),
        supabase.from('suppliers').select('*', { count: 'exact', head: true }).eq('status', 'Active'),
        supabase.from('suppliers').select('*', { count: 'exact', head: true }).eq('status', 'Suspended')
      ]);

      return {
        success: true,
        stats: { total: total || 0, active: active || 0, suspended: suspended || 0 }
      };
    } catch (error) {
      return { success: false, stats: { total: 0, active: 0, suspended: 0 } };
    }
  },

  // ── Get Suppliers ──────────────────────────────────────────────
  getSuppliers: async ({ page = 1, limit = DEFAULT_LIMIT, search = '', status = 'all' } = {}) => {
    const { from, to } = pageRange(page, limit);
    let query = supabase
      .from('suppliers')
      .select(`
        *,
        purchase_requests(id)
      `, { count: 'exact' })
      .order('name');

    if (status && status !== 'all') query = query.ilike('status', status);
    if (search) query = query.or(
      `name.ilike.%${search}%,contact_person.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
    );

    const { data, count, error } = await query.range(from, to);
    if (error) throw error;

    const suppliers = (data || []).map(s => ({
      ...s,
      products_count: s.purchase_requests?.length || 0 // approximate logic using POs
    }));

    return { success: true, data: suppliers, meta: responseMeta(count, page, limit) };
  },

  // ── Get Supplier by ID ─────────────────────────────────────────
  getSupplier: async (id) => {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;

    // Get purchase history from purchase_requests
    const { data: purchases } = await supabase
      .from('purchase_requests')
      .select('*, products(title, sku, image_url)')
      .eq('supplier_id', id)
      .order('created_at', { ascending: false })
      .limit(20);

    return { success: true, data, purchases: purchases || [] };
  },

  // ── Create Supplier ────────────────────────────────────────────
  createSupplier: async (supplierData) => {
    const { data, error } = await supabase
      .from('suppliers')
      .insert([supplierData])
      .select()
      .single();
    if (error) throw error;
    return { success: true, data };
  },

  // ── Update Supplier ────────────────────────────────────────────
  updateSupplier: async (id, updates) => {
    const { data, error } = await supabase
      .from('suppliers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { success: true, data };
  },

  // ── Delete Supplier ────────────────────────────────────────────
  deleteSupplier: async (id) => {
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  // ── Create Purchase Request ────────────────────────────────────
  createPurchaseRequest: async (requestData) => {
    const { data, error } = await supabase
      .from('purchase_requests')
      .insert([requestData])
      .select()
      .single();
    if (error) throw error;
    return { success: true, data };
  }
};
