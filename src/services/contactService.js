import { supabase } from './supabaseClient';

/**
 * Submit a contact/support form message to the database.
 * Inserts into support_tickets table.
 */
export const submitContactForm = async ({ name, email, subject, message }) => {
  try {
    // Get user if logged in (optional linkage)
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('support_tickets').insert({
      user_id: user?.id || null,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      priority: 'normal',
      status: 'open',
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message || 'Failed to submit your message.' };
  }
};

/**
 * Get support tickets submitted by the current user.
 */
export const getMyTickets = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, data: [] };

    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, message: error.message, data: [] };
  }
};

const contactService = { submitContactForm, getMyTickets };
export default contactService;
