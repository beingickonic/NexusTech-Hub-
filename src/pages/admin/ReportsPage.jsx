import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Filter, Calendar, ShoppingCart, Users, Package, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';
import { jsPDF } from 'jspdf';

const REPORT_TYPES = [
  { value: 'sales', label: 'Sales Report', icon: TrendingUp, desc: 'Orders and revenue data' },
  { value: 'customers', label: 'Customers Report', icon: Users, desc: 'Customer profiles' },
  { value: 'products', label: 'Products Report', icon: Package, desc: 'Product catalog and inventory' },
  { value: 'orders', label: 'Orders Report', icon: ShoppingCart, desc: 'All orders with items' },
];

const DATE_RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'this_week', label: 'This Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'this_year', label: 'This Year' },
];

const downloadBlob = (content, filename, type) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const toCsv = (rows) => {
  if (!rows?.length) return '';
  const headers = Object.keys(rows[0]);
  const body = rows.map((row) =>
    headers.map((h) => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(',')
  );
  return [headers.join(','), ...body].join('\n');
};

const generatePdf = (data, title) => {
  const doc = new jsPDF({ orientation: 'landscape' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const colWidth = (pageWidth - margin * 2) / Math.max(Object.keys(data[0] || {}).length, 1);

  doc.setFontSize(14);
  doc.text(title, margin, 12);
  doc.setFontSize(8);

  const headers = Object.keys(data[0] || {});
  let y = 20;

  doc.setFont(undefined, 'bold');
  headers.forEach((h, i) => {
    doc.text(String(h), margin + i * colWidth, y);
  });
  y += 6;
  doc.setFont(undefined, 'normal');

  data.forEach((row, ri) => {
    if (y > 180) { doc.addPage(); y = 10; }
    headers.forEach((h, i) => {
      const val = String(row[h] ?? '');
      doc.text(val.length > 30 ? val.slice(0, 30) + '…' : val, margin + i * colWidth, y);
    });
    y += 5;
  });

  doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
};

const generateExcel = (data, title) => {
  const headers = Object.keys(data[0] || {});
  const rows = data.map((row) => headers.map((h) => row[h] ?? '').join('\t'));
  const html = ['<html><body><table>',
    `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`,
    ...rows.map(r => `<tr><td>${r.split('\t').join('</td><td>')}</td></tr>`),
    '</table></body></html>'
  ].join('');
  downloadBlob(html, `${title.replace(/\s+/g, '_')}.xls`, 'application/vnd.ms-excel');
};

const AdminReportsPage = () => {
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState('this_month');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async (format) => {
    setIsGenerating(true);
    const loadingToast = toast.loading('Generating report...');

    try {
      const res = await adminService.getReports(reportType);
      if (!res.success || !res.data?.length) {
        toast.error('No data available for this report', { id: loadingToast });
        return;
      }

      const data = res.data;
      const reportLabel = REPORT_TYPES.find(r => r.value === reportType)?.label || reportType;
      const filename = `${reportLabel.toLowerCase().replace(/\s+/g, '_')}_${dateRange}`;

      if (format === 'csv') {
        downloadBlob(toCsv(data), `${filename}.csv`, 'text/csv;charset=utf-8;');
      } else if (format === 'pdf') {
        generatePdf(data, reportLabel);
      } else if (format === 'excel') {
        generateExcel(data, reportLabel);
      }

      toast.success(`${reportLabel} downloaded as ${format.toUpperCase()}`, { id: loadingToast });
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate report', { id: loadingToast });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="animate-fade-in pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-nexus-heading mb-2">Store Reports</h1>
        <p className="text-nexus-muted">Generate and download business reports from live data.</p>
      </div>

      <div className="bg-white/80 dark:bg-nexus-card/80 backdrop-blur-md rounded-2xl border border-nexus-border shadow-sm overflow-hidden p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-nexus-heading mb-4">Report Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-nexus-muted mb-1">Report Type</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full bg-nexus-surface border border-nexus-border rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-nexus-primary/50 outline-none text-nexus-heading"
                  >
                    {REPORT_TYPES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-nexus-muted mb-1 flex items-center gap-1"><Calendar size={14} /> Date Range</label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full bg-nexus-surface border border-nexus-border rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-nexus-primary/50 outline-none text-nexus-heading"
                  >
                    {DATE_RANGES.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 bg-nexus-info/10 dark:bg-nexus-info/20 border border-nexus-info/10 dark:border-nexus-info/80 rounded-xl flex items-start gap-3">
              <Filter className="text-nexus-info mt-0.5 shrink-0" size={18} />
              <p className="text-sm text-nexus-info">
                Data is pulled dynamically from the live Supabase database. The generated file is not stored on the server.
              </p>
            </div>
          </div>

          <div className="bg-nexus-surface/50 rounded-2xl p-6 border border-nexus-border flex flex-col justify-center">
            <h3 className="text-lg font-bold text-nexus-heading mb-6 text-center">Export Options</h3>
            <div className="space-y-3">
              <button
                onClick={() => generateReport('pdf')}
                disabled={isGenerating}
                className="w-full flex items-center justify-between p-4 bg-nexus-card hover:border-nexus-error border border-nexus-border rounded-xl transition-all group disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-nexus-error/5 text-nexus-error rounded-lg group-hover:bg-nexus-error group-hover:text-white transition-colors"><FileText size={20} /></div>
                  <div className="text-left">
                    <div className="font-semibold text-nexus-heading">PDF Document</div>
                    <div className="text-xs text-nexus-textSecondary">Best for sharing &amp; printing</div>
                  </div>
                </div>
                <Download size={18} className="text-nexus-textSecondary group-hover:text-nexus-error" />
              </button>

              <button
                onClick={() => generateReport('excel')}
                disabled={isGenerating}
                className="w-full flex items-center justify-between p-4 bg-nexus-card hover:border-nexus-success border border-nexus-border rounded-xl transition-all group disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-nexus-success/5 text-nexus-success rounded-lg group-hover:bg-nexus-success group-hover:text-white transition-colors"><FileSpreadsheet size={20} /></div>
                  <div className="text-left">
                    <div className="font-semibold text-nexus-heading">Excel Workbook</div>
                    <div className="text-xs text-nexus-textSecondary">Best for deep analysis (.xls)</div>
                  </div>
                </div>
                <Download size={18} className="text-nexus-textSecondary group-hover:text-nexus-success" />
              </button>

              <button
                onClick={() => generateReport('csv')}
                disabled={isGenerating}
                className="w-full flex items-center justify-between p-4 bg-nexus-card hover:border-nexus-info border border-nexus-border rounded-xl transition-all group disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-nexus-info/10 text-nexus-info rounded-lg group-hover:bg-nexus-info group-hover:text-white transition-colors"><FileSpreadsheet size={20} /></div>
                  <div className="text-left">
                    <div className="font-semibold text-nexus-heading">CSV Data</div>
                    <div className="text-xs text-nexus-textSecondary">Raw data for importing</div>
                  </div>
                </div>
                <Download size={18} className="text-nexus-textSecondary group-hover:text-nexus-info" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;