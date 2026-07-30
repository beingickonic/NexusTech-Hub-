import { supabase } from '../../services/supabaseClient';
import { pageRange, responseMeta } from '../../utils/pagination';

export const getInvoices = async ({ page = 1, limit = 10, search = '', status = 'All' } = {}) => {
  try {
    let query = supabase.from('finance_invoices').select('*, profiles!finance_invoices_customer_id_fkey(full_name, email)', { count: 'exact' });

    if (status !== 'All') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.ilike('invoice_number', `%${search}%`);
    }

    const { from, to } = pageRange(page, limit);
    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;

    return {
      success: true,
      data,
      meta: responseMeta(count, page, limit)
    };
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return { success: false, message: error.message };
  }
};

export const updateInvoiceStatus = async (id, status) => {
  try {
    const { data, error } = await supabase
      .from('finance_invoices')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating invoice status:', error);
    return { success: false, message: error.message };
  }
};
