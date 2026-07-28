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
        supabase.from('suppliers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('suppliers').select('*', { count: 'exact', head: true }).eq('status', 'suspended')
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
        supplier_products(product_id)
      `, { count: 'exact' })
      .order('name');

    if (status && status !== 'all') query = query.eq('status', status);
    if (search) query = query.or(
      `name.ilike.%${search}%,contact_person.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
    );

    const { data, count, error } = await query.range(from, to);
    if (error) throw error;

    const suppliers = (data || []).map(s => ({
      ...s,
      products_count: s.supplier_products?.length || 0
    }));

    return { success: true, data: suppliers, meta: responseMeta(count, page, limit) };
  },

  // ── Get Supplier by ID ─────────────────────────────────────────
  getSupplier: async (id) => {
    const { data, error } = await supabase
      .from('suppliers')
      .select(`
        *,
        supplier_products(*, products(id, title, sku, price, image_url))
      `)
      .eq('id', id)
      .single();
    if (error) throw error;

    // Get purchase history from transactions
    const { data: purchases } = await supabase
      .from('transactions')
      .select('*')
      .eq('supplier_id', id)
      .eq('type', 'expense')
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
  updateSupplier: async (id, supplierData) => {
    const { data, error } = await supabase
      .from('suppliers')
      .update({ ...supplierData, updated_at: new Date().toISOString() })
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

  // ── Suspend / Activate Supplier ────────────────────────────────
  updateSupplierStatus: async (id, status) => {
    const { data, error } = await supabase
      .from('suppliers')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { success: true, data };
  },

  // ── Get Products for a Supplier ────────────────────────────────
  getSupplierProducts: async (supplierId) => {
    const { data, error } = await supabase
      .from('supplier_products')
      .select('*, products(id, title, sku, price, stock, image_url, categories(name))')
      .eq('supplier_id', supplierId);
    if (error) throw error;
    return { success: true, data: data || [] };
  },

  // ── Link Product to Supplier ───────────────────────────────────
  linkProduct: async (supplierId, productId, { unitCost, leadTimeDays, isPrimary = false } = {}) => {
    const { data, error } = await supabase
      .from('supplier_products')
      .upsert([{
        supplier_id: supplierId,
        product_id: productId,
        unit_cost: unitCost || null,
        lead_time_days: leadTimeDays || 7,
        is_primary: isPrimary
      }], { onConflict: 'supplier_id,product_id' })
      .select()
      .single();
    if (error) throw error;

    // Also update the inventory record if exists
    if (isPrimary) {
      await supabase.from('inventory').update({ supplier_id: supplierId }).eq('product_id', productId);
    }

    return { success: true, data };
  },

  // ── Unlink Product from Supplier ───────────────────────────────
  unlinkProduct: async (supplierId, productId) => {
    const { error } = await supabase
      .from('supplier_products')
      .delete()
      .eq('supplier_id', supplierId)
      .eq('product_id', productId);
    if (error) throw error;
    return { success: true };
  },

  // ── Get All Suppliers (simple list for dropdowns) ──────────────
  getSuppliersList: async () => {
    const { data, error } = await supabase
      .from('suppliers')
      .select('id, name, contact_person, phone, status')
      .eq('status', 'active')
      .order('name');
    if (error) throw error;
    return { success: true, data: data || [] };
  },

  // ── Get Supplier Performance ───────────────────────────────────
  getSupplierPerformance: async (supplierId) => {
    try {
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, created_at')
        .eq('supplier_id', supplierId)
        .eq('type', 'expense');

      const totalPurchases = (transactions || []).reduce((s, t) => s + Number(t.amount), 0);
      const orderCount     = transactions?.length || 0;

      return {
        success: true,
        data: { total_purchases: totalPurchases, order_count: orderCount }
      };
    } catch (error) {
      return { success: false, data: { total_purchases: 0, order_count: 0 } };
    }
  }
};
