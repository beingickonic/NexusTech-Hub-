import { supabase } from '../../services/supabaseClient';
import { pageRange, responseMeta } from '../../utils/pagination';

export const getCustomerPayments = async ({ page = 1, limit = 10, search = '' } = {}) => {
  try {
    let query = supabase.from('customer_payments').select('*, profiles!customer_payments_customer_id_fkey(full_name), finance_invoices!customer_payments_invoice_id_fkey(invoice_number)', { count: 'exact' });

    if (search) {
      query = query.ilike('reference_number', `%${search}%`);
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
    console.error('Error fetching payments:', error);
    return { success: false, message: error.message };
  }
};

export const createCustomerPayment = async (paymentData) => {
  try {
    const { data, error } = await supabase
      .from('customer_payments')
      .insert([paymentData])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error creating payment:', error);
    return { success: false, message: error.message };
  }
};
