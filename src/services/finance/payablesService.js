import { supabase } from '../supabaseClient';
import { pageRange, responseMeta } from '../../utils/pagination';

export const payablesService = {
  getAccountsPayable: async (page = 1, filters = {}) => {
    try {
      const { from, to } = pageRange(page);
      
      let query = supabase
        .from('accounts_payable')
        .select(`
          *,
          supplier:suppliers(name, email, phone)
        `, { count: 'exact' });

      if (filters.status) {
        query = query.eq('payment_status', filters.status);
      }

      const { data, count, error } = await query
        .order('due_date', { ascending: true })
        .range(from, to);

      if (error) throw error;

      return {
        data,
        meta: responseMeta(count, page),
        error: null
      };
    } catch (error) {
      console.error('Error fetching accounts payable:', error);
      return { data: null, meta: null, error };
    }
  },

  createPayable: async (payableData) => {
    try {
      const { data, error } = await supabase
        .from('accounts_payable')
        .insert([payableData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating payable:', error);
      return { data: null, error };
    }
  },

  approvePayable: async (id, userId) => {
    try {
      const { data, error } = await supabase
        .from('accounts_payable')
        .update({
          approval_status: 'approved',
          approved_by: userId,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error approving payable:', error);
      return { data: null, error };
    }
  },

  recordPayment: async (id, amount) => {
    try {
      // First get current record
      const { data: current, error: getError } = await supabase
        .from('accounts_payable')
        .select('amount_due, amount_paid')
        .eq('id', id)
        .single();
        
      if (getError) throw getError;
      
      const newPaid = Number(current.amount_paid) + Number(amount);
      const newStatus = newPaid >= Number(current.amount_due) ? 'paid' : 'partial';
      
      const { data, error } = await supabase
        .from('accounts_payable')
        .update({
          amount_paid: newPaid,
          payment_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error recording payment for payable:', error);
      return { data: null, error };
    }
  }
};
