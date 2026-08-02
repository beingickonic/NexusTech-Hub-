import React, { useState, useEffect } from 'react';
import { financeService } from '../../services/financeService';
import {
  DollarSign, CreditCard, Receipt, TrendingUp, TrendingDown,
  Plus, ArrowRight, ShieldCheck, CheckCircle, XCircle, Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';

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
    return (
      <div className="space-y-6">
        <Skeleton variant="rectangular" className="h-20 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton variant="rectangular" className="h-32" />
          <Skeleton variant="rectangular" className="h-32" />
          <Skeleton variant="rectangular" className="h-32" />
          <Skeleton variant="rectangular" className="h-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Finance Dashboard"
        subtitle="Overview of financial performance"
        actions={
          <div className="flex gap-3">
            <Link to="/finance/approvals">
              <Button variant="success" size="sm" className="gap-2">
                <ShieldCheck size={16} /> {stats.pendingApprovals} Pending
              </Button>
            </Link>
            <Link to="/finance/invoices">
              <Button variant="secondary" size="sm" className="gap-2">
                <Plus size={16} /> New Invoice
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Pending Approvals"
          value={stats.pendingApprovals}
          icon={Clock}
          description={`Revenue: KSh ${Number(stats.pendingRevenue).toLocaleString()}`}
        />
        <StatCard
          title="Approved Today"
          value={stats.approvedToday}
          icon={CheckCircle}
          trendType="up"
        />
        <StatCard
          title="Rejected Today"
          value={stats.rejectedToday}
          icon={XCircle}
          trendType="down"
        />
        <StatCard
          title="Total Approved Revenue"
          value={`KSh ${Number(stats.approvedRevenue).toLocaleString()}`}
          icon={DollarSign}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-bold text-nexus-heading mb-4">Quick Actions</h2>
          {[
            { title: 'Review Approvals', desc: `${stats.pendingApprovals} payments awaiting approval`, icon: ShieldCheck, to: '/finance/approvals' },
            { title: 'Record Payment', desc: 'Log an incoming customer payment', icon: CreditCard, to: '/finance/payments' },
            { title: 'Generate Report', desc: 'View financial reports', icon: TrendingUp, to: '/finance/reports' },
          ].map((action, i) => (
            <Link key={i} to={action.to} className="block group">
              <Card className="flex items-center justify-between p-4 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-nexus-primary/10 text-nexus-primary rounded-xl group-hover:scale-110 transition-transform">
                    <action.icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-nexus-heading">{action.title}</h3>
                    <p className="text-sm text-nexus-muted">{action.desc}</p>
                  </div>
                </div>
                <ArrowRight size={20} className="text-nexus-muted group-hover:text-nexus-primary group-hover:translate-x-1 transition-all" />
              </Card>
            </Link>
          ))}
        </div>

        <Card className="lg:col-span-2 p-6" hoverElevation={false}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-nexus-heading">Pending Approvals</h2>
            <Link to="/finance/approvals" className="text-nexus-primary hover:underline text-sm font-medium flex items-center">
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
                      className="flex items-center justify-between gap-4 p-3 rounded-xl bg-nexus-surface/50 hover:bg-nexus-primary/10 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-nexus-primary/10 text-nexus-primary rounded-lg flex-shrink-0">
                          <Clock size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-nexus-heading truncate">
                            {order.order_number || `Order #${order.id}`}
                          </p>
                          <p className="text-xs text-nexus-muted truncate">
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
                        <ArrowRight size={16} className="text-nexus-muted group-hover:text-nexus-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              title="No pending approvals"
              description="There are currently no finance approvals waiting for review."
              icon={CheckCircle}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default FinanceDashboard;
