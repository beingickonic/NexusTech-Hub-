import { supabase } from './supabaseClient';

import { DEFAULT_LIMIT, pageRange, responseMeta } from '../utils/pagination';

// ── Inventory Health Classification ──────────────────────────────
export const classifyInventoryHealth = (item) => {
  const qty     = item.quantity_on_hand ?? 0;
  const reorder = item.reorder_level    ?? 10;
  const max     = item.max_stock        ?? reorder * 5;
  const safety  = item.safety_stock     ?? Math.floor(reorder * 0.5);
  const lastSale = item.last_sale_date ? new Date(item.last_sale_date) : null;
  const daysSinceLastSale = lastSale
    ? Math.floor((Date.now() - lastSale.getTime()) / 86400000)
    : 9999;

  if (qty <= 0)                              return 'out_of_stock';
  if (qty < 0)                               return 'negative';
  if (qty > max)                             return 'overstocked';
  if (daysSinceLastSale > 180)               return 'dead_stock';
  if (daysSinceLastSale > 60 && qty > reorder * 2) return 'slow_moving';
  if (qty <= reorder)                        return 'low_stock';
  return 'healthy';
};

export const inventoryService = {
  // ── Dashboard Stats ──────────────────────────────────────────────
  getDashboardStats: async () => {
    try {
      const [invRes, prRes, movRes, whRes, alertRes, supRes] = await Promise.all([
        supabase.from('inventory').select('quantity_on_hand, quantity_reserved, reorder_level, cost_price, last_restocked'),
        supabase.from('purchase_requests').select('status, quantity'),
        supabase.from('inventory_movements').select('movement_type, quantity').gte('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString()),
        supabase.from('warehouse_locations').select('capacity, current_utilization'),
        supabase.from('stock_alerts').select('id').eq('status', 'active'),
        supabase.from('suppliers').select('id', { count: 'exact' })
      ]);

      const invItems = invRes.data || [];
      const stats = {
        totalProducts: invItems.length,
        totalInventory: 0,
        availableStock: 0,
        reservedStock: 0,
        inTransitStock: 0,
        inventoryValue: 0,
        lowStock: 0,
        outOfStock: 0,
        overstock: 0,
        healthyStock: 0,
        slowMoving: 0,
        deadStock: 0,
        incoming: 0,
        pendingRequests: 0,
        receivedToday: 0,
        adjustmentsToday: 0,
        warehouseCapacity: 0,
        inventoryHealthScore: 0,
        activeAlerts: alertRes.data?.length || 0,
        totalSuppliers: supRes.count || 0,
        openPOs: 0,
        approvedPOs: 0,
        receivedPOs: 0
      };

      invItems.forEach(item => {
        const qty      = item.quantity_on_hand || 0;
        const reserved = item.quantity_reserved || 0;
        const reorder  = item.reorder_level || 10;
        stats.totalInventory += qty;
        stats.availableStock += Math.max(0, qty - reserved);
        stats.reservedStock  += reserved;
        stats.inventoryValue += qty * Number(item.cost_price || 0);
        const health = classifyInventoryHealth(item);
        if      (health === 'out_of_stock') stats.outOfStock++;
        else if (health === 'low_stock')    stats.lowStock++;
        else if (health === 'overstocked')  stats.overstock++;
        else if (health === 'slow_moving')  stats.slowMoving++;
        else if (health === 'dead_stock')   stats.deadStock++;
        else                                stats.healthyStock++;
      });

      if (stats.totalProducts > 0) {
        stats.inventoryHealthScore = Math.round((stats.healthyStock / stats.totalProducts) * 100);
      }

      (prRes.data || []).forEach(pr => {
        const s = (pr.status || '').toLowerCase();
        if (s === 'pending' || s === 'awaiting approval') { stats.pendingRequests++; stats.openPOs++; }
        else if (s === 'draft') stats.openPOs++;
        else if (s === 'approved') { stats.incoming += pr.quantity || 0; stats.approvedPOs++; }
        else if (s === 'in transit') { stats.incoming += pr.quantity || 0; stats.inTransitStock += pr.quantity || 0; }
        else if (s === 'received') stats.receivedPOs++;
      });

      (movRes.data || []).forEach(m => {
        if (m.movement_type === 'IN' || m.movement_type === 'RECEIPT') stats.receivedToday += Math.abs(m.quantity || 0);
        if (m.movement_type === 'ADJUSTMENT') stats.adjustmentsToday++;
      });

      let totalCap = 0, totalUtil = 0;
      (whRes.data || []).forEach(wh => {
        totalCap  += Number(wh.capacity || 0);
        totalUtil += Number(wh.current_utilization || 0);
      });
      stats.warehouseCapacity = totalCap > 0 ? Math.round((totalUtil / totalCap) * 100) : 0;

      return { success: true, stats };
    } catch (error) {
      console.error('getDashboardStats error:', error);
      return { success: false, stats: {} };
    }
  },

  // ── Dashboard Activity ───────────────────────────────────────────
  getDashboardActivity: async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_movements')
        .select('id, movement_type, quantity, reason, created_at, profiles:user_id(full_name), inventory(products(title))')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return {
        success: true,
        activity: (data || []).map(m => ({
          id: m.id,
          type: m.movement_type,
          quantity: m.quantity,
          reason: m.reason,
          date: m.created_at,
          user: m.profiles?.full_name || 'System',
          product: m.inventory?.products?.title || 'Unknown Product'
        }))
      };
    } catch (error) {
      console.error('getDashboardActivity error:', error);
      return { success: false, activity: [] };
    }
  },

  // ── Inventory Health ─────────────────────────────────────────────
  getInventoryHealth: async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('id, quantity_on_hand, quantity_reserved, reorder_level, cost_price, last_restocked, products(title, sku), warehouse_locations(name)');
      if (error) throw error;

      const summary = { healthy: 0, low_stock: 0, out_of_stock: 0, overstocked: 0, slow_moving: 0, dead_stock: 0 };
      const items = (data || []).map(inv => {
        const status = classifyInventoryHealth(inv);
        const key = status === 'out_of_stock' ? 'out_of_stock' : status;
        if (summary[key] !== undefined) summary[key]++;
        return { ...inv, health_status: status };
      });
      const total = items.length;
      const healthScore = total > 0 ? Math.round((summary.healthy / total) * 100) : 0;
      return { success: true, data: items, summary, healthScore };
    } catch (error) {
      console.error('getInventoryHealth error:', error);
      return { success: false, data: [], summary: {}, healthScore: 0 };
    }
  },

  // ── Stock Alerts ─────────────────────────────────────────────────
  getStockAlerts: async ({ status = 'active', limit = 50 } = {}) => {
    try {
      let query = supabase
        .from('stock_alerts')
        .select('*, products(title, sku), warehouse_locations(name)')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (status !== 'all') query = query.eq('status', status);
      const { data, error } = await query;
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('getStockAlerts error:', error);
      return { success: false, data: [] };
    }
  },

  acknowledgeAlert: async (alertId) => {
    const { error } = await supabase.from('stock_alerts').update({ status: 'acknowledged', is_read: true, updated_at: new Date().toISOString() }).eq('id', alertId);
    if (error) throw error;
    return { success: true };
  },

  resolveAlert: async (alertId) => {
    const { error } = await supabase.from('stock_alerts').update({ status: 'resolved', updated_at: new Date().toISOString() }).eq('id', alertId);
    if (error) throw error;
    return { success: true };
  },

  markAlertsRead: async () => {
    const { error } = await supabase.from('stock_alerts').update({ is_read: true }).eq('is_read', false);
    if (error) throw error;
    return { success: true };
  },

  // ── Warehouses ───────────────────────────────────────────────────
  getWarehouses: async () => {
    try {
      const { data, error } = await supabase.from('warehouse_locations').select('*').order('name');
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, data: [] };
    }
  },

  createWarehouse: async (warehouseData) => {
    const { data, error } = await supabase.from('warehouse_locations').insert([warehouseData]).select().single();
    if (error) throw error;
    return { success: true, data };
  },

  updateWarehouse: async (id, warehouseData) => {
    const { data, error } = await supabase.from('warehouse_locations').update(warehouseData).eq('id', id).select().single();
    if (error) throw error;
    return { success: true, data };
  },

  deleteWarehouse: async (id) => {
    const { error } = await supabase.from('warehouse_locations').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  // ── Purchase Requests / Orders ───────────────────────────────────
  getPurchaseRequests: async ({ page = 1, limit = DEFAULT_LIMIT, search = '', filterStatus = '' } = {}) => {
    const { from, to } = pageRange(page, limit);
    let query = supabase
      .from('purchase_requests')
      .select('*, suppliers(name), warehouse_locations(name), products(title, sku), profiles:requested_by(full_name), approver:approved_by(full_name)', { count: 'exact' })
      .order('created_at', { ascending: false });
    if (search) query = query.or(`products.title.ilike.%${search}%`);
    if (filterStatus) query = query.eq('status', filterStatus);
    const { data, count, error } = await query.range(from, to);
    if (error) throw error;
    return { success: true, data: data || [], meta: responseMeta(count, page, limit) };
  },

  createPurchaseRequest: async (reqData) => {
    const { data, error } = await supabase.from('purchase_requests').insert([reqData]).select().single();
    if (error) throw error;
    return { success: true, data };
  },

  updatePurchaseRequest: async (id, reqData) => {
    const { data, error } = await supabase.from('purchase_requests').update({ ...reqData, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return { success: true, data };
  },

  deletePurchaseRequest: async (id) => {
    const { error } = await supabase.from('purchase_requests').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  updatePurchaseRequestStatus: async (id, status, extra = {}) => {
    const { data, error } = await supabase.from('purchase_requests').update({ status, updated_at: new Date().toISOString(), ...extra }).eq('id', id).select().single();
    if (error) throw error;
    return { success: true, data };
  },

  // ── Inventory Items ────────────────────────────────────────────────
  getInventoryItems: async ({ page = 1, limit = DEFAULT_LIMIT, search = '', filter = 'all' } = {}) => {
    const { from, to } = pageRange(page, limit);
    let query = supabase
      .from('products')
      .select('id, title, sku, stock, price, image_url, categories(name), inventory(id, quantity_on_hand, quantity_reserved, reorder_level, reorder_quantity, cost_price, last_restocked, warehouse_id, warehouse_locations(name), suppliers(name))', { count: 'exact' })
      .order('title');
    if (search)         query = query.or(`title.ilike.%${search}%,sku.ilike.%${search}%`);
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
      const health    = classifyInventoryHealth({ quantity_on_hand: qtyOnHand, reorder_level: reorder });
      return {
        ...product,
        inventory_id:       inv.id,
        category_name:      product.categories?.name,
        quantity_on_hand:   qtyOnHand,
        quantity_reserved:  reserved,
        quantity_available: available,
        reorder_level:      reorder,
        reorder_quantity:   inv.reorder_quantity ?? 50,
        cost_price:         inv.cost_price,
        location:           inv.warehouse_locations?.name || 'Main Warehouse',
        warehouse_id:       inv.warehouse_id,
        last_restocked:     inv.last_restocked,
        supplier_name:      inv.suppliers?.name,
        stock_status:       health
      };
    });
    return { success: true, data: items, meta: responseMeta(count, page, limit) };
  },

  ensureInventoryRecord: async (productId, warehouseId = null) => {
    const { data: existing } = await supabase
      .from('inventory').select('id').eq('product_id', productId).single();
    if (existing) return existing.id;

    let wh = null;
    if (warehouseId) {
      wh = { id: warehouseId };
    } else {
      const { data } = await supabase.from('warehouse_locations').select('id').limit(1).single();
      wh = data;
      if (!wh) {
        const { data: newWh } = await supabase.from('warehouse_locations').insert([{ name: 'Main Warehouse' }]).select('id').single();
        wh = newWh;
      }
    }

    const { data: newInv, error } = await supabase
      .from('inventory').insert([{ product_id: productId, warehouse_id: wh?.id, quantity_on_hand: 0 }]).select('id').single();
    if (error) throw error;
    return newInv.id;
  },

  adjustStock: async (productId, newQuantity, userId, { notes } = {}) => {
    const qty = Number(newQuantity);
    if (qty < 0) throw new Error('Quantity cannot be negative');
    const inventoryId = await inventoryService.ensureInventoryRecord(productId);
    const { data: current } = await supabase.from('inventory').select('quantity_on_hand').eq('id', inventoryId).single();
    const before = current?.quantity_on_hand || 0;
    const diff   = qty - before;
    await supabase.from('inventory').update({ quantity_on_hand: qty, updated_at: new Date().toISOString() }).eq('id', inventoryId);
    await supabase.from('products').update({ stock: qty }).eq('id', productId);
    const { data: movement, error } = await supabase.from('inventory_movements').insert([{
      inventory_id:  inventoryId,
      movement_type: 'ADJUSTMENT',
      quantity:      diff,
      reason:        notes || 'Manual stock adjustment',
      user_id:       userId
    }]).select().single();
    if (error) throw error;
    return { success: true, data: movement, quantity_after: qty };
  },

  // ── Stock Movements ─────────────────────────────────────────────
  getStockMovements: async (productId, { page = 1, limit = 20 } = {}) => {
    const { from, to } = pageRange(page, limit);
    const { data: invData } = await supabase.from('inventory').select('id').eq('product_id', productId).single();
    if (!invData) return { success: true, data: [], meta: responseMeta(0, page, limit) };
    const { data, count, error } = await supabase
      .from('inventory_movements')
      .select('*, profiles:user_id(full_name)', { count: 'exact' })
      .eq('inventory_id', invData.id)
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) throw error;
    return { success: true, data: data || [], meta: responseMeta(count, page, limit) };
  },

  getAllStockMovements: async ({ page = 1, limit = DEFAULT_LIMIT } = {}) => {
    const { from, to } = pageRange(page, limit);
    const { data, count, error } = await supabase
      .from('inventory_movements')
      .select('*, inventory(products(title, sku), warehouse_locations(name)), profiles:user_id(full_name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) throw error;
    return { success: true, data: data || [], meta: responseMeta(count, page, limit) };
  },

  // ── Damaged Stock ────────────────────────────────────────────────
  reportDamagedStock: async (reportData) => {
    const { data, error } = await supabase.from('damaged_stock').insert([reportData]).select().single();
    if (error) throw error;
    return { success: true, data };
  },

  getDamagedStock: async ({ page = 1, limit = DEFAULT_LIMIT } = {}) => {
    const { from, to } = pageRange(page, limit);
    try {
      const { data, count, error } = await supabase
        .from('damaged_stock')
        .select('*, inventory(products(title, sku), warehouse_locations(name)), profiles:reported_by(full_name), approver:approved_by(full_name)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);
      if (error) throw error;
      return { success: true, data: data || [], meta: responseMeta(count, page, limit) };
    } catch (error) {
      console.error('getDamagedStock error:', error);
      return { success: false, data: [] };
    }
  },

  updateDamagedStockStatus: async (id, status, extra = {}) => {
    const { data, error } = await supabase
      .from('damaged_stock')
      .update({ status, updated_at: new Date().toISOString(), ...extra })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { success: true, data };
  },

  disposeDamagedStock: async (damageId, userId) => {
    const { error } = await supabase.rpc('dispose_damaged_stock', { p_damage_id: damageId, p_user_id: userId });
    if (error) throw error;
    return { success: true };
  },

  // ── Goods Received ───────────────────────────────────────────────
  receiveGoods: async (purchaseRequestId, warehouseId, quantity, userId) => {
    const { error } = await supabase.rpc('receive_goods', {
      p_request_id:   purchaseRequestId,
      p_warehouse_id: warehouseId,
      p_quantity:     quantity,
      p_user_id:      userId
    });
    if (error) throw error;
    const { data: pr } = await supabase.from('purchase_requests').select('product_id').eq('id', purchaseRequestId).single();
    if (pr) {
      const { data: inv } = await supabase.from('inventory').select('quantity_on_hand').eq('product_id', pr.product_id).eq('warehouse_id', warehouseId).single();
      if (inv) await supabase.from('products').update({ stock: inv.quantity_on_hand }).eq('id', pr.product_id);
    }
    return { success: true };
  },

  // ── Stock Transfers ──────────────────────────────────────────────
  getTransfers: async ({ page = 1, limit = DEFAULT_LIMIT, status = '' } = {}) => {
    const { from, to } = pageRange(page, limit);
    let query = supabase
      .from('stock_transfers')
      .select('*, products(title, sku), from_warehouse:from_warehouse_id(name), to_warehouse:to_warehouse_id(name), requester:requested_by(full_name), approver:approved_by(full_name)', { count: 'exact' })
      .order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    const { data, count, error } = await query.range(from, to);
    if (error) throw error;
    return { success: true, data: data || [], meta: responseMeta(count, page, limit) };
  },

  createTransfer: async (transferData) => {
    const refNum = 'TRF-' + Date.now().toString(36).toUpperCase();
    const { data, error } = await supabase.from('stock_transfers').insert([{ ...transferData, reference_number: refNum }]).select().single();
    if (error) throw error;
    return { success: true, data };
  },

  updateTransferStatus: async (id, status, extra = {}) => {
    const { data, error } = await supabase
      .from('stock_transfers')
      .update({ status, updated_at: new Date().toISOString(), ...extra })
      .eq('id', id).select().single();
    if (error) throw error;
    return { success: true, data };
  },

  executeTransfer: async (productId, sourceWarehouseId, destWarehouseId, quantity, userId) => {
    const { error } = await supabase.rpc('transfer_stock', {
      p_product_id:          productId,
      p_source_warehouse_id: sourceWarehouseId,
      p_dest_warehouse_id:   destWarehouseId,
      p_quantity:            quantity,
      p_user_id:             userId
    });
    if (error) throw error;
    return { success: true };
  },

  // ── Suppliers ─────────────────────────────────────────────────────
  getSuppliers: async ({ page = 1, limit = DEFAULT_LIMIT, search = '' } = {}) => {
    const { from, to } = pageRange(page, limit);
    let query = supabase.from('suppliers').select('*', { count: 'exact' }).order('name');
    if (search) query = query.ilike('name', `%${search}%`);
    const { data, count, error } = await query.range(from, to);
    if (error) throw error;
    return { success: true, data: data || [], meta: responseMeta(count, page, limit) };
  },
  
  createSupplier: async (supplierData) => {
    const { data, error } = await supabase.from('suppliers').insert([supplierData]).select().single();
    if (error) throw error;
    return { success: true, data };
  },

  updateSupplier: async (id, supplierData) => {
    const { data, error } = await supabase.from('suppliers').update(supplierData).eq('id', id).select().single();
    if (error) throw error;
    return { success: true, data };
  },
  
  deleteSupplier: async (id) => {
    // Soft delete if possible, otherwise hard delete
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  // ── Products (for dropdowns) ──────────────────────────────────────
  getProducts: async () => {
    const { data, error } = await supabase.from('products').select('id, title, sku, stock, price').order('title').limit(500);
    if (error) throw error;
    return { success: true, data: data || [] };
  },

  // ── Inventory Order Approvals (reserve stock after finance) ──────
  getOrdersAwaitingInventoryApproval: async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*), profiles!fk_orders_user_profiles(full_name, phone)')
      .in('status', ['Finance Approved', 'Waiting for Stock'])
      .order('created_at', { ascending: false });
    if (error) throw error;

    const orders = data || [];
    const productIds = [...new Set(orders.flatMap(o => (o.order_items || []).map(i => i.product_id).filter(Boolean)))];
    let products = [];
    if (productIds.length) {
      const { data: pData, error: pError } = await supabase.from('products').select('id, title, sku, price').in('id', productIds);
      if (!pError) products = pData || [];
    }
    const productMap = Object.fromEntries(products.map(p => [p.id, p]));
    return {
      success: true,
      data: orders.map(o => ({
        ...o,
        items: (o.order_items || []).map(i => ({
          ...i,
          title: productMap[i.product_id]?.title || i.product_name || 'Product',
          sku: productMap[i.product_id]?.sku || i.sku,
          price: i.price ?? productMap[i.product_id]?.price ?? 0
        }))
      }))
    };
  },

  inventoryApproveOrder: async (orderId, userId, notes) => {
    const { data, error } = await supabase.rpc('inventory_approve_order', {
      p_order_id: orderId,
      p_officer_id: userId,
      p_notes: notes || null
    });
    if (error) throw error;
    return { success: true, data };
  },

  inventoryRejectOrder: async (orderId, userId, notes) => {
    const { data, error } = await supabase.rpc('inventory_reject_order', {
      p_order_id: orderId,
      p_officer_id: userId,
      p_notes: notes || 'Rejected by inventory manager'
    });
    if (error) throw error;
    return { success: true, data };
  }
};
