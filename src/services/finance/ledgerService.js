import { supabase } from '../supabaseClient';
import { pageRange, responseMeta } from '../../utils/pagination';

export const ledgerService = {
  getJournalEntries: async (page = 1, filters = {}) => {
    try {
      const { from, to } = pageRange(page);
      
      let query = supabase
        .from('journal_entries')
        .select(`
          *,
          created_by_profile:profiles!journal_entries_created_by_fkey(first_name, last_name),
          approved_by_profile:profiles!journal_entries_approved_by_fkey(first_name, last_name)
        `, { count: 'exact' });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.search) {
        query = query.ilike('reference_number', `%${filters.search}%`);
      }

      const { data, count, error } = await query
        .order('posting_date', { ascending: false })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        data,
        meta: responseMeta(count, page),
        error: null
      };
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      return { data: null, meta: null, error };
    }
  },

  getJournalEntryDetails: async (id) => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select(`
          *,
          created_by_profile:profiles!journal_entries_created_by_fkey(first_name, last_name),
          approved_by_profile:profiles!journal_entries_approved_by_fkey(first_name, last_name),
          lines:journal_entry_lines(
            *,
            account:chart_of_accounts(account_code, account_name)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching journal details:', error);
      return { data: null, error };
    }
  },

  createJournalEntry: async (entryData, linesData) => {
    try {
      // Create header
      const { data: entry, error: entryError } = await supabase
        .from('journal_entries')
        .insert([entryData])
        .select()
        .single();

      if (entryError) throw entryError;

      // Add lines
      const linesToInsert = linesData.map(line => ({
        ...line,
        journal_entry_id: entry.id
      }));

      const { error: linesError } = await supabase
        .from('journal_entry_lines')
        .insert(linesToInsert);

      if (linesError) throw linesError;

      return { data: entry, error: null };
    } catch (error) {
      console.error('Error creating journal entry:', error);
      return { data: null, error };
    }
  },

  updateJournalStatus: async (id, status, approvedBy = null) => {
    try {
      const updateData = { status };
      if (approvedBy) updateData.approved_by = approvedBy;

      const { data, error } = await supabase
        .from('journal_entries')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating journal status:', error);
      return { data: null, error };
    }
  }
};
