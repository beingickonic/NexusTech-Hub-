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

export const inventoryService = {
  // ── Stats ──────────────────────────────────────────────────────
  getInventoryStats: async () => {
    try {
      const { data: invItems } = await supabase
        .from('inventory')
        .select('quantity_on_hand, quantity_reserved, reorder_level, cost_price, products(title, price)');

      const stats = {
        total_items: invItems?.length || 0,
        total_value: 0,
        low_stock: 0,
        out_of_stock: 0,
        overstock: 0
      };

      (invItems || []).forEach(item => {
        const qty = item.quantity_on_hand || 0;
        const reorder = item.reorder_level || 10;
        const cost = item.cost_price || item.products?.price || 0;
        stats.total_value += qty * Number(cost);
        if (qty === 0) stats.out_of_stock++;
        else if (qty <= reorder) stats.low_stock++;
        else if (qty > reorder * 5) stats.overstock++;
      });

      // Also check products.stock for items not in inventory table
      const { data: products } = await supabase
        .from('products')
        .select('stock, price')
        .not('id', 'in', `(SELECT product_id FROM inventory WHERE product_id IS NOT NULL)`);

      (products || []).forEach(p => {
        const qty = p.stock || 0;
        stats.total_value += qty * Number(p.price || 0);
        if (qty === 0) stats.out_of_stock++;
        else if (qty <= 10) stats.low_stock++;
      });

      return { success: true, stats };
    } catch (error) {
      console.error('Inventory stats error:', error);
      return { success: false, stats: { total_items: 0, total_value: 0, low_stock: 0, out_of_stock: 0, overstock: 0 } };
    }
  },

  // ── Get Inventory Items ────────────────────────────────────────
  getInventoryItems: async ({ page = 1, limit = DEFAULT_LIMIT, search = '', filter = 'all' } = {}) => {
    const { from, to } = pageRange(page, limit);

    let query = supabase
      .from('products')
      .select(`
        id, title, sku, stock, price, image_url,
        categories(name),
        inventory(
          id, quantity_on_hand, quantity_reserved, reorder_level,
          reorder_quantity, cost_price, location, last_restocked, supplier_id,
          suppliers(name)
        )
      `, { count: 'exact' })
      .order('title');

    if (search) query = query.or(`title.ilike.%${search}%,sku.ilike.%${search}%`);
    if (filter === 'low')  query = query.gt('stock', 0).lte('stock', 10);
    if (filter === 'out')  query = query.eq('stock', 0);
    if (filter === 'over') query = query.gt('stock', 100);

    const { data, count, error } = await query.range(from, to);
    if (error) throw error;

    const items = (data || []).map(product => {
      const inv = product.inventory?.[0] || {};
      const qtyOnHand = inv.quantity_on_hand ?? product.stock ?? 0;
      const reserved  = inv.quantity_reserved ?? 0;
      const available = Math.max(0, qtyOnHand - reserved);
      const reorder   = inv.reorder_level ?? 10;

      let stockStatus = 'in_stock';
      if (qtyOnHand === 0)           stockStatus = 'out_of_stock';
      else if (qtyOnHand <= reorder) stockStatus = 'low_stock';
      else if (qtyOnHand > reorder * 5) stockStatus = 'overstock';

      return {
        ...product,
        inventory_id:  inv.id,
        category_name: product.categories?.name,
        quantity_on_hand: qtyOnHand,
        quantity_reserved: reserved,
        quantity_available: available,
        reorder_level: reorder,
        reorder_quantity: inv.reorder_quantity ?? 50,
        cost_price:    inv.cost_price,
        location:      inv.location,
        last_restocked: inv.last_restocked,
        supplier_id:   inv.supplier_id,
        supplier_name: inv.suppliers?.name,
        stock_status:  stockStatus
      };
    });

    return { success: true, data: items, meta: responseMeta(count, page, limit) };
  },

  // ── Ensure inventory record exists ────────────────────────────
  ensureInventoryRecord: async (productId) => {
    const { data: existing } = await supabase
      .from('inventory')
      .select('id')
      .eq('product_id', productId)
      .single();

    if (existing) return existing.id;

    const { data: product } = await supabase
      .from('products')
      .select('stock, sku')
      .eq('id', productId)
      .single();

    const { data: newInv, error } = await supabase
      .from('inventory')
      .insert([{ product_id: productId, quantity_on_hand: product?.stock || 0, sku: product?.sku }])
      .select('id')
      .single();
    if (error) throw error;
    return newInv.id;
  },

  // ── Add Stock ──────────────────────────────────────────────────
  addStock: async (productId, quantity, { supplierId, unitCost, notes, reference } = {}) => {
    const qty = Number(quantity);
    if (qty <= 0) throw new Error('Quantity must be positive');

    const inventoryId = await inventoryService.ensureInventoryRecord(productId);

    // Get current quantity
    const { data: current } = await supabase
      .from('inventory')
      .select('quantity_on_hand')
      .eq('id', inventoryId)
      .single();

    const before = current?.quantity_on_hand || 0;
    const after  = before + qty;

    // Update inventory
    await supabase.from('inventory').update({
      quantity_on_hand: after,
      supplier_id: supplierId || null,
      cost_price: unitCost || null,
      last_restocked: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).eq('id', inventoryId);

    // Update products.stock
    await supabase.from('products').update({ stock: after }).eq('id', productId);

    // Log movement
    const { data: movement, error } = await supabase.from('stock_movements').insert([{
      product_id: productId,
      inventory_id: inventoryId,
      supplier_id: supplierId || null,
      movement_type: 'purchase',
      quantity: qty,
      quantity_before: before,
      quantity_after: after,
      unit_cost: unitCost || null,
      reference: reference || null,
      notes: notes || null
    }]).select().single();
    if (error) throw error;

    return { success: true, data: movement, quantity_after: after };
  },

  // ── Remove Stock ───────────────────────────────────────────────
  removeStock: async (productId, quantity, { reason = 'damage', notes, reference } = {}) => {
    const qty = Number(quantity);
    if (qty <= 0) throw new Error('Quantity must be positive');

    const inventoryId = await inventoryService.ensureInventoryRecord(productId);
    const { data: current } = await supabase
      .from('inventory')
      .select('quantity_on_hand')
      .eq('id', inventoryId)
      .single();

    const before = current?.quantity_on_hand || 0;
    if (qty > before) throw new Error(`Cannot remove ${qty}. Only ${before} available.`);

    const after = before - qty;

    await supabase.from('inventory').update({
      quantity_on_hand: after,
      updated_at: new Date().toISOString()
    }).eq('id', inventoryId);

    await supabase.from('products').update({ stock: after }).eq('id', productId);

    const { data: movement, error } = await supabase.from('stock_movements').insert([{
      product_id: productId,
      inventory_id: inventoryId,
      movement_type: reason,
      quantity: -qty,
      quantity_before: before,
      quantity_after: after,
      reference: reference || null,
      notes: notes || null
    }]).select().single();
    if (error) throw error;

    return { success: true, data: movement, quantity_after: after };
  },

  // ── Adjust Stock ───────────────────────────────────────────────
  adjustStock: async (productId, newQuantity, { notes } = {}) => {
    const qty = Number(newQuantity);
    if (qty < 0) throw new Error('Quantity cannot be negative');

    const inventoryId = await inventoryService.ensureInventoryRecord(productId);
    const { data: current } = await supabase
      .from('inventory')
      .select('quantity_on_hand')
      .eq('id', inventoryId)
      .single();

    const before = current?.quantity_on_hand || 0;
    const diff   = qty - before;

    await supabase.from('inventory').update({
      quantity_on_hand: qty,
      updated_at: new Date().toISOString()
    }).eq('id', inventoryId);

    await supabase.from('products').update({ stock: qty }).eq('id', productId);

    const { data: movement, error } = await supabase.from('stock_movements').insert([{
      product_id: productId,
      inventory_id: inventoryId,
      movement_type: 'adjustment',
      quantity: diff,
      quantity_before: before,
      quantity_after: qty,
      notes: notes || 'Manual stock adjustment'
    }]).select().single();
    if (error) throw error;

    return { success: true, data: movement, quantity_after: qty };
  },

  // ── Update Inventory Record Settings ──────────────────────────
  updateInventorySettings: async (inventoryId, updates) => {
    const { data, error } = await supabase
      .from('inventory')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', inventoryId)
      .select()
      .single();
    if (error) throw error;
    return { success: true, data };
  },

  // ── Get Stock Movements ────────────────────────────────────────
  getStockMovements: async (productId, { page = 1, limit = 20 } = {}) => {
    const { from, to } = pageRange(page, limit);
    const { data, count, error } = await supabase
      .from('stock_movements')
      .select(`
        *,
        profiles(full_name),
        suppliers(name)
      `, { count: 'exact' })
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) throw error;

    return { success: true, data: data || [], meta: responseMeta(count, page, limit) };
  },

  // ── Get All Stock Movements (audit) ───────────────────────────
  getAllStockMovements: async ({ page = 1, limit = DEFAULT_LIMIT } = {}) => {
    const { from, to } = pageRange(page, limit);
    const { data, count, error } = await supabase
      .from('stock_movements')
      .select(`*, products(title, sku), profiles(full_name), suppliers(name)`, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) throw error;
    return { success: true, data: data || [], meta: responseMeta(count, page, limit) };
  },

  // ── Low Stock Products ─────────────────────────────────────────
  getLowStockProducts: async (limit = 10) => {
    const { data, error } = await supabase
      .from('products')
      .select('id, title, sku, stock, image_url')
      .lte('stock', 10)
      .gt('stock', 0)
      .order('stock', { ascending: true })
      .limit(limit);
    if (error) throw error;
    return { success: true, data: data || [] };
  },

  // ── Realtime subscription ──────────────────────────────────────
  subscribeToInventoryAlerts: (callback) => {
    const channel = supabase
      .channel('erp-inventory-alerts')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' }, payload => {
        const product = payload.new;
        if (product.stock <= 0 || product.stock <= 10) callback({ type: 'low_stock', product });
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }
};
