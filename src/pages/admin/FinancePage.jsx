import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, DollarSign, CreditCard, PiggyBank,
  AlertCircle, Plus, Search, X, RefreshCw, Filter, Download,
  ArrowUpRight, ArrowDownRight, Calendar, Wallet, Building2,
  CheckCircle, Clock, BarChart3
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, BarChart, Bar
} from 'recharts';
import { financeService } from '../../services/financeService';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';

// ── Payment Method badge ───────────────────────────────────────
const PaymentBadge = ({ method }) => {
  const cfg = {
    cash:           { label: 'Cash',          color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/15' },
    mpesa:          { label: 'M-Pesa',         color: 'text-green-600 dark:text-green-400',    bg: 'bg-green-100 dark:bg-green-500/15' },
    paypal:         { label: 'PayPal',         color: 'text-blue-600 dark:text-blue-400',      bg: 'bg-blue-100 dark:bg-blue-500/15' },
    flutterwave:    { label: 'Flutterwave',    color: 'text-amber-600 dark:text-amber-400',    bg: 'bg-amber-100 dark:bg-amber-500/15' },
    bank_transfer:  { label: 'Bank Transfer',  color: 'text-violet-600 dark:text-violet-400',  bg: 'bg-violet-100 dark:bg-violet-500/15' },
    cheque:         { label: 'Cheque',         color: 'text-slate-600 dark:text-slate-400',    bg: 'bg-slate-100 dark:bg-slate-800' },
  }[method] || { label: method || 'Other', color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800' };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.color} ${cfg.bg}`}>{cfg.label}</span>;
};

// ── Transaction Status ─────────────────────────────────────────
const TxnStatusBadge = ({ status }) => {
  const cfg = {
    completed:  { label: 'Completed', color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-500/15' },
    pending:    { label: 'Pending',   color: 'text-amber-600',   bg: 'bg-amber-100 dark:bg-amber-500/15' },
    cancelled:  { label: 'Cancelled', color: 'text-red-600',     bg: 'bg-red-100 dark:bg-red-500/15' },
  }[status] || { label: status, color: 'text-slate-500', bg: 'bg-slate-100' };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.color} ${cfg.bg}`}>{cfg.label}</span>;
};

// ── Record Transaction Modal ───────────────────────────────────
const TransactionModal = ({ type = 'income', onClose, onSaved }) => {
  const [form, setForm] = useState({
    type,
    category: '',
    description: '',
    amount: '',
    payment_method: 'cash',
    reference: '',
    notes: '',
    created_at: new Date().toISOString().split('T')[0],
    status: 'completed'
  });
  const [loading, setLoading] = useState(false);

  const incomeCategories = ['Sales', 'Service', 'Subscription', 'Commission', 'Other Income'];
  const expenseCategories = ['Rent', 'Salaries', 'Utilities', 'Inventory', 'Transport', 'Marketing', 'Equipment', 'Other'];
  const categories = type === 'income' ? incomeCategories : expenseCategories;

  const f = (field) => ({ value: form[field], onChange: e => setForm(prev => ({ ...prev, [field]: e.target.value })) });
  const inputCls = 'w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm border-0 outline-none focus:ring-2 focus:ring-orange-500/40 text-slate-900 dark:text-white';
  const labelCls = 'block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.description) return toast.error('Fill required fields');
    setLoading(true);
    try {
      if (type === 'expense') {
        await financeService.createExpense({
          category: form.category,
          description: form.description,
          amount: Number(form.amount),
          payment_method: form.payment_method,
          created_at: form.created_at,
          notes: form.notes,
          status: 'approved'
        });
      } else {
        await financeService.createTransaction({ ...form, amount: Number(form.amount) });
      }
      toast.success(`${type === 'income' ? 'Income' : 'Expense'} recorded!`);
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to record');
    } finally {
      setLoading(false);
    }
  };

  const isIncome = type === 'income';
  const accentColor = isIncome ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">Record {isIncome ? 'Income' : 'Expense'}</h2>
            <p className="text-xs text-slate-500">{isIncome ? 'Add a new income transaction' : 'Record a business expense'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Category</label>
              <select {...f('category')} className={inputCls + ' cursor-pointer'}>
                <option value="">Select...</option>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Amount (KES) *</label>
              <input type="number" {...f('amount')} min={0} step={0.01} required placeholder="0.00" className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Description *</label>
            <input {...f('description')} required placeholder="Description..." className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Payment Method</label>
              <select {...f('payment_method')} className={inputCls + ' cursor-pointer'}>
                {[['cash','Cash'], ['mpesa','M-Pesa'], ['paypal','PayPal'], ['flutterwave','Flutterwave'], ['bank_transfer','Bank Transfer'], ['cheque','Cheque']].map(([v,l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Date</label>
              <input type="date" {...f('created_at')} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Reference</label>
            <input {...f('reference')} placeholder="Receipt/Ref no." className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Notes</label>
            <textarea {...f('notes')} rows={2} placeholder="Additional notes..." className={inputCls + ' resize-none'} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400">Cancel</button>
            <button type="submit" disabled={loading} className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50 ${accentColor}`}>
              {loading ? 'Saving...' : `Save ${isIncome ? 'Income' : 'Expense'}`}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ── Custom Tooltip for Charts ──────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl p-3 text-xs">
      <p className="font-bold text-slate-700 dark:text-slate-300 mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500 capitalize">{p.dataKey}:</span>
          <span className="font-semibold" style={{ color: p.color }}>KES {Number(p.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

// ── Main Finance Page ──────────────────────────────────────────
const FinancePage = () => {
  const [stats, setStats] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [txnLoading, setTxnLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});
  const [modal, setModal] = useState(null); // 'income' | 'expense' | null
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const fetchStats = useCallback(async () => {
    const res = await financeService.getFinanceStats();
    if (res.success) setStats(res.stats);
  }, []);

  const fetchTransactions = useCallback(async () => {
    setTxnLoading(true);
    try {
      const res = await financeService.getTransactions({
        page, type: typeFilter, search,
        startDate: dateRange.start || undefined,
        endDate: dateRange.end || undefined
      });
      if (res.success) { setTransactions(res.data); setMeta(res.meta); }
    } finally {
      setTxnLoading(false);
    }
  }, [page, typeFilter, search, dateRange]);

  const fetchChartData = useCallback(async () => {
    const end = new Date().toISOString().split('T')[0];
    const start = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const res = await financeService.getProfitLossReport(start, end);
    if (res.success) setChartData(res.data.chartData || []);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchStats(), fetchTransactions(), fetchChartData()]).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  // Realtime
  useEffect(() => {
    const unsub = financeService.subscribeToTransactions(() => {
      fetchStats();
      fetchTransactions();
    });
    return unsub;
  }, []);

  const kpiCards = [
    { label: 'Revenue Today', value: `KES ${(stats.revenue_today || 0).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/20', trend: 'up' },
    { label: 'Monthly Revenue', value: `KES ${(stats.revenue_month || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-500/20', trend: 'up' },
    { label: 'Monthly Expenses', value: `KES ${(stats.expenses_month || 0).toLocaleString()}`, icon: TrendingDown, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-500/20', trend: 'down' },
    { label: 'Net Profit', value: `KES ${(stats.profit_month || 0).toLocaleString()}`, icon: PiggyBank, color: stats.profit_month >= 0 ? 'text-violet-600 dark:text-violet-400' : 'text-red-600', bg: 'bg-violet-100 dark:bg-violet-500/20', trend: stats.profit_month >= 0 ? 'up' : 'down' },
    { label: 'Profit Margin', value: `${stats.profit_margin || 0}%`, icon: BarChart3, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-500/20' },
    { label: 'Outstanding', value: `KES ${(stats.outstanding_payments || 0).toLocaleString()}`, icon: AlertCircle, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-500/20', trend: 'warning' },
  ];

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">Finance & Accounting</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Revenue, expenses, and financial reports</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { fetchStats(); fetchTransactions(); fetchChartData(); }}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 hover:text-orange-500 transition-colors">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => setModal('expense')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors shadow-lg shadow-red-500/20">
            <TrendingDown size={15} /> Expense
          </button>
          <button onClick={() => setModal('income')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors shadow-lg shadow-emerald-500/20">
            <Plus size={15} /> Income
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpiCards.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-4 relative overflow-hidden group">
            <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full ${card.bg} blur-xl opacity-40 group-hover:opacity-70 transition-opacity`} />
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${card.bg} ${card.color} relative z-10`}><card.icon size={16} /></div>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white relative z-10 leading-tight">{card.value}</p>
            <p className="text-xs font-medium text-slate-500 mt-0.5 relative z-10">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">Profit & Loss (Last 90 Days)</h2>
            <p className="text-xs text-slate-500 mt-0.5">Monthly revenue vs expenses</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700/50" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Area type="monotone" dataKey="revenue"  stroke="#10b981" fill="url(#colorRevenue)"  strokeWidth={2} />
            <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#colorExpenses)" strokeWidth={2} />
            <Area type="monotone" dataKey="profit"   stroke="#8b5cf6" fill="url(#colorProfit)"   strokeWidth={2} strokeDasharray="5 3" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="font-bold text-slate-900 dark:text-white">Transactions</h2>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search transactions..."
                className="w-full sm:w-48 pl-9 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm border-0 outline-none" />
            </div>
            {[['all','All'], ['income','Income'], ['expense','Expense']].map(([k,l]) => (
              <button key={k} onClick={() => { setTypeFilter(k); setPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  typeFilter === k ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>{l}</button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                {['Date', 'Description', 'Category', 'Type', 'Method', 'Amount', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {txnLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-800/50">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16 text-slate-400">
                  <Wallet size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No transactions found</p>
                </td></tr>
              ) : transactions.map((txn, i) => (
                <motion.tr key={txn.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{txn.created_at || new Date(txn.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <p className="font-medium text-slate-900 dark:text-white truncate">{txn.description}</p>
                    {txn.profiles?.full_name && <p className="text-xs text-slate-400">{txn.profiles.full_name}</p>}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{txn.category || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1 text-xs font-semibold ${
                      txn.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {txn.type === 'income' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {txn.type === 'income' ? 'Income' : 'Expense'}
                    </span>
                  </td>
                  <td className="px-4 py-3"><PaymentBadge method={txn.payment_method} /></td>
                  <td className="px-4 py-3">
                    <span className={`font-bold text-sm ${txn.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {txn.type === 'income' ? '+' : '-'}KES {Number(txn.amount).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3"><TxnStatusBadge status={txn.status} /></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500">Page {meta.page} of {meta.totalPages} · {meta.total} transactions</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={meta.page <= 1}
                className="px-3 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 disabled:opacity-40">Prev</button>
              <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={meta.page >= meta.totalPages}
                className="px-3 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal && <TransactionModal type={modal} onClose={() => setModal(null)} onSaved={() => { fetchStats(); fetchTransactions(); }} />}
      </AnimatePresence>
    </div>
  );
};

export default FinancePage;
