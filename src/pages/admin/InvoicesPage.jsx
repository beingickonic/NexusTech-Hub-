import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, FileText, Search } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { formatCurrency } from '../../utils/currency';

const InvoicesPage = () => {
  const [search, setSearch] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchInvoices = async (page = 1, query = search) => {
    try {
      setIsLoading(true);
      const response = await adminService.getInvoices({ page, search: query });
      if (response.status === 'success') {
        setInvoices(response.data);
        setMeta(response.meta);
      }
    } catch (error) {
      console.error('Failed to fetch invoices', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchInvoices(1, search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= meta.totalPages) fetchInvoices(page, search);
  };

  const handleDownload = (invoice) => {
    if (!invoice.pdf_url) {
      alert('This invoice has not generated a downloadable PDF yet.');
      return;
    }
    const win = window.open(invoice.pdf_url, '_blank', 'noopener,noreferrer');
    // Capacitor WebView blocks popups (window.open returns null) — fall back to
    // navigating to the PDF so Android opens/downloads it in the system viewer.
    if (!win) window.location.href = invoice.pdf_url;
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-nexus-heading mb-2">Invoices</h1>
          <p className="text-nexus-muted">View customer invoices and download generated PDF receipts.</p>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-nexus-card/80 backdrop-blur-md rounded-2xl border border-nexus-border shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-nexus-border">
          <div className="relative w-full sm:max-w-md flex items-center">
            <input
              type="text"
              placeholder="Search invoice number..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full bg-nexus-surface border border-nexus-border rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-nexus-primary/50 outline-none transition-all placeholder:text-nexus-textSecondary text-nexus-heading"
            />
            <Search size={18} className="absolute left-3 text-nexus-textSecondary" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-nexus-surface/50 text-nexus-muted text-xs uppercase tracking-wider font-semibold border-b border-nexus-border">
                <th className="px-6 py-4">Invoice</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nexus-border dark:divide-nexus-card/50 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-nexus-textSecondary">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nexus-primary"></div>
                    </div>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-nexus-muted">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-nexus-surface/50 dark:hover:bg-nexus-hover/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-nexus-primary/15 dark:bg-nexus-primary/20 text-nexus-primary flex items-center justify-center">
                          <FileText size={18} />
                        </div>
                        <span className="font-semibold text-nexus-heading">
                          {invoice.invoice_number || `INV-${String(invoice.id).slice(0, 8)}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-nexus-muted">{invoice.customer}</td>
                    <td className="px-6 py-4 text-nexus-muted">{String(invoice.order_id).slice(0, 8)}</td>
                    <td className="px-6 py-4 font-semibold text-nexus-heading">{formatCurrency(invoice.total_amount)}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize bg-nexus-success/5 text-nexus-success border border-nexus-success/20 dark:bg-nexus-success/10 dark:text-nexus-success dark:border-nexus-success/20">
                        {invoice.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-nexus-muted">
                      {new Date(invoice.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDownload(invoice)}
                        className="inline-flex items-center justify-center p-2 text-nexus-textSecondary hover:text-nexus-primary hover:bg-nexus-primary/10 dark:hover:bg-nexus-primary/10 rounded-lg transition-colors"
                        title="Download invoice"
                      >
                        <Download size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-nexus-border flex items-center justify-between text-sm text-nexus-muted">
          <div>Showing page {meta.page} of {meta.totalPages || 1} ({meta.total} total items)</div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(meta.page - 1)}
              disabled={meta.page === 1}
              className="p-1.5 rounded-md hover:bg-nexus-surface dark:hover:bg-nexus-hover disabled:opacity-50 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => handlePageChange(meta.page + 1)}
              disabled={meta.page >= meta.totalPages}
              className="p-1.5 rounded-md hover:bg-nexus-surface dark:hover:bg-nexus-hover disabled:opacity-50 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicesPage;
