import { supabase } from './supabaseClient';

import { DEFAULT_LIMIT, pageRange, responseMeta } from '../utils/pagination';

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
        { data: pendingPayments },
        { data: invAssetData },
        { data: writeOffData }
      ] = await Promise.all([
        supabase.from('transactions')
          .select('amount')
          .eq('type', 'Income')
          .gte('created_at', todayStr),
        supabase.from('transactions')
          .select('amount')
          .eq('type', 'Income')
          .gte('created_at', monthStr),
        supabase.from('transactions')
          .select('amount')
          .eq('type', 'Expense')
          .gte('created_at', monthStr),
        supabase.from('orders')
          .select('total_amount')
          .eq('payment_status', 'unpaid')
          .in('status', ['Processing', 'Shipped', 'Delivered']),
        supabase.from('inventory').select('quantity_on_hand, cost_price'),
        supabase.from('transactions').select('amount').eq('type', 'Write-off').gte('created_at', monthStr)
      ]);

      const revenueToday   = (todayIncome   || []).reduce((s, t) => s + Number(t.amount), 0);
      const revenueMonth   = (monthIncome   || []).reduce((s, t) => s + Number(t.amount), 0);
      const expensesMonth  = (monthExpenses || []).reduce((s, t) => s + Number(t.amount), 0);
      const outstanding    = (pendingPayments || []).reduce((s, o) => s + Number(o.total_amount), 0);
      
      const invValue = (invAssetData || []).reduce((s, i) => s + (Number(i.quantity_on_hand) * Number(i.cost_price || 0)), 0);
      const writeOffs = (writeOffData || []).reduce((s, t) => s + Number(t.amount), 0);

      const profitMonth    = revenueMonth - expensesMonth - writeOffs;

      return {
        success: true,
        stats: {
          revenue_today: revenueToday,
          revenue_month: revenueMonth,
          expenses_month: expensesMonth,
          profit_month: profitMonth,
          profit_margin: revenueMonth > 0 ? ((profitMonth / revenueMonth) * 100).toFixed(1) : 0,
          outstanding_payments: outstanding,
          inventory_value: invValue,
          write_offs: writeOffs
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
        profiles:recorded_by(full_name, email)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (type && type !== 'all') query = query.ilike('type', type);
    if (search) query = query.or(`description.ilike.%${search}%,category.ilike.%${search}%`);
    if (startDate) query = query.gte('created_at', startDate);
    if (endDate)   query = query.lte('created_at', endDate);

    const { data, count, error } = await query.range(from, to);
    if (error) throw error;

    return { success: true, data: data || [], meta: responseMeta(count, page, limit) };
  },

  // ── Create Transaction ─────────────────────────────────────────
  createTransaction: async (transactionData) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        type: transactionData.type || 'Income',
        category: transactionData.category || 'General',
        amount: transactionData.amount,
        description: transactionData.description || '',
        recorded_by: transactionData.recorded_by || null
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
      .update(updates)
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
      .select('*, profiles:recorded_by(full_name)', { count: 'exact' })
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
      type: 'Expense',
      category: expenseData.category,
      description: expenseData.description,
      amount: expenseData.amount,
      recorded_by: expenseData.recorded_by || null
    }]);

    return { success: true, data };
  },

  // ── Profit & Loss Report ───────────────────────────────────────
  getProfitLossReport: async (startDate, endDate) => {
    const [incomeRes, expenseRes] = await Promise.all([
      supabase.from('transactions')
        .select('amount, category, created_at')
        .eq('type', 'Income')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at'),
      supabase.from('transactions')
        .select('amount, category, created_at')
        .eq('type', 'Expense')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at')
    ]);

    const income   = incomeRes.data   || [];
    const expenses = expenseRes.data  || [];

    const totalIncome   = income.reduce((s, t) => s + Number(t.amount), 0);
    const totalExpenses = expenses.reduce((s, t) => s + Number(t.amount), 0);
    const netProfit     = totalIncome - totalExpenses;

    // Group by month for chart
    const chartMap = {};
    [...income, ...expenses].forEach(t => {
      const month = t.created_at?.slice(0, 7) || 'Unknown';
      if (!chartMap[month]) chartMap[month] = { month, revenue: 0, expenses: 0 };
    });
    income.forEach(t => {
      const month = t.created_at?.slice(0, 7) || 'Unknown';
      if (chartMap[month]) chartMap[month].revenue += Number(t.amount);
    });
    expenses.forEach(t => {
      const month = t.created_at?.slice(0, 7) || 'Unknown';
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

  // ── Realtime subscription ──────────────────────────────────────
  subscribeToTransactions: (callback) => {
    const channel = supabase
      .channel('erp-finance')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions' }, payload => callback(payload.new))
      .subscribe();
    return () => supabase.removeChannel(channel);
  }
};
