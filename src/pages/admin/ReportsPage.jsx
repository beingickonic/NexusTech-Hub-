import ReportCard from '../../components/admin/ReportCard';
import { DollarSign, ShoppingBag, Users, Package, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { adminService } from '../../services/adminService';

const ReportsPage = () => {

  const downloadCSV = (data, filename) => {
    if (!data || !data.length) {
      alert("No data available to export");
      return;
    }
    
    // Extract headers
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    // Header row
    csvRows.push(headers.join(','));
    
    // Data rows
    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header];
        // Escape quotes and wrap in quotes
        const escaped = ('' + val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async (type, filename) => {
    try {
      const res = await adminService.getReports(type);
      if (res.status === 'success') {
        downloadCSV(res.data, filename);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to export data');
    }
  };

  const reports = [
    {
      title: 'Sales & Revenue Overview',
      description: 'Comprehensive breakdown of total sales, revenue trends, and average order value.',
      icon: DollarSign,
      dateRange: 'All Time',
      color: { bg: 'bg-green-100 dark:bg-green-500/20', text: 'text-green-600 dark:text-green-400' },
      onExport: () => handleExport('revenue', 'sales_revenue_report')
    },
    {
      title: 'Order Fulfillment',
      description: 'Analysis of order processing times, shipping delays, and completion rates.',
      icon: ShoppingBag,
      dateRange: 'This Week',
      color: { bg: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400' },
      onExport: () => alert('Order Fulfillment export requires additional backend logic.')
    },
    {
      title: 'Customer Growth & Retention',
      description: 'Metrics on new user registrations, active users, and repeat purchase rates.',
      icon: Users,
      dateRange: 'All Time',
      color: { bg: 'bg-purple-100 dark:bg-purple-500/20', text: 'text-purple-600 dark:text-purple-400' },
      onExport: () => handleExport('customers', 'customer_growth_report')
    },
    {
      title: 'Inventory Valuation',
      description: 'Current total value of in-stock items categorized by brand and product type.',
      icon: Package,
      dateRange: 'Current',
      color: { bg: 'bg-orange-100 dark:bg-orange-500/20', text: 'text-orange-600 dark:text-orange-400' },
      onExport: async () => {
        try {
          const res = await adminService.getInventory({ limit: 1000 });
          if (res.status === 'success') {
            downloadCSV(res.data, 'inventory_valuation_report');
          }
        } catch(e) {
          console.error(e);
        }
      }
    },
    {
      title: 'Product Performance',
      description: 'Best-selling and worst-performing products based on sales volume.',
      icon: TrendingUp,
      dateRange: 'Year to Date',
      color: { bg: 'bg-teal-100 dark:bg-teal-500/20', text: 'text-teal-600 dark:text-teal-400' },
      onExport: () => handleExport('sales', 'product_performance_report')
    },
    {
      title: 'Low Stock Alerts',
      description: 'List of products currently below the minimum stock threshold requiring reorder.',
      icon: AlertTriangle,
      dateRange: 'Real-time',
      color: { bg: 'bg-red-100 dark:bg-red-500/20', text: 'text-red-600 dark:text-red-400' },
      onExport: async () => {
        try {
          const res = await adminService.getInventory({ filter: 'low', limit: 500 });
          if (res.status === 'success') {
            downloadCSV(res.data, 'low_stock_alerts_report');
          }
        } catch(e) {
          console.error(e);
        }
      }
    }
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Reports & Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400">Export detailed insights and metrics for your business.</p>
        </div>
        <div className="flex gap-2">
          <select className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-lg py-2.5 px-4 outline-none focus:ring-2 focus:ring-orange-500/50">
            <option>All Time</option>
            <option>Last 30 Days</option>
            <option>This Quarter</option>
            <option>This Year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report, idx) => (
          <motion.div
            key={report.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <ReportCard {...report} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ReportsPage;
