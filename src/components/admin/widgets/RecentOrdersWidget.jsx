import React from 'react';

const RecentOrdersWidget = ({ orders = [] }) => {
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'paid':
      case 'delivered': return 'bg-success/10 text-success border-success/20';
      case 'pending': return 'bg-warning/10 text-warning border-warning/20';
      case 'failed':
      case 'cancelled': return 'bg-danger/10 text-danger border-danger/20';
      default: return 'bg-nexus-surface text-nexus-muted dark:bg-nexus-card dark:text-nexus-textSecondary border-nexus-border';
    }
  };

  return (
    <div className="bg-nexus-card backdrop-blur-md p-4 md:p-6 rounded-xl md:rounded-2xl border border-nexus-border shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="text-base md:text-lg font-bold text-nexus-heading">Latest Orders</h3>
        <button className="text-xs md:text-sm font-medium text-primary hover:text-primary/80 transition-colors">View All</button>
      </div>
      <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0 scrollbar-hide">
        <table className="w-full text-left text-sm whitespace-nowrap min-w-[500px]">
          <thead className="text-nexus-muted border-b border-nexus-border">
            <tr>
              <th className="pb-3 font-medium">Order ID</th>
              <th className="pb-3 font-medium">Customer</th>
              <th className="pb-3 font-medium">Amount</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nexus-border dark:divide-nexus-card">
            {orders.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-nexus-muted">No recent orders found.</td>
              </tr>
            ) : (
              orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-nexus-surface dark:hover:bg-nexus-hover/50 transition-colors">
                  <td className="py-4 text-nexus-heading font-medium">#{order.id.slice(0, 8).toUpperCase()}</td>
                  <td className="py-4 text-nexus-muted">{order.profiles?.email || 'Guest'}</td>
                  <td className="py-4 text-nexus-heading font-semibold">KES {order.total_amount?.toLocaleString() || 0}</td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                      {order.status || 'Pending'}
                    </span>
                  </td>
                  <td className="py-4 text-nexus-muted">{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrdersWidget;
