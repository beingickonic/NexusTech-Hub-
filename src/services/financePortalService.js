import { supabase } from './supabaseClient';

const tableFor = { invoices: 'finance_invoices', payments: 'customer_payments', expenses: 'finance_expenses' };
const dateFieldFor = { invoices: 'created_at', payments: 'payment_date', expenses: 'expense_date' };

export const financePortalService = {
  async list(type, { page = 1, limit = 10, search = '' } = {}) {
    const table = tableFor[type];
    let query = supabase.from(table).select('*', { count: 'exact' });
    if (search) {
      const column = type === 'invoices' ? 'invoice_number' : type === 'payments' ? 'reference_number' : 'description';
      query = query.ilike(column, `%${search}%`);
    }
    const { data, count, error } = await query.order(dateFieldFor[type], { ascending: false }).range((page - 1) * limit, page * limit - 1);
    return { data: data || [], count: count || 0, error };
  },
  async save(type, record) {
    const table = tableFor[type];
    const query = record.id ? supabase.from(table).update(record).eq('id', record.id) : supabase.from(table).insert(record);
    const { data, error } = await query.select().single();
    return { data, error };
  },
  async remove(type, id) {
    return supabase.from(tableFor[type]).delete().eq('id', id);
  },
  async dashboard() {
    const [invoices, payments, expenses, transactions] = await Promise.all([
      supabase.from('finance_invoices').select('amount, paid_amount, status, created_at'),
      supabase.from('customer_payments').select('amount, payment_date, customer_name, reference_number'),
      supabase.from('finance_expenses').select('amount, expense_date, description, category, status'),
      supabase.from('transactions').select('id, type, amount, description, transaction_date').order('transaction_date', { ascending: false }).limit(10)
    ]);
    const error = invoices.error || payments.error || expenses.error || transactions.error;
    const rows = (payments.data || []).map(p => ({ ...p, type: 'payment', description: `Payment from ${p.customer_name}`, date: p.payment_date }))
      .concat((expenses.data || []).map(e => ({ ...e, type: 'expense', date: e.expense_date })))
      .sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);
    const months = Array.from({ length: 6 }, (_, index) => { const d = new Date(); d.setMonth(d.getMonth() - 5 + index); return { key: `${d.getFullYear()}-${d.getMonth()}`, month: d.toLocaleDateString(undefined, { month: 'short' }), revenue: 0, expenses: 0 }; });
    const add = (items, key, amount) => items.forEach(item => { const d = new Date(item[key]); const month = months.find(m => m.key === `${d.getFullYear()}-${d.getMonth()}`); if (month) month[amount] += Number(item.amount || 0); });
    add(payments.data || [], 'payment_date', 'revenue'); add(expenses.data || [], 'expense_date', 'expenses');
    return { data: { invoices: invoices.data || [], payments: payments.data || [], expenses: expenses.data || [], transactions: rows, months }, error };
  }
};
