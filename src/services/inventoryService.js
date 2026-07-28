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
      const { data: invItems, error } = await supabase
        .from('inventory')
        .select('quantity_on_hand, quantity_reserved, reorder_level, cost_price');

      if (error) throw error;

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
        stats.total_value += qty * Number(item.cost_price || 0);
        if (qty === 0) stats.out_of_stock++;
        else if (qty <= reorder) stats.low_stock++;
        else if (qty > reorder * 5) stats.overstock++;
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
          reorder_quantity, cost_price, last_restocked,
          warehouse_locations(name),
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
        location:      inv.warehouse_locations?.name || 'Main Warehouse',
        last_restocked: inv.last_restocked,
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

    // Get default warehouse
    let { data: wh } = await supabase.from('warehouse_locations').select('id').limit(1).single();
    if (!wh) {
      const { data: newWh } = await supabase.from('warehouse_locations').insert([{ name: 'Main Warehouse' }]).select('id').single();
      wh = newWh;
    }

    const { data: newInv, error } = await supabase
      .from('inventory')
      .insert([{ product_id: productId, warehouse_id: wh.id, quantity_on_hand: 0 }])
      .select('id')
      .single();
    if (error) throw error;
    return newInv.id;
  },

  // ── Adjust Stock ───────────────────────────────────────────────
  adjustStock: async (productId, newQuantity, userId, { notes } = {}) => {
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

    const { data: movement, error } = await supabase.from('inventory_movements').insert([{
      inventory_id: inventoryId,
      movement_type: 'ADJUSTMENT',
      quantity: diff,
      reason: notes || 'Manual stock adjustment',
      user_id: userId
    }]).select().single();
    if (error) throw error;

    return { success: true, data: movement, quantity_after: qty };
  },

  // ── Get Stock Movements ────────────────────────────────────────
  getStockMovements: async (productId, { page = 1, limit = 20 } = {}) => {
    const { from, to } = pageRange(page, limit);
    
    // We need to resolve inventory_id from product_id
    const { data: invData } = await supabase.from('inventory').select('id').eq('product_id', productId).single();
    if (!invData) return { success: true, data: [], meta: responseMeta(0, page, limit) };

    const { data, count, error } = await supabase
      .from('inventory_movements')
      .select(`
        *,
        profiles:user_id(full_name)
      `, { count: 'exact' })
      .eq('inventory_id', invData.id)
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) throw error;

    return { success: true, data: data || [], meta: responseMeta(count, page, limit) };
  },

  // ── Get All Stock Movements (audit) ───────────────────────────
  getAllStockMovements: async ({ page = 1, limit = DEFAULT_LIMIT } = {}) => {
    const { from, to } = pageRange(page, limit);
    const { data, count, error } = await supabase
      .from('inventory_movements')
      .select(`*, inventory(products(title, sku)), profiles:user_id(full_name)`, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) throw error;
    return { success: true, data: data || [], meta: responseMeta(count, page, limit) };
  },

  // ── Report Damaged Stock ───────────────────────────────────────
  reportDamagedStock: async (productId, quantity, reason, userId) => {
    const inventoryId = await inventoryService.ensureInventoryRecord(productId);
    const { data, error } = await supabase.from('damaged_stock').insert([{
      inventory_id: inventoryId,
      quantity,
      reason,
      reported_by: userId
    }]).select().single();
    if (error) throw error;
    return { success: true, data };
  },

  // ── Dispose Damaged Stock (RPC) ───────────────────────────────
  disposeDamagedStock: async (damageId, userId) => {
    const { error } = await supabase.rpc('dispose_damaged_stock', {
      p_damage_id: damageId,
      p_user_id: userId
    });
    if (error) throw error;
    return { success: true };
  },

  // ── Receive Goods (RPC) ───────────────────────────────────────
  receiveGoods: async (purchaseRequestId, warehouseId, quantity, userId) => {
    const { error } = await supabase.rpc('receive_goods', {
      p_request_id: purchaseRequestId,
      p_warehouse_id: warehouseId,
      p_quantity: quantity,
      p_user_id: userId
    });
    if (error) throw error;
    
    // Also sync products.stock for legacy fallback
    // Getting product id from purchase_requests
    const { data: pr } = await supabase.from('purchase_requests').select('product_id').eq('id', purchaseRequestId).single();
    if (pr) {
       const { data: inv } = await supabase.from('inventory').select('quantity_on_hand').eq('product_id', pr.product_id).eq('warehouse_id', warehouseId).single();
       if (inv) {
          await supabase.from('products').update({ stock: inv.quantity_on_hand }).eq('id', pr.product_id);
       }
    }
    
    return { success: true };
  }
};
