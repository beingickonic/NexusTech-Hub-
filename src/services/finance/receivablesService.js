import { supabase } from '../supabaseClient';
import { pageRange, responseMeta } from '../../utils/pagination';

export const receivablesService = {
  getAccountsReceivable: async (page = 1, filters = {}) => {
    try {
      const { from, to } = pageRange(page);
      
      let query = supabase
        .from('accounts_receivable')
        .select(`
          *,
          customer:profiles!accounts_receivable_customer_id_fkey(first_name, last_name, email),
          order:orders(id, order_number, total_amount)
        `, { count: 'exact' });

      if (filters.status) {
        query = query.eq('payment_status', filters.status);
      }
      if (filters.search) {
        // basic search on customer or order would require a view or edge function, 
        // for now we fetch and filter or just don't support deep search on relations without RPC.
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
      console.error('Error fetching accounts receivable:', error);
      return { data: null, meta: null, error };
    }
  },

  getAgingReport: async () => {
    try {
      // For a real aging report, you'd typically use a Postgres RPC or View.
      // Doing a simplified fetch for now.
      const { data, error } = await supabase
        .from('accounts_receivable')
        .select('amount_due, amount_paid, due_date')
        .in('payment_status', ['pending', 'partial', 'overdue']);

      if (error) throw error;

      const report = {
        current: 0,
        days30: 0,
        days60: 0,
        days90: 0,
        days90Plus: 0,
        total: 0
      };

      const now = new Date();
      
      data?.forEach(record => {
        const outstanding = Number(record.amount_due) - Number(record.amount_paid);
        if (outstanding <= 0) return;

        const due = new Date(record.due_date);
        const diffTime = now - due;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        report.total += outstanding;

        if (diffDays <= 0) {
          report.current += outstanding;
        } else if (diffDays <= 30) {
          report.days30 += outstanding;
        } else if (diffDays <= 60) {
          report.days60 += outstanding;
        } else if (diffDays <= 90) {
          report.days90 += outstanding;
        } else {
          report.days90Plus += outstanding;
        }
      });

      return { data: report, error: null };
    } catch (error) {
      console.error('Error generating aging report:', error);
      return { data: null, error };
    }
  },

  recordPayment: async (id, amount) => {
    try {
      // First get current record
      const { data: current, error: getError } = await supabase
        .from('accounts_receivable')
        .select('amount_due, amount_paid')
        .eq('id', id)
        .single();
        
      if (getError) throw getError;
      
      const newPaid = Number(current.amount_paid) + Number(amount);
      const newStatus = newPaid >= Number(current.amount_due) ? 'paid' : 'partial';
      
      const { data, error } = await supabase
        .from('accounts_receivable')
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
      console.error('Error recording payment:', error);
      return { data: null, error };
    }
  }
};
