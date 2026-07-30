import { supabase } from './supabaseClient';

export const financeService = {
  // ── INVOICES ──────────────────────────────────────────────
  getInvoices: async () => {
    const { data, error } = await supabase
      .from('finance_invoices')
      .select('*, profiles:customer_id(full_name, company_name)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  createInvoice: async (invoice) => {
    const { data, error } = await supabase.from('finance_invoices').insert([invoice]).select();
    if (error) throw error;
    return data[0];
  },
  updateInvoice: async (id, updates) => {
    const { data, error } = await supabase.from('finance_invoices').update(updates).eq('id', id).select();
    if (error) throw error;
    return data[0];
  },
  deleteInvoice: async (id) => {
    const { error } = await supabase.from('finance_invoices').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // ── PAYMENTS ──────────────────────────────────────────────
  getPayments: async () => {
    const { data, error } = await supabase
      .from('finance_payments')
      .select('*, finance_invoices(invoice_number), profiles:customer_id(full_name)')
      .order('payment_date', { ascending: false });
    if (error) throw error;
    return data;
  },
  createPayment: async (payment) => {
    const { data, error } = await supabase.from('finance_payments').insert([payment]).select();
    if (error) throw error;
    return data[0];
  },
  updatePayment: async (id, updates) => {
    const { data, error } = await supabase.from('finance_payments').update(updates).eq('id', id).select();
    if (error) throw error;
    return data[0];
  },
  deletePayment: async (id) => {
    const { error } = await supabase.from('finance_payments').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // ── EXPENSES ──────────────────────────────────────────────
  getExpenses: async () => {
    const { data, error } = await supabase
      .from('finance_expenses')
      .select('*')
      .order('expense_date', { ascending: false });
    if (error) throw error;
    return data;
  },
  createExpense: async (expense) => {
    const { data, error } = await supabase.from('finance_expenses').insert([expense]).select();
    if (error) throw error;
    return data[0];
  },
  updateExpense: async (id, updates) => {
    const { data, error } = await supabase.from('finance_expenses').update(updates).eq('id', id).select();
    if (error) throw error;
    return data[0];
  },
  deleteExpense: async (id) => {
    const { error } = await supabase.from('finance_expenses').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // ── DASHBOARD STATS ───────────────────────────────────────
  getDashboardStats: async () => {
    // 1. Total Revenue (from Paid invoices only)
    const { data: revInvoices, error: revErr } = await supabase.from('finance_invoices').select('amount').eq('status', 'Paid');
    if (revErr) throw revErr;
    const totalRevenue = revInvoices.reduce((sum, i) => sum + Number(i.amount), 0);

    // 2. Cash Received (from Finance Payments)
    const { data: payments, error: payErr } = await supabase.from('finance_payments').select('amount');
    if (payErr) throw payErr;
    const cashReceived = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    // 3. Outstanding Receivables (from Issued, Partially Paid, Overdue)
    const { data: outInvoices, error: outErr } = await supabase.from('finance_invoices').select('balance').in('status', ['Issued', 'Partially Paid', 'Overdue']);
    if (outErr) throw outErr;
    const outstandingReceivables = outInvoices.reduce((sum, i) => sum + Number(i.balance), 0);

    // 4. Total Expenses (from Approved, Paid)
    const { data: expenses, error: expErr } = await supabase.from('finance_expenses').select('amount').in('status', ['Approved', 'Paid']);
    if (expErr) throw expErr;
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    // 5. Cash Balance
    const cashBalance = cashReceived - totalExpenses;

    // 6. Pending Expense Approvals
    const { count: pendingExpenses, error: pendErr } = await supabase.from('finance_expenses').select('*', { count: 'exact', head: true }).eq('status', 'Submitted');
    if (pendErr) throw pendErr;

    // 7. Overdue Invoices
    const { count: overdueInvoices, error: overdueErr } = await supabase.from('finance_invoices').select('*', { count: 'exact', head: true }).eq('status', 'Overdue');
    if (overdueErr) throw overdueErr;

    return {
      totalRevenue,
      cashReceived,
      outstandingReceivables,
      totalExpenses,
      cashBalance,
      pendingExpenses: pendingExpenses || 0,
      overdueInvoices: overdueInvoices || 0
    };
  }
};
