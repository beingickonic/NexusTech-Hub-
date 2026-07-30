import React, { useState, useEffect } from 'react';
import { financeService } from '../../services/financeService';
import { DollarSign, FileText, CreditCard, Receipt, TrendingUp, TrendingDown, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

const StatCard = ({ title, value, icon: Icon, trend }) => (
  <div className="bg-white/10 dark:bg-slate-800/50 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-6 rounded-2xl shadow-xl">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-rose-500/20 text-rose-500 rounded-xl">
        <Icon size={24} />
      </div>
      {trend && (
        <span className={`text-sm font-medium flex items-center ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend >= 0 ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">KSh {Number(value).toLocaleString()}</p>
  </div>
);

const FinanceDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    cashReceived: 0,
    outstandingReceivables: 0,
    totalExpenses: 0,
    cashBalance: 0,
    pendingExpenses: 0,
    overdueInvoices: 0
  });
  const [loading, setLoading] = useState(true);

  const canEdit = !['Admin', 'Auditor'].includes(user?.role);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await financeService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Error loading finance stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading Dashboard...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Finance Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Overview of financial performance</p>
        </div>
        {canEdit && (
          <div className="flex gap-3">
            <Link to="/finance/invoices" className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl flex items-center transition-colors">
              <Plus size={18} className="mr-2" /> New Invoice
            </Link>
            <Link to="/finance/expenses" className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2 rounded-xl flex items-center transition-colors">
              <Plus size={18} className="mr-2" /> Add Expense
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={stats.totalRevenue} icon={DollarSign} trend={12} />
        <StatCard title="Cash Received" value={stats.cashReceived} icon={DollarSign} trend={5} />
        <StatCard title="Outstanding Receivables" value={stats.outstandingReceivables} icon={FileText} trend={-2} />
        <StatCard title="Total Expenses" value={stats.totalExpenses} icon={Receipt} trend={8} />
        <StatCard title="Cash Balance" value={stats.cashBalance} icon={CreditCard} trend={4} />
        <StatCard title="Pending Expenses" value={stats.pendingExpenses} icon={Receipt} />
        <StatCard title="Overdue Invoices" value={stats.overdueInvoices} icon={FileText} trend={-1} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Quick Actions</h2>
          {[
            ...(canEdit ? [
              { title: 'Create Invoice', desc: 'Generate a new customer invoice', icon: FileText, to: '/finance/invoices' },
              { title: 'Record Payment', desc: 'Log an incoming customer payment', icon: CreditCard, to: '/finance/payments' },
              { title: 'Add Expense', desc: 'Submit a new business expense', icon: Receipt, to: '/finance/expenses' },
            ] : []),
            { title: 'Generate Report', desc: 'View financial reports', icon: TrendingUp, to: '/finance/reports' },
          ].map((action, i) => (
            <Link key={i} to={action.to} className="group flex items-center justify-between p-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl hover:bg-white/80 dark:hover:bg-slate-700/80 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-100 dark:bg-rose-500/20 text-rose-500 rounded-xl group-hover:scale-110 transition-transform">
                  <action.icon size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-white">{action.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{action.desc}</p>
                </div>
              </div>
              <ArrowRight size={20} className="text-slate-400 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>

        {/* Recent Activity Placeholder for Phase 1 */}
        <div className="lg:col-span-2 bg-white/10 dark:bg-slate-800/50 backdrop-blur-lg border border-white/20 dark:border-slate-700/50 p-6 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Recent Activity</h2>
            <Link to="/finance/reports" className="text-rose-500 hover:text-rose-600 text-sm font-medium flex items-center">
              View All <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <FileText size={48} className="mb-4 opacity-20" />
            <p>Activity logs will populate as transactions are recorded.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default FinanceDashboard;
