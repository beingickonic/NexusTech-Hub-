import { useState } from 'react';
import ReportCard from '../../components/admin/ReportCard';
import { DollarSign, ShoppingBag, Users, Package, TrendingUp, AlertTriangle, FileText, Table, Printer } from 'lucide-react';
import { motion } from 'framer-motion';
import { adminService } from '../../services/adminService';

const ReportsPage = () => {
  const [dateRange, setDateRange] = useState('all');
  const [exporting, setExporting] = useState('');

  // ─── CSV Export ─────────────────────────────────────────────────────────────
  const downloadCSV = (data, filename) => {
    if (!data || !data.length) { alert('No data available to export'); return; }
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    for (const row of data) {
      csvRows.push(headers.map(h => `"${('' + (row[h] ?? '')).replace(/"/g, '""')}"`).join(','));
    }
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${filename}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ─── PDF Export ─────────────────────────────────────────────────────────────
  const downloadPDF = async (data, filename, title) => {
    if (!data || !data.length) { alert('No data available to export'); return; }
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      const doc = new jsPDF({ orientation: 'landscape' });
      doc.setFontSize(16);
      doc.text(title || filename, 14, 20);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
      const headers = Object.keys(data[0]);
      autoTable(doc, {
        startY: 35,
        head: [headers],
        body: data.map(row => headers.map(h => String(row[h] ?? ''))),
        theme: 'grid',
        headStyles: { fillColor: [255, 114, 76], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        styles: { fontSize: 8 },
      });
      doc.save(`${filename}.pdf`);
    } catch (e) {
      console.error('PDF export error:', e);
      alert('PDF export failed. Please try CSV instead.');
    }
  };

  // ─── Excel Export ────────────────────────────────────────────────────────────
  const downloadExcel = async (data, filename) => {
    if (!data || !data.length) { alert('No data available to export'); return; }
    try {
      const XLSX = await import('xlsx');
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Report');
      XLSX.writeFile(wb, `${filename}.xlsx`);
    } catch (e) {
      console.error('Excel export error:', e);
      alert('Excel export failed. Please try CSV instead.');
    }
  };

  // ─── Generic Report Handler ──────────────────────────────────────────────────
  const handleExport = async (type, filename, format = 'csv', reportTitle = '') => {
    setExporting(filename + format);
    try {
      const res = await adminService.getReports(type);
      if (res.status === 'success' && res.data) {
        if (format === 'pdf') await downloadPDF(res.data, filename, reportTitle);
        else if (format === 'excel') await downloadExcel(res.data, filename);
        else downloadCSV(res.data, filename);
      } else {
        alert('No data available for this report.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to export data. Please try again.');
    } finally {
      setExporting('');
    }
  };

  const handleInventoryExport = async (filter, filename, format = 'csv') => {
    setExporting(filename + format);
    try {
      const res = await adminService.getInventory({ filter, limit: 1000 });
      if (res.status === 'success') {
        if (format === 'pdf') await downloadPDF(res.data, filename, 'Inventory Report');
        else if (format === 'excel') await downloadExcel(res.data, filename);
        else downloadCSV(res.data, filename);
      }
    } catch (e) { console.error(e); }
    finally { setExporting(''); }
  };

  const handleOrderFulfillmentExport = async (format = 'csv') => {
    setExporting('orders_fulfillment' + format);
    try {
      const res = await adminService.getReports('orders');
      if (res.status === 'success' && res.data) {
        // Enrich with fulfillment status
        const enriched = res.data.map(order => ({
          ...order,
          fulfillment_status: order.status === 'Delivered' ? 'Fulfilled'
            : order.status === 'Cancelled' ? 'Cancelled'
            : 'In Progress',
        }));
        if (format === 'pdf') await downloadPDF(enriched, 'orders_fulfillment', 'Order Fulfillment Report');
        else if (format === 'excel') await downloadExcel(enriched, 'orders_fulfillment');
        else downloadCSV(enriched, 'orders_fulfillment');
      }
    } catch (e) { console.error(e); }
    finally { setExporting(''); }
  };

  const reports = [
    {
      title: 'Sales & Revenue Overview',
      description: 'Comprehensive breakdown of total sales, revenue trends, and average order value.',
      icon: DollarSign,
      dateRange: 'All Time',
      color: { bg: 'bg-green-100 dark:bg-green-500/20', text: 'text-green-600 dark:text-green-400' },
      onExport: (fmt) => handleExport('revenue', 'sales_revenue_report', fmt, 'Sales & Revenue Report'),
    },
    {
      title: 'Order Fulfillment',
      description: 'Analysis of order processing, shipping statuses, and completion rates.',
      icon: ShoppingBag,
      dateRange: 'All Time',
      color: { bg: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400' },
      onExport: (fmt) => handleOrderFulfillmentExport(fmt),
    },
    {
      title: 'Customer Growth & Retention',
      description: 'Metrics on new registrations, active users, and repeat purchase rates.',
      icon: Users,
      dateRange: 'All Time',
      color: { bg: 'bg-purple-100 dark:bg-purple-500/20', text: 'text-purple-600 dark:text-purple-400' },
      onExport: (fmt) => handleExport('customers', 'customer_growth_report', fmt, 'Customer Growth Report'),
    },
    {
      title: 'Inventory Valuation',
      description: 'Current total value of in-stock items categorised by product type.',
      icon: Package,
      dateRange: 'Current',
      color: { bg: 'bg-orange-100 dark:bg-orange-500/20', text: 'text-orange-600 dark:text-orange-400' },
      onExport: (fmt) => handleInventoryExport(undefined, 'inventory_valuation_report', fmt),
    },
    {
      title: 'Product Performance',
      description: 'Best-selling and worst-performing products based on sales volume.',
      icon: TrendingUp,
      dateRange: 'Year to Date',
      color: { bg: 'bg-teal-100 dark:bg-teal-500/20', text: 'text-teal-600 dark:text-teal-400' },
      onExport: (fmt) => handleExport('sales', 'product_performance_report', fmt, 'Product Performance Report'),
    },
    {
      title: 'Low Stock Alerts',
      description: 'Products currently below the minimum stock threshold requiring reorder.',
      icon: AlertTriangle,
      dateRange: 'Real-time',
      color: { bg: 'bg-red-100 dark:bg-red-500/20', text: 'text-red-600 dark:text-red-400' },
      onExport: (fmt) => handleInventoryExport('low', 'low_stock_alerts', fmt),
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Reports & Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400">Export detailed insights and metrics. Choose CSV, PDF, or Excel.</p>
        </div>
        <select
          value={dateRange}
          onChange={e => setDateRange(e.target.value)}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-lg py-2.5 px-4 outline-none focus:ring-2 focus:ring-orange-500/50"
        >
          <option value="all">All Time</option>
          <option value="30d">Last 30 Days</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Export Format Legend */}
      <div className="flex items-center gap-6 mb-8 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm">
        <span className="text-slate-500 dark:text-slate-400 font-medium">Export formats:</span>
        <span className="flex items-center gap-1.5 text-slate-700 dark:text-gray-300"><Table size={14} className="text-green-500" /> CSV (spreadsheet)</span>
        <span className="flex items-center gap-1.5 text-slate-700 dark:text-gray-300"><Printer size={14} className="text-red-500" /> PDF (print-ready)</span>
        <span className="flex items-center gap-1.5 text-slate-700 dark:text-gray-300"><FileText size={14} className="text-blue-500" /> Excel (.xlsx)</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report, idx) => (
          <motion.div
            key={report.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col"
          >
            <div className={`w-12 h-12 rounded-xl ${report.color.bg} flex items-center justify-center mb-4`}>
              <report.icon size={22} className={report.color.text} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">{report.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 flex-1">{report.description}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-5">📅 {report.dateRange}</p>

            {/* Export buttons */}
            <div className="flex gap-2 flex-wrap">
              {[
                { fmt: 'csv', label: 'CSV', icon: Table, color: 'text-green-600 border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20' },
                { fmt: 'pdf', label: 'PDF', icon: Printer, color: 'text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20' },
                { fmt: 'excel', label: 'Excel', icon: FileText, color: 'text-blue-600 border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20' },
              ].map(({ fmt, label, icon: Icon, color }) => {
                const isLoading = exporting === (report.title.replace(/[^a-z]/gi, '_').toLowerCase() + fmt);
                return (
                  <button
                    key={fmt}
                    onClick={() => report.onExport(fmt)}
                    disabled={!!exporting}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all disabled:opacity-50 ${color} dark:border-opacity-30`}
                  >
                    <Icon size={12} />
                    {isLoading ? '...' : label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ReportsPage;
