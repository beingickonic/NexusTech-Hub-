import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import paymentService from '../../services/paymentService';
import orderService from '../../services/orderService';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { ArrowLeft, Printer, Download, Mail, Loader2, FileText, ShieldCheck, CheckCircle2 } from 'lucide-react';

const InvoicePage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [sentEmail, setSentEmail] = useState(false);
  const printRef = useRef();

  useEffect(() => {
    const load = async () => {
      const res = await paymentService.getOrderInvoice(orderId);
      if (res.success) {
        setInvoice(res.data);
      }
      setLoading(false);
    };
    load();
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setExporting('pdf');
    try {
      const el = printRef.current;
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 20;
      }
      pdf.save(`${invoice.invoice_number}.pdf`);
    } catch (err) {
      console.error('PDF export failed', err);
      alert('Failed to generate PDF.');
    }
    setExporting(null);
  };

  const handleEmail = () => {
    setExporting('email');
    const subject = encodeURIComponent(`Invoice ${invoice.invoice_number} from NexusTech Hub`);
    const body = encodeURIComponent(
      `Dear ${invoice.customer_name},\n\nThank you for shopping with NexusTech Hub.\n\nYour invoice ${invoice.invoice_number} for order #${invoice.order_id} has been generated.\n\nTransaction ID: ${invoice.transaction_id}\nAmount: KES ${Number(invoice.total_amount).toLocaleString()}\n\nYou can download a copy from your account at any time.\n\nRegards,\nNexusTech Hub`
    );
    setTimeout(() => {
      window.location.href = `mailto:${invoice.customer_email || ''}?subject=${subject}&body=${body}`;
      setSentEmail(true);
      setExporting(null);
    }, 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex justify-center bg-nexus-surface">
        <Loader2 className="w-8 h-8 text-nexus-primary animate-spin" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center bg-nexus-surface">
        <FileText size={40} className="text-nexus-muted mb-3" />
        <p className="text-nexus-textSecondary">Invoice not found. This order may not have been paid yet.</p>
        <div className="flex gap-4 mt-4">
          <Link to={`/orders/${orderId}`} className="text-nexus-primary hover:underline">Back to Order</Link>
          <button onClick={() => navigate(`/payment/mock/${orderId}`)} className="text-nexus-primary hover:underline">
            Pay Now
          </button>
        </div>
      </div>
    );
  }

  const items = invoice.items || [];
  const subtotal = Number(invoice.subtotal ?? 0);
  const shippingFee = Number(invoice.shipping_fee ?? 0);
  const tax = Number(invoice.tax ?? 0);
  const total = Number(invoice.total_amount ?? 0);
  const fmt = (n) => `KES ${Number(n || 0).toLocaleString()}`;

  return (
    <div className="min-h-screen bg-nexus-surface pt-28 pb-20 px-4 print:pt-0 print:pb-0 print:bg-white">
      <div className="max-w-3xl mx-auto">

        {/* Actions Bar (Hidden on Print) */}
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6 print:hidden">
          <Link to={`/orders/${orderId}`} className="flex items-center text-nexus-textSecondary hover:text-nexus-heading transition-colors text-sm">
            <ArrowLeft size={18} className="mr-2" /> Back to Order
          </Link>
          <div className="flex flex-wrap gap-3">
            <button onClick={handlePrint} className="flex items-center px-4 py-2 bg-nexus-surface dark:bg-nexus-card text-nexus-text border border-nexus-border rounded-lg hover:bg-nexus-muted dark:hover:bg-nexus-hover transition-colors text-sm font-medium">
              <Printer size={16} className="mr-2" /> Print
            </button>
            <button onClick={handleDownloadPdf} disabled={!!exporting} className="flex items-center px-4 py-2 bg-nexus-primary text-white rounded-lg hover:bg-nexus-primary-hover transition-colors text-sm font-medium disabled:opacity-70">
              {exporting === 'pdf' ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Download size={16} className="mr-2" />}
              {exporting === 'pdf' ? 'Generating...' : 'Download PDF'}
            </button>
            <button onClick={handleEmail} disabled={!!exporting} className="flex items-center px-4 py-2 bg-nexus-dark-navy dark:bg-white text-white dark:text-nexus-navy rounded-lg hover:opacity-90 transition-colors text-sm font-medium disabled:opacity-70">
              {exporting === 'email' ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Mail size={16} className="mr-2" />}
              Email Invoice
            </button>
          </div>
        </div>

        {sentEmail && (
          <div className="mb-4 p-4 bg-nexus-success/10 border border-nexus-success/30 rounded-xl text-sm text-nexus-success flex items-center gap-2 print:hidden">
            <CheckCircle2 size={18} /> Email client opened — you can send the invoice to {invoice.customer_email || 'your email'}.
          </div>
        )}

        {/* Invoice Card */}
        <div
          ref={printRef}
          className="bg-white rounded-3xl shadow-lg border border-nexus-border overflow-hidden print:shadow-none print:border-none"
        >
          {/* Header */}
          <div className="relative px-8 py-10 text-white overflow-hidden bg-gradient-to-br from-nexus-dark-navy to-nexus-navy">
            <div className="absolute top-0 right-0 w-64 h-64 bg-nexus-primary rounded-full blur-3xl opacity-25 -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-nexus-gold rounded-full blur-3xl opacity-20 -ml-20 -mb-20"></div>
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">NexusTech Hub</h1>
                <p className="text-white/60 text-xs mt-1">Nairobi, Kenya · support@nexustechhub.com</p>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-xs uppercase tracking-wider font-medium">Invoice</p>
                <p className="text-2xl font-mono font-bold mt-1">{invoice.invoice_number}</p>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-10 text-nexus-dark-navy">
            <div className="flex flex-col sm:flex-row justify-between gap-6 mb-8 pb-8 border-b border-gray-200">
              <div>
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Billed To</p>
                <h3 className="font-bold text-lg">{invoice.customer_name}</h3>
                {invoice.customer_email && <p className="text-sm text-gray-500 mt-1">{invoice.customer_email}</p>}
                {invoice.customer_phone && <p className="text-sm text-gray-500">{invoice.customer_phone}</p>}
                {invoice.shipping_address && (
                  <p className="text-sm text-gray-500 mt-1">
                    {invoice.shipping_address}
                    {invoice.shipping_city && `, ${invoice.shipping_city}`}
                    {invoice.shipping_postal_code && ` ${invoice.shipping_postal_code}`}
                  </p>
                )}
              </div>
              <div className="sm:text-right space-y-1 text-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Details</p>
                <p className="font-medium"><span className="text-gray-500">Order:</span> #{invoice.order_id}</p>
                <p className="font-medium"><span className="text-gray-500">Date:</span> {invoice.payment_date ? new Date(invoice.payment_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date(invoice.created_at).toLocaleDateString()}</p>
                <p className="font-medium"><span className="text-gray-500">Txn ID:</span> <span className="font-mono text-xs">{invoice.transaction_id}</span></p>
                <p className="font-medium"><span className="text-gray-500">Receipt:</span> <span className="font-mono">{invoice.receipt_number}</span></p>
                <p className="font-medium"><span className="text-gray-500">Status:</span> <span className="text-emerald-600 font-bold">PAID</span></p>
              </div>
            </div>

            <table className="w-full mb-8">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b-2 border-gray-200">
                  <th className="pb-3">Description</th>
                  <th className="pb-3 text-center">Qty</th>
                  <th className="pb-3 text-right">Unit Price</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-3 font-medium">{item.product_name}</td>
                    <td className="py-3 text-center">{item.quantity}</td>
                    <td className="py-3 text-right">{fmt(item.price)}</td>
                    <td className="py-3 text-right font-medium">{fmt(item.line_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mb-8">
              <div className="w-full max-w-xs space-y-2 text-sm">
                <p className="flex justify-between"><span className="text-gray-500">Subtotal</span> <span className="font-medium">{fmt(subtotal)}</span></p>
                <p className="flex justify-between"><span className="text-gray-500">Shipping</span> <span className="font-medium">{fmt(shippingFee)}</span></p>
                <p className="flex justify-between"><span className="text-gray-500">Tax</span> <span className="font-medium">{fmt(tax)}</span></p>
                <div className="flex justify-between border-t-2 border-gray-200 pt-3">
                  <span className="font-bold text-gray-700">Total</span>
                  <span className="text-2xl font-bold text-nexus-primary">{fmt(total)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-nexus-primary/5 border border-nexus-primary/15">
              <ShieldCheck size={18} className="text-nexus-primary shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600 leading-relaxed">
                Payment method: <strong>{invoice.payment_method}</strong> · Verification code: <strong className="font-mono">{invoice.verification_code}</strong> ·
                Finance status: <strong>{invoice.finance_status}</strong>. This invoice was generated by NexusTech Hub and is awaiting finance approval before your items are processed.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-6 text-center text-sm text-gray-500 border-t border-gray-100">
            If you have any questions concerning this invoice, please contact <strong>support@nexustechhub.com</strong>
            <p className="mt-1 text-xs">Thank you for shopping with NexusTech Hub!</p>
          </div>
        </div>
      </div>

      <style type="text/css" media="print">
        {`
          @page { size: auto; margin: 0mm; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        `}
      </style>
    </div>
  );
};

export default InvoicePage;
