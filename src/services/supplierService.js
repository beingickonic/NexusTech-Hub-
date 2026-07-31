import { supabase } from './supabaseClient';

export const supplierService = {
  getProfile: async (userId) => {
    const { data, error } = await supabase.from('suppliers').select('*').eq('user_id', userId).single();
    if (error) return null;
    return data;
  },

  getDashboardStats: async (supplierId) => {
    const [poCount, deliveryCount, lowStock] = await Promise.all([
      supabase.from('purchase_orders').select('*', { count: 'exact', head: true }).eq('supplier_id', supplierId),
      supabase.from('supplier_deliveries').select('*', { count: 'exact', head: true }).eq('supplier_id', supplierId),
      supabase.rpc('check_low_stock'),
    ]);
    return {
      pendingPO: poCount.count || 0,
      deliveries: deliveryCount.count || 0,
      lowStockItems: lowStock.data || [],
    };
  },

  getPurchaseOrders: async (supplierId) => {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*, purchase_order_items(*, products(title, sku))')
      .eq('supplier_id', supplierId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  getSupplierDeliveries: async (supplierId) => {
    const { data, error } = await supabase
      .from('supplier_deliveries')
      .select('*, supplier_delivery_items(*, products(title, sku))')
      .eq('supplier_id', supplierId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  recordDelivery: async ({ purchaseOrderId, supplierId, deliveryNote, batchNumber, expiryDate, items }) => {
    const { data, error } = await supabase.rpc('receive_supplier_delivery', {
      p_purchase_order_id: purchaseOrderId,
      p_supplier_id: supplierId,
      p_delivery_note: deliveryNote || null,
      p_batch_number: batchNumber || null,
      p_expiry_date: expiryDate || null,
      p_items: items || [],
    });
    if (error) throw error;
    return data;
  },
};
