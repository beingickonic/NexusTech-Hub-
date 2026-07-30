import { supabase } from '../../services/supabaseClient';
import { pageRange, responseMeta } from '../../utils/pagination';

export const getExpenses = async ({ page = 1, limit = 10, search = '', status = 'All' } = {}) => {
  try {
    let query = supabase.from('expenses').select('*', { count: 'exact' });

    if (status !== 'All') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.ilike('description', `%${search}%`);
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
    console.error('Error fetching expenses:', error);
    return { success: false, message: error.message };
  }
};

export const createExpense = async (expenseData) => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert([expenseData])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error creating expense:', error);
    return { success: false, message: error.message };
  }
};

export const updateExpenseStatus = async (id, status) => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating expense status:', error);
    return { success: false, message: error.message };
  }
};
