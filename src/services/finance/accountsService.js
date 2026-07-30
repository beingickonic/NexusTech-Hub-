import { supabase } from '../supabaseClient';
import { pageRange, responseMeta } from '../../utils/pagination';

export const accountsService = {
  getChartOfAccounts: async (page = 1, filters = {}) => {
    try {
      const { from, to } = pageRange(page);
      
      let query = supabase
        .from('chart_of_accounts')
        .select('*', { count: 'exact' });

      if (filters.search) {
        query = query.or(`account_code.ilike.%${filters.search}%,account_name.ilike.%${filters.search}%`);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      const { data, count, error } = await query
        .order('account_code', { ascending: true })
        .range(from, to);

      if (error) throw error;

      return {
        data,
        meta: responseMeta(count, page),
        error: null
      };
    } catch (error) {
      console.error('Error fetching chart of accounts:', error);
      return { data: null, meta: null, error };
    }
  },

  createAccount: async (accountData) => {
    try {
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .insert([accountData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating account:', error);
      return { data: null, error };
    }
  },

  updateAccount: async (id, accountData) => {
    try {
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .update(accountData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating account:', error);
      return { data: null, error };
    }
  },
  
  deleteAccount: async (id) => {
    try {
      const { error } = await supabase
        .from('chart_of_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting account:', error);
      return { error };
    }
  }
};
