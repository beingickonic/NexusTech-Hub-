import { useState, useEffect } from 'react';
import { financeService } from '../../services/financeService';
import {
  DollarSign, CreditCard, Receipt, TrendingUp, TrendingDown,
  Plus, ArrowRight, ShieldCheck, CheckCircle, XCircle, Clock, AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

const StatCard = ({ title, value, icon: Icon, trend, isCurrency }) => (
  <div className="bg-white/10 dark:bg-nexus-card backdrop-blur-lg border border-white/20 dark:border-nexus-border/50 p-6 rounded-2xl shadow-xl">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-nexus-success/20 text-nexus-success rounded-xl">
        <Icon size={24} />
      </div>
      {trend !== undefined && (
        <span className={`text-sm font-medium flex items-center ${trend >= 0 ? 'text-nexus-success' : 'text-nexus-error'}`}>
          {trend >= 0 ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <h3 className="text-nexus-muted text-sm font-medium">{title}</h3>
    <p className={`font-bold text-nexus-heading mt-1 ${isCurrency !== false ? 'text-2xl' : 'text-3xl'}`}>
      {isCurrency !== false ? `KSh ${Number(value).toLocaleString()}` : Number(value).toLocaleString()}
    </p>
  </div>
);

const FinanceDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pendingApprovals: 0, approvedToday: 0, rejectedToday: 0,
    pendingRevenue: 0, approvedRevenue: 0,
    totalRevenue: 0, cashReceived: 0, outstandingReceivables: 0,
    totalExpenses: 0, cashBalance: 0, pendingExpenses: 0, overdueInvoices: 0
  });
  const [loading, setLoading] = useState(true);
  const [pendingOrders, setPendingOrders] = useState([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const result = await financeService.getDashboardStats();
      if (result.success) setStats(prev => ({ ...prev, ...result.stats }));
      const approvals = await financeService.getPendingApprovals();
      if (approvals.success) setPendingOrders(approvals.data || []);
    } catch (error) {
      console.error("Error loading finance stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-nexus-textSecondary">Loading Dashboard...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-nexus-heading">Finance Dashboard</h1>
          <p className="text-nexus-textSecondary mt-1">Overview of financial performance</p>
        </div>
        <div className="flex gap-3">
          <Link to="/finance/approvals" className="bg-nexus-success hover:bg-nexus-success text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors text-sm font-medium">
            <ShieldCheck size={16} /> {stats.pendingApprovals} Pending
          </Link>
          <Link to="/finance/invoices" className="bg-nexus-card text-nexus-text border border-nexus-border hover:bg-nexus-surface dark:hover:bg-nexus-hover px-4 py-2 rounded-xl flex items-center gap-2 transition-colors text-sm font-medium">
            <Plus size={16} /> New Invoice
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-info/10 dark:bg-info/100/10 border border-info/20 dark:border-info/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Clock size={20} className="text-info" />
          </div>
          <p className="text-3xl font-bold text-info dark:text-info">{stats.pendingApprovals}</p>
          <p className="text-sm text-info dark:text-info mt-1">Pending Approvals</p>
          <p className="text-xs text-info dark:text-info/60 mt-1">
            Revenue: KSh {Number(stats.pendingRevenue).toLocaleString()}
          </p>
          <Link to="/finance/approvals" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-info dark:text-info hover:underline">
            Review <ArrowRight size={14} />
          </Link>
        </div>
        <div className="bg-nexus-success/10 dark:bg-nexus-success/10 border border-nexus-success/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle size={20} className="text-nexus-success" />
          </div>
          <p className="text-3xl font-bold text-nexus-success dark:text-nexus-success">{stats.approvedToday}</p>
          <p className="text-sm text-nexus-success dark:text-nexus-success mt-1">Approved Today</p>
        </div>
        <div className="bg-nexus-error/5 dark:bg-nexus-error/10 border border-nexus-error/20 dark:border-nexus-error/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <XCircle size={20} className="text-nexus-error" />
          </div>
          <p className="text-3xl font-bold text-nexus-error">{stats.rejectedToday}</p>
          <p className="text-sm text-nexus-error dark:text-nexus-error mt-1">Rejected Today</p>
        </div>
        <div className="bg-nexus-info/10 dark:bg-nexus-info/10 border border-nexus-info/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign size={20} className="text-nexus-info" />
          </div>
          <p className="text-2xl font-bold text-nexus-info">
            KSh {Number(stats.approvedRevenue).toLocaleString()}
          </p>
          <p className="text-sm text-nexus-info dark:text-nexus-info mt-1">Total Approved Revenue</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-bold text-nexus-heading mb-4">Quick Actions</h2>
          {[
            { title: 'Review Approvals', desc: `${stats.pendingApprovals} payments awaiting approval`, icon: ShieldCheck, to: '/finance/approvals' },
            { title: 'Record Payment', desc: 'Log an incoming customer payment', icon: CreditCard, to: '/finance/payments' },
            { title: 'Generate Report', desc: 'View financial reports', icon: TrendingUp, to: '/finance/reports' },
          ].map((action, i) => (
            <Link key={i} to={action.to} className="group flex items-center justify-between p-4 bg-white/50 dark:bg-nexus-card backdrop-blur-md border border-white/20 dark:border-nexus-border/50 rounded-2xl hover:bg-white/80 dark:hover:bg-nexus-hover/80 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-nexus-success/10 dark:bg-nexus-success/20 text-nexus-success rounded-xl group-hover:scale-110 transition-transform">
                  <action.icon size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-nexus-heading">{action.title}</h3>
                  <p className="text-sm text-nexus-textSecondary">{action.desc}</p>
                </div>
              </div>
              <ArrowRight size={20} className="text-nexus-textSecondary group-hover:text-nexus-success group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>

        <div className="lg:col-span-2 bg-white/10 dark:bg-nexus-card backdrop-blur-lg border border-white/20 dark:border-nexus-border/50 p-6 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-nexus-heading">Pending Approvals</h2>
            <Link to="/finance/approvals" className="text-nexus-success hover:text-nexus-success text-sm font-medium flex items-center">
              View All <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          {pendingOrders.length > 0 ? (
            <ul className="space-y-3">
              {pendingOrders.slice(0, 6).map((order) => {
                const customer = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles;
                return (
                  <li key={order.id}>
                    <Link
                      to={`/finance/approvals?order=${order.id}`}
                      className="flex items-center justify-between gap-4 p-3 rounded-xl bg-white/5 dark:bg-white/5 hover:bg-nexus-success/10 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-nexus-gold/10 text-nexus-gold rounded-lg flex-shrink-0">
                          <Clock size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-nexus-heading truncate">
                            {order.order_number || `Order #${order.id}`}
                          </p>
                          <p className="text-xs text-nexus-textSecondary truncate">
                            {customer?.full_name || customer?.phone || 'Customer'}
                            {' · '}
                            {new Date(order.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm font-bold text-nexus-heading">
                          KSh {Number(order.total_amount).toLocaleString()}
                        </span>
                        <ArrowRight size={16} className="text-nexus-textSecondary group-hover:text-nexus-success group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-nexus-textSecondary">
              <CheckCircle size={48} className="mb-4 opacity-20" />
              <p>No orders awaiting approval.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
