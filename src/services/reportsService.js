import { supabase } from './supabaseClient';

export const reportsService = {
  getRevenueKpis: async (fromDate, toDate) => {
    const { data, error } = await supabase.rpc('get_revenue_kpis', {
      p_from_date: fromDate || null,
      p_to_date: toDate || null,
    });
    if (error) throw error;
    return data;
  },

  getOrderTrends: async (days = 30, interval = 'day') => {
    const { data, error } = await supabase.rpc('get_order_trends', {
      p_days: days,
      p_interval: interval,
    });
    if (error) throw error;
    return data || [];
  },

  getDeliveryPerformance: async (fromDate, toDate) => {
    const { data, error } = await supabase.rpc('get_delivery_performance', {
      p_from_date: fromDate || null,
      p_to_date: toDate || null,
    });
    if (error) throw error;
    return data;
  },

  getInventorySummary: async () => {
    const { data, error } = await supabase.rpc('get_inventory_summary');
    if (error) throw error;
    return data;
  },

  getSupplierPerformance: async (supplierId) => {
    const { data, error } = await supabase.rpc('get_supplier_performance', {
      p_supplier_id: supplierId || null,
    });
    if (error) throw error;
    return data;
  },

  getFinanceKpis: async () => {
    const { data, error } = await supabase.rpc('get_finance_kpis');
    if (error) throw error;
    return data;
  },

  getOrderStatusDistribution: async () => {
    const { data, error } = await supabase.rpc('get_order_status_distribution');
    if (error) throw error;
    return data || [];
  },

  getTopProducts: async (limit = 10) => {
    const { data, error } = await supabase.rpc('get_top_products', { p_limit: limit });
    if (error) throw error;
    return data || [];
  },

  getCustomerStats: async () => {
    const { data, error } = await supabase.rpc('get_customer_stats');
    if (error) throw error;
    return data;
  },
};
