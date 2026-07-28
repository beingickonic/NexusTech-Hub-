import { supabase } from './supabaseClient';

const DEFAULT_LIMIT = 15;

const pageRange = (page = 1, limit = DEFAULT_LIMIT) => {
  const from = (Number(page) - 1) * Number(limit);
  return { from, to: from + Number(limit) - 1 };
};

const responseMeta = (count = 0, page = 1, limit = DEFAULT_LIMIT) => ({
  page: Number(page),
  limit: Number(limit),
  total: count || 0,
  totalPages: Math.max(1, Math.ceil((count || 0) / Number(limit)))
});

export const financeService = {
  // ── Finance Dashboard Stats ────────────────────────────────────
  getFinanceStats: async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString();

      const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthStr = firstOfMonth.toISOString();

      const [
        { data: todayIncome },
        { data: monthIncome },
        { data: monthExpenses },
        { data: pendingPayments }
      ] = await Promise.all([
        supabase.from('transactions')
          .select('amount')
          .eq('type', 'income')
          .eq('status', 'completed')
          .gte('created_at', todayStr),
        supabase.from('transactions')
          .select('amount')
          .eq('type', 'income')
          .eq('status', 'completed')
          .gte('created_at', monthStr),
        supabase.from('transactions')
          .select('amount')
          .eq('type', 'expense')
          .eq('status', 'completed')
          .gte('created_at', monthStr),
        supabase.from('orders')
          .select('total_amount')
          .eq('payment_status', 'unpaid')
          .in('status', ['Processing', 'Shipped', 'Delivered'])
      ]);

      const revenueToday   = (todayIncome   || []).reduce((s, t) => s + Number(t.amount), 0);
      const revenueMonth   = (monthIncome   || []).reduce((s, t) => s + Number(t.amount), 0);
      const expensesMonth  = (monthExpenses || []).reduce((s, t) => s + Number(t.amount), 0);
      const outstanding    = (pendingPayments || []).reduce((s, o) => s + Number(o.total_amount), 0);
      const profitMonth    = revenueMonth - expensesMonth;

      return {
        success: true,
        stats: {
          revenue_today: revenueToday,
          revenue_month: revenueMonth,
          expenses_month: expensesMonth,
          profit_month: profitMonth,
          profit_margin: revenueMonth > 0 ? ((profitMonth / revenueMonth) * 100).toFixed(1) : 0,
          outstanding_payments: outstanding
        }
      };
    } catch (error) {
      console.error('Finance stats error:', error);
      return { success: false, stats: {} };
    }
  },

  // ── Get Transactions ───────────────────────────────────────────
  getTransactions: async ({ page = 1, limit = DEFAULT_LIMIT, type = 'all', search = '', startDate, endDate } = {}) => {
    const { from, to } = pageRange(page, limit);
    let query = supabase
      .from('transactions')
      .select(`
        *,
        orders(id, status),
        profiles(full_name, email),
        suppliers(name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (type && type !== 'all') query = query.eq('type', type);
    if (search) query = query.or(`description.ilike.%${search}%,reference.ilike.%${search}%`);
    if (startDate) query = query.gte('transaction_date', startDate);
    if (endDate)   query = query.lte('transaction_date', endDate);

    const { data, count, error } = await query.range(from, to);
    if (error) throw error;

    return { success: true, data: data || [], meta: responseMeta(count, page, limit) };
  },

  // ── Create Transaction ─────────────────────────────────────────
  createTransaction: async (transactionData) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        ...transactionData,
        transaction_date: transactionData.transaction_date || new Date().toISOString().split('T')[0]
      }])
      .select()
      .single();
    if (error) throw error;
    return { success: true, data };
  },

  // ── Update Transaction ─────────────────────────────────────────
  updateTransaction: async (id, updates) => {
    const { data, error } = await supabase
      .from('transactions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { success: true, data };
  },

  // ── Delete Transaction ─────────────────────────────────────────
  deleteTransaction: async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  // ── Get Expenses ───────────────────────────────────────────────
  getExpenses: async ({ page = 1, limit = DEFAULT_LIMIT, search = '' } = {}) => {
    const { from, to } = pageRange(page, limit);
    let query = supabase
      .from('expenses')
      .select('*, suppliers(name), profiles(full_name)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (search) query = query.or(`description.ilike.%${search}%,category.ilike.%${search}%`);

    const { data, count, error } = await query.range(from, to);
    if (error) throw error;
    return { success: true, data: data || [], meta: responseMeta(count, page, limit) };
  },

  // ── Create Expense ─────────────────────────────────────────────
  createExpense: async (expenseData) => {
    const { data, error } = await supabase
      .from('expenses')
      .insert([expenseData])
      .select()
      .single();
    if (error) throw error;

    // Also create a transaction record for the expense
    await supabase.from('transactions').insert([{
      type: 'expense',
      category: expenseData.category,
      description: expenseData.description,
      amount: expenseData.amount,
      payment_method: expenseData.payment_method,
      supplier_id: expenseData.supplier_id || null,
      transaction_date: expenseData.expense_date || new Date().toISOString().split('T')[0],
      status: 'completed',
      notes: expenseData.notes || null
    }]);

    return { success: true, data };
  },

  // ── Get Bank Accounts ──────────────────────────────────────────
  getBankAccounts: async () => {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .order('is_default', { ascending: false });
    if (error) throw error;
    return { success: true, data: data || [] };
  },

  // ── Create Bank Account ────────────────────────────────────────
  createBankAccount: async (accountData) => {
    const { data, error } = await supabase
      .from('bank_accounts')
      .insert([accountData])
      .select()
      .single();
    if (error) throw error;
    return { success: true, data };
  },

  // ── Profit & Loss Report ───────────────────────────────────────
  getProfitLossReport: async (startDate, endDate) => {
    const [incomeRes, expenseRes] = await Promise.all([
      supabase.from('transactions')
        .select('amount, category, transaction_date')
        .eq('type', 'income')
        .eq('status', 'completed')
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate)
        .order('transaction_date'),
      supabase.from('transactions')
        .select('amount, category, transaction_date')
        .eq('type', 'expense')
        .eq('status', 'completed')
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate)
        .order('transaction_date')
    ]);

    const income   = incomeRes.data   || [];
    const expenses = expenseRes.data  || [];

    const totalIncome   = income.reduce((s, t) => s + Number(t.amount), 0);
    const totalExpenses = expenses.reduce((s, t) => s + Number(t.amount), 0);
    const netProfit     = totalIncome - totalExpenses;

    // Group by month for chart
    const chartMap = {};
    [...income, ...expenses].forEach(t => {
      const month = t.transaction_date?.slice(0, 7) || 'Unknown';
      if (!chartMap[month]) chartMap[month] = { month, revenue: 0, expenses: 0 };
    });
    income.forEach(t => {
      const month = t.transaction_date?.slice(0, 7) || 'Unknown';
      if (chartMap[month]) chartMap[month].revenue += Number(t.amount);
    });
    expenses.forEach(t => {
      const month = t.transaction_date?.slice(0, 7) || 'Unknown';
      if (chartMap[month]) chartMap[month].expenses += Number(t.amount);
    });

    const chartData = Object.values(chartMap).map(d => ({
      ...d,
      profit: d.revenue - d.expenses
    })).sort((a, b) => a.month.localeCompare(b.month));

    return {
      success: true,
      data: { income, expenses, totalIncome, totalExpenses, netProfit, chartData }
    };
  },

  // ── Revenue Report (by payment method) ────────────────────────
  getRevenueByMethod: async (startDate, endDate) => {
    const { data, error } = await supabase
      .from('transactions')
      .select('amount, payment_method')
      .eq('type', 'income')
      .eq('status', 'completed')
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate);

    if (error) throw error;

    const byMethod = {};
    (data || []).forEach(t => {
      const method = t.payment_method || 'other';
      byMethod[method] = (byMethod[method] || 0) + Number(t.amount);
    });

    return {
      success: true,
      data: Object.entries(byMethod).map(([method, amount]) => ({ method, amount }))
    };
  },

  // ── Realtime subscription ──────────────────────────────────────
  subscribeToTransactions: (callback) => {
    const channel = supabase
      .channel('erp-finance')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions' }, payload => callback(payload.new))
      .subscribe();
    return () => supabase.removeChannel(channel);
  }
};
