import React from 'react';

const RecentOrdersWidget = ({ orders = [] }) => {
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'paid':
      case 'delivered': return 'bg-success/10 text-success border-success/20';
      case 'pending': return 'bg-warning/10 text-warning border-warning/20';
      case 'failed':
      case 'cancelled': return 'bg-danger/10 text-danger border-danger/20';
      default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">Latest Orders</h3>
        <button className="text-xs md:text-sm font-medium text-primary hover:text-primary/80 transition-colors">View All</button>
      </div>
      <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0 scrollbar-hide">
        <table className="w-full text-left text-sm whitespace-nowrap min-w-[500px]">
          <thead className="text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="pb-3 font-medium">Order ID</th>
              <th className="pb-3 font-medium">Customer</th>
              <th className="pb-3 font-medium">Amount</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {orders.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-slate-500 dark:text-slate-400">No recent orders found.</td>
              </tr>
            ) : (
              orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 text-slate-900 dark:text-white font-medium">#{order.id.slice(0, 8).toUpperCase()}</td>
                  <td className="py-4 text-slate-600 dark:text-slate-300">{order.profiles?.email || 'Guest'}</td>
                  <td className="py-4 text-slate-900 dark:text-white font-semibold">KES {order.total_amount?.toLocaleString() || 0}</td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                      {order.status || 'Pending'}
                    </span>
                  </td>
                  <td className="py-4 text-slate-500 dark:text-slate-400">{new Date(order.created_at).toLocaleDateString()}</td>
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
