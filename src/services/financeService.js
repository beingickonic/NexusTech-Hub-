import { supabase } from './supabaseClient';

const getFinanceId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
};

export const financeService = {
  getPayments: async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*, orders!inner(order_number, total_amount), profiles:user_id(full_name)')
        .order('created_at', { ascending: false });
      if (error) return [];
      return (data || []).map(p => ({
        ...p,
        payment_date: p.created_at,
        finance_invoices: { invoice_number: p.orders?.order_number },
        profiles: p.profiles || { full_name: 'N/A' },
        amount: p.amount,
        method: p.provider,
        reference: p.transaction_reference,
      }));
    } catch { return []; }
  },

  getInvoices: async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data || []).map(inv => ({
        ...inv,
        invoice_number: inv.invoice_number,
        customer: inv.customer_name,
        email: inv.customer_email,
        phone: inv.customer_phone,
        amount: Number(inv.total_amount ?? inv.subtotal ?? 0),
        balance: Number(inv.balance ?? 0),
        status: (inv.payment_status || 'PENDING').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        due_date: inv.due_date,
        created_at: inv.created_at,
      }));
    } catch { return []; }
  },

  createInvoice: async (payload) => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  updateInvoice: async (id, payload) => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  deleteInvoice: async (id) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getExpenses: async () => { return []; },
  getDashboardStats: async () => {
    try {
      const [
        { count: pendingCount },
        { count: approvedTodayCount },
        { count: rejectedCount },
        { data: pendingOrders },
        { data: totalApproved },
      ] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'Pending Finance Approval'),
        supabase.from('orders').select('*', { count: 'exact', head: true })
          .eq('status', 'Finance Approved')
          .gte('finance_approved_at', new Date().toISOString().slice(0, 10)),
        supabase.from('orders').select('*', { count: 'exact', head: true })
          .eq('finance_status', 'rejected')
          .gte('finance_approved_at', new Date().toISOString().slice(0, 10)),
        supabase.from('orders').select('total_amount, payment_method')
          .eq('status', 'Pending Finance Approval'),
        supabase.from('orders').select('total_amount')
          .eq('status', 'Finance Approved'),
      ]);

      const totalPendingRevenue = pendingOrders?.reduce((s, o) => s + Number(o.total_amount || 0), 0) || 0;
      const totalApprovedRevenue = totalApproved?.reduce((s, o) => s + Number(o.total_amount || 0), 0) || 0;

      return {
        success: true,
        stats: {
          pendingApprovals: pendingCount || 0,
          approvedToday: approvedTodayCount || 0,
          rejectedToday: rejectedCount || 0,
          pendingRevenue: totalPendingRevenue,
          approvedRevenue: totalApprovedRevenue,
        },
      };
    } catch (error) {
      return { success: false, stats: { pendingApprovals: 0, approvedToday: 0, rejectedToday: 0, pendingRevenue: 0, approvedRevenue: 0 } };
    }
  },

  getPendingApprovals: async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:user_id (id, full_name, phone),
          order_items (quantity, price, products:product_id (title, image_url)),
          payments (id, amount, provider, transaction_reference, status, created_at)
        `)
        .in('status', ['Pending Finance Approval', 'Paid'])
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getApprovalHistory: async ({ page = 1, limit = 20 } = {}) => {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      const { data, count, error } = await supabase
        .from('finance_approvals')
        .select('*, orders!inner(order_number, total_amount), profiles:handled_by(full_name)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      return { success: true, data: data || [], count };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  approvePayment: async (orderId, notes) => {
    try {
      const officerId = await getFinanceId();
      const { data, error } = await supabase.rpc('finance_approve_order', {
        p_order_id: orderId,
        p_officer_id: officerId,
        p_notes: notes || null,
      });
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  rejectPayment: async (orderId, notes) => {
    try {
      const officerId = await getFinanceId();
      const { data, error } = await supabase.rpc('finance_reject_order', {
        p_order_id: orderId,
        p_officer_id: officerId,
        p_notes: notes,
      });
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  investigatePayment: async (orderId, notes) => {
    try {
      const officerId = await getFinanceId();
      const { data, error } = await supabase.rpc('finance_investigate_order', {
        p_order_id: orderId,
        p_officer_id: officerId,
        p_notes: notes,
      });
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getOrderInvoice: async (orderId) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (quantity, price, products:product_id (title, sku, image_url)),
          profiles:user_id (full_name, phone),
          payments (id, amount, provider, transaction_reference, status, created_at),
          finance_approvals (action, handled_by, notes, created_at)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  subscribeToNewApprovals: (callback) => {
    const channel = supabase
      .channel('finance-approvals')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'finance_approvals',
      }, callback)
      .subscribe();
    return () => supabase.removeChannel(channel);
  },
};
