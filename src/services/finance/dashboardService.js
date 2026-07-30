import { supabase } from '../supabaseClient';

export const dashboardService = {
  getDashboardKpis: async () => {
    try {
      // Fetch COA Cash and Accounts Receivable/Payable totals
      const { data: coa, error: coaError } = await supabase
        .from('chart_of_accounts')
        .select('account_code, current_balance')
        .in('account_code', ['1000', '1100', '2000', '4000', '5000']);
        
      if (coaError) throw coaError;

      let cashBalance = 0;
      let arBalance = 0;
      let apBalance = 0;
      let salesRevenue = 0;
      let cogs = 0;

      coa?.forEach(acc => {
        if (acc.account_code === '1000') cashBalance = Number(acc.current_balance);
        if (acc.account_code === '1100') arBalance = Number(acc.current_balance);
        if (acc.account_code === '2000') apBalance = Number(acc.current_balance);
        if (acc.account_code === '4000') salesRevenue = Number(acc.current_balance);
        if (acc.account_code === '5000') cogs = Number(acc.current_balance);
      });

      // Fetch outstanding invoices count
      const { count: outstandingInvoices, error: arError } = await supabase
        .from('accounts_receivable')
        .select('*', { count: 'exact', head: true })
        .in('payment_status', ['pending', 'partial', 'overdue']);
        
      if (arError) throw arError;

      // Fetch pending journals
      const { count: pendingJournals, error: jeError } = await supabase
        .from('journal_entries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Pending Approval');
        
      if (jeError) throw jeError;

      // Revenue this month (using orders table as proxy for now)
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0,0,0,0);
      
      const { data: monthOrders, error: moError } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', startOfMonth.toISOString());
        
      if (moError) throw moError;
      
      const revenueThisMonth = monthOrders?.reduce((acc, o) => acc + Number(o.total_amount || 0), 0) || 0;

      // Revenue Today
      const startOfDay = new Date();
      startOfDay.setHours(0,0,0,0);
      
      const { data: todayOrders, error: toError } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', startOfDay.toISOString());
        
      if (toError) throw toError;
      
      const revenueToday = todayOrders?.reduce((acc, o) => acc + Number(o.total_amount || 0), 0) || 0;

      return {
        data: {
          revenueToday,
          revenueThisMonth,
          cashBalance,
          arBalance,
          apBalance,
          grossProfit: salesRevenue - cogs,
          outstandingInvoices: outstandingInvoices || 0,
          pendingJournals: pendingJournals || 0
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching dashboard KPIs:', error);
      return { data: null, error };
    }
  }
  ,
  getDashboardActivity: async () => {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1);
      const [ordersResult, expensesResult, transactionsResult] = await Promise.all([
        supabase.from('orders').select('total_amount, created_at').gte('created_at', sixMonthsAgo.toISOString()),
        supabase.from('expenses').select('amount, expense_date').gte('expense_date', sixMonthsAgo.toISOString()),
        supabase.from('transactions').select('id, type, category, description, amount, currency, transaction_date, status').order('transaction_date', { ascending: false }).limit(8)
      ]);
      if (ordersResult.error) throw ordersResult.error;
      if (expensesResult.error) throw expensesResult.error;
      if (transactionsResult.error) throw transactionsResult.error;

      const monthly = Array.from({ length: 6 }, (_, index) => {
        const date = new Date(); date.setMonth(date.getMonth() - (5 - index));
        return { key: `${date.getFullYear()}-${date.getMonth()}`, month: date.toLocaleDateString(undefined, { month: 'short' }), revenue: 0, expenses: 0 };
      });
      const addToMonth = (rows, valueField, target) => rows?.forEach((row) => {
        const date = new Date(row.created_at || row.expense_date);
        const item = monthly.find((entry) => entry.key === `${date.getFullYear()}-${date.getMonth()}`);
        if (item) item[target] += Number(row[valueField] || 0);
      });
      addToMonth(ordersResult.data, 'total_amount', 'revenue');
      addToMonth(expensesResult.data, 'amount', 'expenses');
      return { data: { monthly, transactions: transactionsResult.data || [] }, error: null };
    } catch (error) {
      console.error('Error fetching finance dashboard activity:', error);
      return { data: { monthly: [], transactions: [] }, error };
    }
  }
};
